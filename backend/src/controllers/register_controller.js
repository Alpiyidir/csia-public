const {
	find_person_from_email,
	create_person,
	create_teacher,
	create_student,
	find_subject_from_id,
} = require("../utils/database_operations.js");
const { validationResult } = require("express-validator");

const register_controller = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: errors.array().map((e) => e.msg).join(" and ") });
	}

	const { email, password, firstName, lastName, teacherKey } = req.body;

	const person = await find_person_from_email(email);

	if (person !== null) {
		res.status(200)
			.json({
				created: false,
				message: "An account with this email already exists.",
			})
			.send();
		return;
	}
	console.log(teacherKey);
	if (teacherKey !== "") {
		var subject = await find_subject_from_id(teacherKey);
		console.log(teacherKey);
		if (subject === null) {
			res.status(200)
				.json({ created: false, message: "Invalid teacher key." })
				.send();
			return;
		}
	}

	const created_person = await create_person(
		email,
		password,
		firstName,
		lastName
	);

	if (teacherKey !== "") {
		var created_teacher = await create_teacher(teacherKey, email);
	} else {
		var created_student = await create_student(email);
	}

	res.status(201).json({ created: true });
};

module.exports = register_controller;
