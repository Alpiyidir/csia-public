const { Sequelize, DataTypes } = require("sequelize");

const config = require("../config/DB");

const conn = new Sequelize(config.database, config.user, config.password, {
	host: config.host,
	dialect: config.dialect,
	port: config.port,
	logging: config.logging ? (msg) => console.log(msg) : false,
});

const enrollment = require("../models/enrollment")(conn, DataTypes);
const person = require("../models/person")(conn, DataTypes);
const quiz = require("../models/quiz")(conn, DataTypes);
const student = require("../models/student")(conn, DataTypes);
const subject = require("../models/subject")(conn, DataTypes);
const teacher = require("../models/teacher")(conn, DataTypes);

quiz.belongsToMany(student, { through: enrollment });
student.belongsToMany(quiz, { through: enrollment });

teacher.hasMany(quiz);
quiz.belongsTo(teacher);

subject.hasMany(teacher);
teacher.belongsTo(subject);

// Enforce one and only one relation with cascade (maybe, not having it allows for quizzes to still function)
person.hasOne(teacher /*, {onDelete: "CASCADE"}*/);
teacher.belongsTo(person);

person.hasOne(student);
student.belongsTo(person);

// Syncs initialized models to db, using force drops table and creates a new table
conn.sync({ force: config.force });
conn.authenticate()
	.then(() => console.log("Database connected"))
	.catch(() => console.log("Failed to connect to database"));

module.exports = {
	conn: conn,
	models: {
		enrollment,
		person,
		quiz,
		student,
		subject,
		teacher,
	},
};
