export const generateGradeText = (grade) => {
	var gradeText;
	if (grade === null) {
		gradeText = "N/A";
	} else {
		gradeText = String(grade);
	}
	return gradeText;
};

export const searchForSubstringInString = (string, subString) => {
	string =  string.toLowerCase();
	subString = subString.toLowerCase();

	if (subString === "") {
		return true;
	} else if (string.length < subString.length) {
		return false;
	}

	for (var i = 0; i < string.length - subString.length + 1; i++) {
		var charsAtIndicesMatch = true;
		for (var j = 0; j < subString.length; j++) {
			if (string[i + j] !== subString[j]) {
				charsAtIndicesMatch = false;
				break;
			}
		}

		if (charsAtIndicesMatch === true) {
			return true;
		}
	}
	return false;
};
