import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { generateGradeText } from "../utils/utils";

const StudentQuizView = () => {
	const { state } = useLocation();
	const { auth } = useAuth();

	const { enrollment, quiz } = state;
	console.log(state);

	const gradeText = generateGradeText(enrollment.grade);
	const percentageText =
		enrollment.grade !== null
			? `${(enrollment.grade / quiz.maxGrade) * 100}%`
			: "N/A";

			console.log(auth);
	return (
		<div>
			<div>Quiz Details for {auth.lastName}, {auth.firstName}</div>
			<div>
				Grade: {gradeText} out of {quiz.maxGrade}{" "}
			</div>
			<div>Percentage: {percentageText}</div>
		</div>
	);
};

export default StudentQuizView;
