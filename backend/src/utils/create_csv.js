const create_csv = (quizzesWithEnrollmentsAndStudentInfo) => {
	var csv = "";

	for (var i = 0; i < quizzesWithEnrollmentsAndStudentInfo.length; i++) {
		const { title, description, maxGrade, timestamp, enrollments } = quizzesWithEnrollmentsAndStudentInfo[i];
		const date = new Date(parseInt(timestamp));

		csv += ["title", "description", "maxGrade", "month", "day", "year"].join() + "\n";
		csv += [title, description, maxGrade, date.getMonth() + 1, date.getDate(), date.getFullYear()].join() + "\n\n";
		
        csv += ["firstName", "lastName", "grade"].join() + "\n";
        for(var j = 0; j < enrollments.length; j++) {
            const e = enrollments[j];
            csv += [e.firstName, e.lastName, e.grade].join() + "\n";
        }
        csv += "\n"
	}

	return csv;
};

module.exports = create_csv;
