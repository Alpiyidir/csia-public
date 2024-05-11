const express = require("express");
const teacher_controller = require("../controllers/teacher_controller");

const { body, check } = require("express-validator");

const router = express.Router();

const checkIfCustomDateObjectIsDate = (value) => {
	if (!value.year || !value.month || !value.day) {
		throw new Error("StartDate must be entered.");
	}
	const date = new Date(value.year, value.month, value.day);
	if (!date instanceof Date || isNaN(date)) {
		throw new Error("StartDate is not a valid date.");
	}
	return true;
};

const checkIfCustomEndDateObjectIsDateAndComesLaterThanStartDate = (value, { req }) => {
	if (!value.year || !value.month || !value.day) {
		throw new Error("EndDate must be entered");
	}

	const startDateInfo = req.body.startDate;
	const endDate = new Date(value.year, value.month, value.day);
	const endDateIsValid = endDate instanceof Date && !isNaN(endDate);
	if (!startDateInfo.year || !startDateInfo.month || !startDateInfo.day) {
		if (endDateIsValid) {
			return true;
		} else {
			throw new Error("EndDate is not a valid date");
		}
	}

	const startDate = new Date(startDateInfo.year, startDateInfo.month, startDateInfo.day);
	if (!startDate instanceof Date || isNaN(startDate)) {
		if (endDateIsValid) {
			return true;
		} else {
			throw new Error("EndDate is not a valid date");
		}
	}

    if ( endDate < startDate) {
        throw new Error("EndDate must be later in time than the startDate")
    }
	return true;
};

const sharedMiddleware = [
	body("title")
		.custom((value) => {
			return value.match(/^[A-Za-z0-9. ]+$/);
		})
		.withMessage("Title must be alphanumeric"),
	body("description")
		.custom((value) => {
			return value.match(/^[A-Za-z0-9. ]+$/);
		})
		.withMessage("Description must be alphanumeric"),
	body("maxGrade").isNumeric().withMessage("MaxGrade must be numeric"),
	check("startDate").custom(checkIfCustomDateObjectIsDate),
];

const smartMiddleware = [...sharedMiddleware, check("endDate").custom(checkIfCustomEndDateObjectIsDateAndComesLaterThanStartDate)];

router.get("/quizzes", teacher_controller.get_quizzes_of_teacher);
router.get("/quizzes/download", teacher_controller.get_excel_file_with_quiz_data);
router.get("/quizzes/:quizId/enrollments", teacher_controller.get_enrollments_of_students);
router.get("/students", teacher_controller.get_students);

router.post("/quizzes", sharedMiddleware, teacher_controller.edit_or_create_quiz("create"));
router.post("/quizzes/smartScheduler", smartMiddleware, teacher_controller.edit_or_create_quiz_with_smart_scheduler("create"));

router.put("/quizzes", sharedMiddleware, teacher_controller.edit_or_create_quiz("edit"));
router.put("/quizzes/smartScheduler", smartMiddleware, teacher_controller.edit_or_create_quiz_with_smart_scheduler("edit"));

router.put("/quizzes/updateGrade", teacher_controller.update_student_quiz_grade);

router.delete("/quizzes", teacher_controller.delete_quiz);

module.exports = router;
