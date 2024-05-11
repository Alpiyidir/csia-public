const db = require("../services/database");
const { Op } = require("sequelize");

const create_person = async (email, password, firstName, lastName) => {
	const created_person = await db.models.person.create({
		email: email,
		password: password,
		firstName: firstName,
		lastName: lastName,
	});
	return created_person;
};

const create_student = async (personEmail) => {
	const created_student = await db.models.student.create({
		personEmail: personEmail,
	});
	return created_student;
};

const set_refresh_token = async (email, refreshToken) => {
	// Checks if the id which will be used is a UUID as otherwise sequelize will return an error
	const updated_person = await db.models.person.update(
		{ refreshToken },
		{
			where: {
				email: email,
			},
		}
	);
	return updated_person;
};

const create_teacher = async (teacherKey, personEmail) => {
	const created_teacher = await db.models.teacher.create({
		subjectId: teacherKey,
		personEmail: personEmail,
	});
	return created_teacher;
};

// Returns user with given email if found in databse otherwise returns null
const find_person_from_email = async (email) => {
	const person = await db.models.person.findOne({
		where: {
			email: email,
		},
	});

	return person;
};

const find_student_from_email = async (email) => {
	const student = await db.models.student.findOne({
		where: {
			personEmail: email,
		},
	});

	return student;
};

const find_subject_from_id = async (teacherKey) => {
	// Checks if the id which will be used is a UUID as otherwise sequelize will return an error
	try {
		const subject = await db.models.subject.findOne({
			where: {
				id: teacherKey,
			},
		});
		return subject;
	} catch (e) {
		return null;
	}
};

const find_teacher_from_email = async (email) => {
	const teacher = await db.models.teacher.findOne({
		where: {
			personEmail: email,
		},
	});

	return teacher;
};

const find_person_from_refresh_token = async (refreshToken) => {
	/* db.models.user.findOne returns user with the requested parameters (specfied email)*/
	const person = await db.models.person.findOne({
		where: {
			refreshToken: refreshToken,
		},
	});

	return person;
};

const find_enrollments_from_student_id = async (studentId) => {
	try {
		const enrollments = await db.models.enrollment.findAll({
			where: {
				studentId: studentId,
			},
		});

		return enrollments;
	} catch (e) {
		console.log(e);
	}
};

const find_enrollments_from_quiz_id = async (quizId) => {
	const enrollments = await db.models.enrollment.findAll({
		where: {
			quizId: quizId,
		},
	});

	return enrollments;
};

const find_enrollments_from_quiz_ids = async (quizId) => {
	const enrollments = await db.models.enrollment.findAll({
		where: {
			quizId: quizId,
		},
	});

	return enrollments;
};

const find_enrollments_from_quiz_id_and_student_id = async (
	quizId,
	studentId
) => {
	const enrollment = await db.models.enrollment.findOne({
		where: { quizId: quizId, studentId: studentId },
	});

	return enrollment;
};

const find_quiz_from_quiz_id = async (quizId) => {
	const quiz = await db.models.quiz.findOne({
		where: {
			id: quizId,
		},
	});
	return quiz;
};

const find_quiz_from_quiz_id_for_range = async (
	quizId,
	startTimestamp,
	endTimestamp
) => {
	const quiz = await db.models.quiz.findOne({
		where: {
			id: quizId,
			timestamp: {
				[Op.gte]: startTimestamp,
				[Op.lte]: endTimestamp,
			},
		},
	});

	return quiz;
};

const find_quizzes_from_teacher_id = async (teacherId) => {
	const quizzes = await db.models.quiz.findAll({
		where: { teacherId: teacherId },
	});

	return quizzes;
};

const find_teacher_id_from_quiz_id = async (quizId) => {
	const quiz = await db.models.quiz.findOne({
		where: { id: quizId },
	});

	if (quiz == null) {
		return null;
	} else {
		return quiz.teacherId;
	}
};

const find_student_from_id = async (studentId) => {
	const student = await db.models.student.findOne({
		where: {
			id: studentId,
		},
	});

	return student;
};

const update_enrollment_from_id = async (enrollmentId, grade) => {
	const updated_enrollment = await db.models.enrollment.update(
		{ grade },
		{
			where: {
				id: enrollmentId,
			},
		}
	);
	return updated_enrollment;
};

const find_enrollment_from_id = async (enrollmentId) => {
	const enrollment = await db.models.enrollment.findOne({
		where: {
			id: enrollmentId,
		},
	});
	return enrollment;
};

module.exports = {
	create_person,
	create_student,
	create_teacher,
	set_refresh_token,
	find_person_from_email,
	find_student_from_email,
	find_subject_from_id,
	find_teacher_from_email,
	find_person_from_refresh_token,
	find_enrollments_from_student_id,
	find_enrollments_from_quiz_id,
	find_quizzes_from_teacher_id,
	find_quiz_from_quiz_id_for_range,
	find_teacher_id_from_quiz_id,
	find_enrollments_from_quiz_id_and_student_id,
	find_student_from_id,
	find_quiz_from_quiz_id,
	update_enrollment_from_id,
	find_enrollment_from_id,
};
