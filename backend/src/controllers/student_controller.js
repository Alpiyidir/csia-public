const {
	find_quizzes_and_enrollments_from_student_id,
} = require("../utils/database_logic.js");
const {
	find_enrollments_from_quiz_id_and_student_id,
} = require("../utils/database_operations.js");

const get_quizzes_and_enrollments_of_student = async (req, res, next) => {
	res.status(200).json(
		await find_quizzes_and_enrollments_from_student_id(req.user.roleInfo.id)
	);
};

const get_enrollment_of_student = async (req, res, next) => {
	if (!req?.params.quizId) {
		res.status.send(400);
		return;
	}

	res.status(200).json(
		await find_enrollments_from_quiz_id_and_student_id(
			req.params.quizId,
			req.user.roleInfo.id
		)
	);
};

module.exports = {
	get_quizzes_and_enrollments_of_student,
	get_enrollment_of_student,
};
