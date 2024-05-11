const express = require("express");
const student_controller = require("../controllers/student_controller");
const router = express.Router();

router.get("/quizzes", student_controller.get_quizzes_and_enrollments_of_student)
router.get("/quizzes/:quizId/enrollment", student_controller.get_enrollment_of_student)

module.exports = router;
