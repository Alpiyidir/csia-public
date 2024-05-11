const {
	find_quizzes_from_teacher_id,
	find_quiz_from_quiz_id,
	update_enrollment_from_id,
	find_enrollments_from_quiz_id,
	find_student_from_id,
	find_person_from_email,
} = require("../utils/database_operations");

const {
	find_timestamp_of_day_with_least_quizzes,
	find_enrollments_and_add_person_details_from_quiz_id,
	create_quiz_transaction,
	edit_quiz_transaction,
	delete_quiz_transaction,
	find_quiz_from_enrollment_id,
	find_all_students_with_person,
} = require("../utils/database_logic");
const create_csv = require("../utils/create_csv");

const { validationResult } = require("express-validator");

const get_quizzes_of_teacher = async (req, res, next) => {
	res.status(200).json({
		quizzes: await find_quizzes_from_teacher_id(req.user.roleInfo.id),
	});
};
const get_enrollments_of_students = async (req, res, next) => {
	if (!req?.params.quizId) {
		res.sendStatus(400);
		return;
	}

	const quiz = await find_quiz_from_quiz_id(req.params.quizId);

	if (quiz.teacherId === req.user.roleInfo.id) {
		res.status(200).json({
			enrollments: await find_enrollments_and_add_person_details_from_quiz_id(req.params.quizId),
		});
	} else {
		res.sendStatus(400);
	}
};

const update_student_quiz_grade = async (req, res, next) => {
	// req.query.grade doesn't need to be checked as if it doesn't exist it is assumed to be null
	if (!req?.query.enrollmentId) {
		res.status(400).json({ error: "No enrollmentId inputted." });
		return;
	}
	const quiz = await find_quiz_from_enrollment_id(req.query.enrollmentId);

	// Validation Checks, if req.query?.grade doesn't evaluate to the value of a grade, the parseInt function will evaluate to NaN,
	// and Nan || null evaluates to null
	var grade = req.query?.grade || null;
	if (grade !== null) {
		grade = parseInt(grade);

		if (grade === NaN) {
			res.status(400).json({
				error: "Inputted grade is not an integer.",
			});
			return;
		}

		if (grade > parseInt(quiz.maxGrade)) {
			res.status(400).json({
				message: `Query grade is larger than the max grade ${quiz.maxGrade}.`,
			});
			return;
		} else if (grade < 0) {
			res.status(400).json({
				message: `Query grade is smaller than 0.`,
			});
			return;
		}
	}

	const updatedEnrollment = await update_enrollment_from_id(req.query.enrollmentId, grade).catch((e) => {
		console.log(e);
		res.sendStatus(500).json({ error: e });
		return;
	});
	res.status(200).json({ updatedEnrollment });
};

const edit_or_create_quiz = (action) => {
	return async (req, res, next) => {
		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: errors
					.array()
					.map((e) => e.msg)
					.join(" and "),
			});
		}

		const { title, description, maxGrade, startDate, studentIds } = req.body;

		if (req?.body?.smartTimestamp) {
			roundedTimestamp = new Date(parseInt(req.body.smartTimestamp)).setHours(0, 0, 0, 0);
		} else {
			roundedTimestamp = new Date(startDate.year, startDate.month, startDate.day).setHours(0, 0, 0, 0);
		}

		try {
			const sharedParams = [title, description, maxGrade, roundedTimestamp, studentIds];

			if (action === "edit") {
				await edit_quiz_transaction(...sharedParams, req.body.quizId);
				res.sendStatus(200);
			} else if (action === "create") {
				await create_quiz_transaction(...sharedParams, req.user.roleInfo.id);
				res.sendStatus(201);
			}
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}
	};
};

// Higher-order function that returns a controller that handles the logic for both editing and creating
// it is used because the validation for both paths is the same and the same would have to be repeated otherwise
const edit_or_create_quiz_with_smart_scheduler = (action) => {
	return async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: errors
					.array()
					.map((e) => e.msg)
					.join(" and "),
			});
		}
		const { startDate, endDate, studentIds } = req.body;

		if (action === "edit") {
			// Passing current quiz so that it is ignored in the calculations
			req.body.smartTimestamp = await find_timestamp_of_day_with_least_quizzes(startDate, endDate, studentIds, req.body.quizId);
		} else {
			req.body.smartTimestamp = await find_timestamp_of_day_with_least_quizzes(startDate, endDate, studentIds, null);
		}

		if (action === "edit") {
			const quiz = await find_quiz_from_quiz_id(req.body.quizId);
			if (quiz.teacherId !== req.user.roleInfo.id) {
				res.status(403).json({
					error: "Quiz being edited does not belong to teacher.",
				});
			}
			await edit_or_create_quiz("edit")(req, res, next);
		} else if (action === "create") {
			await edit_or_create_quiz("create")(req, res, next);
		}
	};
};

const get_excel_file_with_quiz_data = async (req, res, next) => {
	const quizIds = req?.query?.quizIds;
	if (!quizIds) {
		res.status(400).json({ error: "No quizzes to generate file for." });
		return;
	}
	const quizzesWithEnrollmentsAndStudentInfo = [];

	for (var i = 0; i < quizIds.length; i++) {
		const quiz = await find_quiz_from_quiz_id(quizIds[i]);
		if (quiz.teacherId !== req.user.roleInfo.id) {
			console.log(quiz.teacherId, req.user.roleInfo.id);
			res.status(403).json({ message: "One of the quiz ids does not belong to the teacher making the request." });
			return;
		}

		const enrollments = await find_enrollments_from_quiz_id(quizIds[i]);

		for (var j = 0; j < enrollments.length; j++) {
			const student = await find_student_from_id(enrollments[j].studentId);
			const person = await find_person_from_email(student.personEmail);
			enrollments[j].firstName = person.firstName;
			enrollments[j].lastName = person.lastName;
			delete enrollments[j].id;
			delete enrollments[j].quizId;
			delete enrollments[j].studentId;
		}

		quizzesWithEnrollmentsAndStudentInfo.push({
			title: quiz.title,
			description: quiz.description,
			maxGrade: quiz.maxGrade,
			timestamp: quiz.timestamp,
			enrollments,
		});
	}

	const data = create_csv(quizzesWithEnrollmentsAndStudentInfo);
	res.header("Content-Type", "text/csv");
	res.send(data);
};

const get_students = async (req, res, next) => {
	const studentsDetails = await find_all_students_with_person();
	res.status(200).json({ studentsDetails });
};

const delete_quiz = async (req, res, next) => {
	if (!req?.query.quizId) {
		res.status(400).json({ error: "No quizId inputted." });
		return;
	}
	const quiz = await find_quiz_from_quiz_id(req.query.quizId);

	// Quiz doesn't exist.
	if (quiz === null) {
		res.sendStatus(400);
		return;
	}

	if (quiz.teacherId !== req.user.roleInfo.id) {
		res.status(403).json({
			error: "Quiz being deleted does not belong to teacher.",
		});
		return;
	}

	try {
		await delete_quiz_transaction(req.query.quizId);
		res.sendStatus(200);
	} catch (e) {
		console.log(e);
		res.sendStatus(400);
	}
};

module.exports = {
	get_quizzes_of_teacher,
	get_enrollments_of_students,
	edit_or_create_quiz,
	edit_or_create_quiz_with_smart_scheduler,
	update_student_quiz_grade,
	get_students,
	delete_quiz,
	get_excel_file_with_quiz_data,
};
