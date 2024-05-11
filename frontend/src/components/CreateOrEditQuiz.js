import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAxiosWithAT from "../hooks/useAxiosWithAT";
import ShowForCondition from "./ShowForCondition";
import { routePaths as p } from "../config";

import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import StudentSelector from "./StudentSelector";
import dayjs from "dayjs";

const CreateOrEditQuiz = () => {
	const [students, setStudents] = useState([]);
	const [useSmartScheduler, setUseSmartScheduler] = useState(false);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [maxGrade, setMaxGrade] = useState(100);
	const [error, setError] = useState("");

	const { state } = useLocation();
	const { quiz, enrollments } = state;

	const axiosWithAT = useAxiosWithAT();
	const navigate = useNavigate();

	useEffect(() => {
		loadExistingQuizData();
	}, [students.length]);

	useEffect(() => {
		setError("");
	}, [title, description, maxGrade, startDate, endDate]);

	const loadExistingQuizData = () => {
		if (quiz !== null && enrollments !== null) {
			setTitle(quiz.title);
			setDescription(quiz.description);
			setMaxGrade(quiz.maxGrade);
			setStartDate(dayjs.unix(parseInt(quiz.timestamp / 1000)));

			const previouslySelectedStudentIds = [];
			for (var i = 0; i < enrollments.length; i++) {
				previouslySelectedStudentIds.push(enrollments[i].studentId);
			}

			const copyStudents = [...students];
			for (var j = 0; j < copyStudents.length; j++) {
				for (var k = 0; k < previouslySelectedStudentIds.length; k++) {
					if (copyStudents[j].id === previouslySelectedStudentIds[k]) {
						copyStudents[j].selected = true;
					}
				}
			}
			setStudents(copyStudents);
		}
	};

	const quizAction = async ({ edit }) => {
		const startDateParametrized = {
			day: startDate?.$D,
			month: startDate?.$M,
			year: startDate?.$y,
		};

		const studentIds = getSelectedStudentIds();
		try {
			if (useSmartScheduler) {
				const endDateParamterized = {
					day: endDate?.$D,
					month: endDate?.$M,
					year: endDate?.$y,
				};

				if (edit) {
					const res = await axiosWithAT.put(
						`/teacher/quizzes/smartScheduler`,
						{
							title,
							description,
							maxGrade,
							startDate: startDateParametrized,
							endDate: endDateParamterized,
							studentIds,
							quizId: quiz.id,
						},
						{ withCredentials: true }
					);
				} else {
					const res = await axiosWithAT.post(
						`/teacher/quizzes/smartScheduler`,
						{
							title,
							description,
							maxGrade,
							startDate: startDateParametrized,
							endDate: endDateParamterized,
							studentIds,
						},
						{ withCredentials: true }
					);
				}
			} else {
				if (edit) {
					const res = await axiosWithAT.put(
						`/teacher/quizzes`,
						{
							title,
							description,
							maxGrade,
							startDate: startDateParametrized,
							studentIds,
							quizId: quiz.id,
						},
						{ withCredentials: true }
					);
				} else {
					const res = await axiosWithAT.post(
						`/teacher/quizzes`,
						{
							title,
							description,
							maxGrade,
							startDate: startDateParametrized,
							studentIds,
						},
						{ withCredentials: true }
					);
				}
			}
			navigate(`/${p.quiz}`);
		} catch (e) {
			console.log(e);
			if (e?.response?.data?.error) {
				setError(e.response.data.error);
			} else {
				setError(e.message);
			}
		}
	};

	const getSelectedStudentIds = () => {
		const selectedStudentIds = [];
		for (var i = 0; i < students.length; i++) {
			if (students[i].selected === true) {
				selectedStudentIds.push(students[i].id);
			}
		}
		return selectedStudentIds;
	};

	return (
		<div>
			<StudentSelector students={students} setStudents={setStudents} />

			<div
				style={{
					marginTop: "2em",
				}}
			>
				<p>Title:</p>
				<TextField required value={title} onChange={(e) => setTitle(e.target.value)}></TextField>
				<p>Description:</p>
				<TextField required value={description} onChange={(e) => setDescription(e.target.value)} multiline></TextField>
				<p>Max Grade:</p>
				<TextField required type="number" value={maxGrade} onChange={(e) => setMaxGrade(e.target.value)}></TextField>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<p>Start Date:</p>
					<DatePicker value={startDate} onChange={(value) => setStartDate(value)} />
					<ShowForCondition condition={useSmartScheduler}>
						<p>End Date:</p>
						<DatePicker
							value={endDate}
							onChange={(value) => {
								setEndDate(value);
							}}
						/>
					</ShowForCondition>
				</LocalizationProvider>
				<p>Use Smart Quiz Selector:</p>
				<Checkbox onClick={(e) => setUseSmartScheduler(e.target.checked)}></Checkbox>
				<div style={{ marginBottom: "2%" }}>
					<ShowForCondition condition={error !== ""}>Error: {error}</ShowForCondition>
				</div>
			</div>
			<Button
				style={{ marginBottom: "5em" }}
				variant="contained"
				onClick={() => (quiz?.id ? quizAction({ edit: true }) : quizAction({ edit: false }))}
			>
				{quiz?.id ? "Edit Quiz" : "Create Quiz"}
			</Button>
		</div>
	);
};

export default CreateOrEditQuiz;
