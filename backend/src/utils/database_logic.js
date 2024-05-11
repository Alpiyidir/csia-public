const crypto = require("crypto");
const {
	find_student_from_email,
	find_teacher_from_email,
	find_person_from_email,
	find_enrollments_from_student_id,
	find_enrollments_from_quiz_id,
	find_student_from_id,
	find_enrollment_from_id,
	find_quiz_from_quiz_id_for_range,
	find_quiz_from_quiz_id,
} = require("./database_operations.js");
const db = require("../services/database.js");

const find_role_of_person_from_email = async (email) => {
	const student = await find_student_from_email(email);

	if (student !== null) {
		return { roleInfo: student, role: "student" };
	}

	const teacher = await find_teacher_from_email(email);

	if (teacher !== null) {
		return { roleInfo: teacher, role: "teacher" };
	}

	return { roleInfo: null, role: null };
};

const given_password_matches_db_password = async (form_password, email) => {
	const person = await find_person_from_email(email);

	if (person === null) {
		return false;
	}

	const hashed_form_password = crypto.createHash("sha256").update(form_password, "utf8").digest("hex");
	if (hashed_form_password === person.password) {
		return { person: person, match: true };
	} else {
		return { person: person, match: false };
	}
};

const find_quiz_from_enrollment_id = async (enrollmentId) => {
	const enrollment = await find_enrollment_from_id(enrollmentId);

	if (!enrollment) {
		return null;
	}

	const quiz = await find_quiz_from_quiz_id(enrollment.quizId);

	return quiz;
};

const find_quizzes_and_enrollments_from_student_id = async (studentId) => {
	const enrollments = await find_enrollments_from_student_id(studentId);

	if (!enrollments) {
		return null;
	}

	const quizzes = [];

	for (var i = 0; i < enrollments.length; i++) {
		quizzes.push(await find_quiz_from_quiz_id(enrollments[i].quizId));
	}

	return {
		quizzes,
		enrollments,
	};
};

const find_all_students_with_person = async () => {
	const students = await db.models.student.findAll();

	if (students.length === 0) {
		return null;
	}

	const studentWithPerson = [];
	for (var i = 0; i < students.length; i++) {
		const person = await find_person_from_email(students[i].personEmail);
		studentWithPerson.push({
			id: students[i].id,
			email: person.email,
			firstName: person.firstName,
			lastName: person.lastName,
		});
	}

	return studentWithPerson;
};

const find_students_from_quiz_id = async (quizId) => {
	const enrollments = await find_enrollment_from_quiz_id(quizId);

	if (enrollments.length === 0) {
		return null;
	}

	const studentIds = [];

	for (var i = 0; i < enrollments.length; i++) {
		studentIds.push(enrollments[i].studentId);
	}

	return await find_quizzes_from_quiz_ids(quizIds);
};

const find_enrollments_and_add_person_details_from_quiz_id = async (quizId) => {
	const enrollments = await find_enrollments_from_quiz_id(quizId);

	for (var i = 0; i < enrollments.length; i++) {
		const student = await find_student_from_id(enrollments[i].studentId);

		const person = await find_person_from_email(student.personEmail);

		enrollments[i].dataValues.firstName = person.firstName;
		enrollments[i].dataValues.lastName = person.lastName;
		enrollments[i].dataValues.email = person.email;
	}
	return enrollments;
};

const find_student_ids_from_student_emails = async (studentEmails) => {
	const studentIds = [];
	for (var i = 0; i < studentEmails.length; i++) {
		try {
			const student = await find_student_from_email(studentEmails[i]);

			studentIds.push(student.id);
		} catch (e) {
			console.log(e);
			throw new Error(e);
		}
	}
	return studentIds;
};

const find_students_with_ids = async (studentIds) => {
	const students = [];
	for (var i = 0; i < studentIds.length; i++) {
		try {
			const student = await find_student_from_id(studentIds[i]);

			students.push(student);
		} catch (e) {
			console.log(e);
			throw new Error(e);
		}
	}
	return students;
};

const find_timestamp_of_day_with_least_quizzes = async (startTimestamp, endTimestamp, studentIds, quizIdBeingEdited) => {
	// This rounds down both dates to the beginning of the day.
	const roundedStartTimestamp = new Date(startTimestamp.year, startTimestamp.month, startTimestamp.day).setHours(0, 0, 0, 0);
	const roundedEndTimestamp = new Date(endTimestamp.year, endTimestamp.month, endTimestamp.day).setHours(0, 0, 0, 0);

	const quizTimestamps = {};

	// Calculates timestamp for each day in the range given and stores them in quizDates list
	for (var timestamp = roundedStartTimestamp; timestamp <= roundedEndTimestamp; timestamp = new Date(timestamp).setHours(24)) {
		quizTimestamps[timestamp] = 0;
	}

	// Nested for loop to find student from studentIds, then find enrollments for each student,
	// then find the quiz from each enrollment and increment the index for quizTimestamps with the given timestamp
	for (var i = 0; i < studentIds.length; i++) {
		const enrollments = await find_enrollments_from_student_id(studentIds[i]);
		
		for (var j = 0; j < enrollments.length; j++) {
			const quiz = await find_quiz_from_quiz_id_for_range(
				enrollments[j].dataValues.quizId,
				roundedStartTimestamp,
				roundedEndTimestamp
			);

			if (quiz && quiz.id != quizIdBeingEdited) {
				quizTimestamps[quiz.timestamp] += 1;
			}
		}
	}

	minDate = null;
	var minQuizzesOnDay = Number.MAX_VALUE;
	for (var key in quizTimestamps) {
		if (quizTimestamps[key] < minQuizzesOnDay) {
			minDate = key;
			minQuizzesOnDay = quizTimestamps[key];
		}
	}
	console.log(minDate);
	// This means that no quiz exists in the given timeframe, therefore return the initial date
	if (minDate === null) {
		return roundedStartTimestamp;
	} else {
		return minDate;
	}
};

const create_quiz_transaction = async (title, description, maxGrade, timestamp, studentIds, teacherId) => {
	const t = await db.conn.transaction();

	try {
		const quiz = await db.models.quiz.create(
			{
				title,
				description,
				maxGrade,
				timestamp,
				teacherId,
			},
			{ transaction: t }
		);

		for (var i = 0; i < studentIds.length; i++) {
			const student = await db.models.student.findOne({
				where: { id: studentIds[i] },
				transaction: t,
			});
			const enrollment = await db.models.enrollment.create(
				{
					grade: null,
					quizId: quiz.id,
					studentId: student.id,
				},
				{ transaction: t }
			);
		}

		await t.commit();
	} catch (e) {
		await t.rollback();
		throw new Error(e);
	}
};

const edit_quiz_transaction = async (title, description, maxGrade, timestamp, studentIds, quizId) => {
	// To ensure that the consistency of the database isn’t compromised even if one of the queries fails to execute, 
	// a transaction object is passed to every query.
	const t = await db.conn.transaction();

	try {
		// Updating details of quiz
		const quiz = await db.models.quiz.update(
			{ title, description, maxGrade, timestamp },
			{
				where: { id: quizId },
				transaction: t,
			}
		);

		// If the quiz.update() function returns an array with a value of 0 it means that
		// no matching resources were found on the server to be updated, therefore, the body of the transaction is invalid
		if (quiz[0] !== 1) {
			throw new Error("No matching quiz found to update.");
		}

		// Removes old enrollments entries of students prior to edit
		const removeOldStudents = await db.models.enrollment.destroy({
			where: { quizId: quizId },
			transaction: t,
		});

		// Creates new enrollment data with new edited selections received from body
		for (var i = 0; i < studentIds.length; i++) {
			const student = await db.models.student.findOne({
				where: { id: studentIds[i] },
				transaction: t,
			});
			const enrollment = await db.models.enrollment.create(
				{
					grade: null,
					quizId: quizId,
					studentId: studentIds[i],
				},
				{ transaction: t }
			);
		}

		await t.commit();
	} catch (e) {
		// If at any point the program is unable to execute any of the queries required to finish the transaction, all of the changes
		// that were going to be made to the database are are rolled back by using the transaction instance
		await t.rollback();
		throw new Error(e);
	}
};

const delete_quiz_transaction = async (quizId) => {
	const t = await db.conn.transaction();

	try {
		const quiz = await db.models.quiz.destroy({
			where: { id: quizId },
			transaction: t,
		});

		const enrollments = await db.models.enrollment.destroy({
			where: { quizId: quizId },
			transaction: t,
		});

		await t.commit();
	} catch (e) {
		await t.rollback();
		throw new Error(e);
	}
};

module.exports = {
	find_role_of_person_from_email,
	given_password_matches_db_password,
	find_quiz_from_enrollment_id,
	find_quizzes_and_enrollments_from_student_id,
	find_students_from_quiz_id,
	find_timestamp_of_day_with_least_quizzes,
	find_enrollments_and_add_person_details_from_quiz_id,
	create_quiz_transaction,
	find_student_ids_from_student_emails,
	find_students_with_ids,
	find_all_students_with_person,
	delete_quiz_transaction,
	edit_quiz_transaction,
};
