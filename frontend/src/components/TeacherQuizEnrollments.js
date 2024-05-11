import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosWithAT from "../hooks/useAxiosWithAT";
import useLogout from "../hooks/useLogout";
import { generateGradeText } from "../utils/utils";
import ShowForCondition from "./ShowForCondition";
import { routePaths as p } from "../config";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Checkbox, Tab } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const TeacherQuizEnrollments = () => {
	const [enrollments, setEnrollments] = useState([]);
	const [checked, setChecked] = useState(false);
	const [gradeValues, setGradeValues] = useState({});
	const [dbGradeValues, setDbGradeValues] = useState({});
	const [errors, setErrors] = useState({});
	const [reload, setReload] = useState(false);

	const axiosWithAT = useAxiosWithAT();
	const logout = useLogout();
	const navigate = useNavigate();
	const { state } = useLocation();

	useEffect(() => {
		const abortController = new AbortController();

		const getEnrollments = async () => {
			try {
				const res = await axiosWithAT.get(`/teacher/quizzes/${state.quiz.id}/enrollments`, {
					signal: abortController.signal,
				});
				setEnrollments(res.data.enrollments);

				var tmpGradeValues = {};
				for (var i = 0; i < res.data.enrollments.length; i++) {
					tmpGradeValues = {
						...tmpGradeValues,
						[res.data.enrollments[i].id]: res.data.enrollments[i].grade,
					};
				}
				setDbGradeValues(tmpGradeValues);
			} catch (e) {
				if (e?.status === 403) {
					await logout();
					navigate(`/${p.login}`);
				}
				console.log(e);
			}
		};
		getEnrollments();

		return () => abortController.abort();
	}, []);

	useEffect(() => {
		const abortController = new AbortController();
		const updateError = (enrollmentId, res) => {
			const message = res?.data?.message || null;
			setErrors((errors) => ({
				...errors,
				[enrollmentId]: message,
			}));
		};

		const postGrades = async (enrollmentId, grade) => {
			try {
				const res = await axiosWithAT.put(`/teacher/quizzes/updateGrade`, null, {
					params: {
						enrollmentId,
						grade: grade,
					},
				});
				// If the request is successful, the dbgradevalue stored locally will be updated.
				setDbGradeValues((gradeValues) => ({
					...gradeValues,
					[enrollmentId]: parseInt(grade),
				}));
				// Furthermore, the error message if it is not null will be changed
				updateError(enrollmentId, res);
			} catch (e) {
				if (e?.status === 403) {
					await logout();
					navigate(`/${p.login}`);
				} else if (e?.response?.data?.message) {
					updateError(enrollmentId, e.response);
				}
			}
		};

		for (var enrollmentId in gradeValues) {
			if (gradeValues !== dbGradeValues) {
				postGrades(enrollmentId, gradeValues[enrollmentId]);
			}
		}

		return () => abortController.abort();
	}, [reload]);

	const gradesStandardDeviation = () => {
		if (dbGradeValues.length === 1) {
			return null;
		} else {
			const length = Object.entries(dbGradeValues).length;
			const avg = averageDbGradeValues();
			var sum = 0;
			Object.values(dbGradeValues).forEach((grade) => (sum += Math.pow(grade - avg, 2)));
			return Math.pow(sum / (length - 1), 1 / 2);
		}
	};

	const averageDbGradeValues = () => {
		var gradeSum = 0;
		for (var key in dbGradeValues) {
			gradeSum += dbGradeValues[key];
		}
		return gradeSum / Object.entries(dbGradeValues).length;
	};

	const changeGrade = (enrollmentId, grade) => {
		setGradeValues({ ...gradeValues, [enrollmentId]: grade });
	};

	return (
		<div style={{ margin: "1%" }}>
			<div
				style={{
					textAlign: "left",
					float: "left",
				}}
			>
				<Button
					style={{
						marginRight: "1em",
					}}
					variant="contained"
					onClick={() => {
						navigate(`/${p.createOrEditQuiz}`, {
							state: {
								quiz: state.quiz,
								enrollments: enrollments,
							},
						});
					}}
				>
					Edit Other Quiz Details
				</Button>
				<label htmlFor="editgrades">Edit Grades</label>
				<Checkbox
					checked={checked}
					onChange={(e) => {
						setChecked(e.target.checked);
					}}
				/>
				<ShowForCondition condition={checked}>
					<Button variant="contained" onClick={() => setReload(!reload)}>
						Update Changes
					</Button>
				</ShowForCondition>
			</div>

			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small">
					<TableHead>
						<TableRow>
							<TableCell>Email</TableCell>
							<TableCell>First Name</TableCell>
							<TableCell>Last Name</TableCell>
							<TableCell>Grade</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{enrollments.map((enrollment) => {
							return (
								<Enrollment
									key={enrollment.id}
									enrollment={enrollment}
									editing={checked}
									error={errors[enrollment.id]}
									changeGrade={changeGrade}
									dbGradeValue={dbGradeValues[enrollment.id]}
								/>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<div style={{ borderStyle: "solid", width: "15%", margin: "auto", marginTop: "2em" }}>
				<p>Quiz Statistics:</p>
				<p>Average Grade: {parseFloat(averageDbGradeValues().toPrecision(3)).toString() || "N/A"}</p>
				<p>
					Average Percentage Grade:{" "}
					{`${parseFloat(((averageDbGradeValues() / state.quiz.maxGrade) * 100).toPrecision(3))}%` || "N/A"}
				</p>
				<p>Standard Deviation: {parseFloat(gradesStandardDeviation().toPrecision(3)).toString() || "N/A"}</p>
			</div>
		</div>
	);
};

const Enrollment = ({ enrollment, editing, error, changeGrade, dbGradeValue }) => {
	return (
		<TableRow>
			<TableCell>{enrollment.email}</TableCell>
			<TableCell>{enrollment.firstName}</TableCell>
			<TableCell>{enrollment.lastName}</TableCell>
			<TableCell style={{ width: "33%" }}>
				<ShowForCondition condition={!editing}>{generateGradeText(dbGradeValue)}</ShowForCondition>
				<ShowForCondition condition={editing}>
					<TextField
						style={{ width: "100%" }}
						type="number"
						defaultValue={dbGradeValue}
						onChange={(e) => changeGrade(enrollment.id, e.target.value)}
					/>
					<ShowForCondition condition={(error || null) !== null}>
						<p>Error: {error || null}</p>
					</ShowForCondition>
				</ShowForCondition>
			</TableCell>
		</TableRow>
	);
};

export default TeacherQuizEnrollments;
