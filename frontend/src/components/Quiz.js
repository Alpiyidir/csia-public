import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosWithAT from "../hooks/useAxiosWithAT";
import useLogout from "../hooks/useLogout";
import useAuth from "../hooks/useAuth";
import ShowForRole from "./ShowForRole";
import { searchForSubstringInString } from "../utils/utils";
import { routePaths as p } from "../config";
import "../Quiz.css";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ShowForCondition from "./ShowForCondition";

const Quiz = () => {
	const [quizzes, setQuizzes] = useState([]);
	const [enrollments, setEnrollments] = useState([]);
	const [searchParams, setSearchParams] = useState({
		title: "",
		description: "",
		maxGrade: "",
		timestamp: "",
	});
	const axiosWithAT = useAxiosWithAT();
	const logout = useLogout();
	const navigate = useNavigate();
	const { auth } = useAuth();

	useEffect(() => {
		const abortController = new AbortController();

		const getQuizzesAndEnrollments = async () => {
			var routeParameter = undefined;
			if (auth.role === "student") {
				routeParameter = "student";
			} else if (auth.role === "teacher") {
				routeParameter = "teacher";
			}

			try {
				const res = await axiosWithAT.get(`/${routeParameter}/quizzes`, {
					signal: abortController.signal,
				});

				for (var i = 0; i < res.data.quizzes.length; i++) {
					res.data.quizzes[i].visible = true;
				}

				setQuizzes(
					res.data.quizzes.sort((a, b) => {
						const aDate = new Date(parseInt(a.timestamp));
						const bDate = new Date(parseInt(b.timestamp));
						return aDate > bDate ? -1 : aDate < bDate ? 1 : a.id > b.id ? -1 : 1;
					})
				);

				if (auth.role === "student") {
					setEnrollments(res.data.enrollments);
				}
			} catch (e) {
				if (e?.status === 403) {
					await logout();
					navigate(`/${p.login}`);
				}
				console.log(e);
			}
		};

		getQuizzesAndEnrollments();

		return () => abortController.abort();
	}, []);

	useEffect(() => {
		const newQuizzes = [...quizzes];
		for (var i = 0; i < newQuizzes.length; i++) {
			newQuizzes[i].visible = true;
			Object.entries(searchParams).forEach(([quizAttribute, searchParam]) => {
				var searchString;
				if (quizAttribute === "timestamp") {
					searchString = generateDateTextFromTimestamp(newQuizzes[i].timestamp);
				} else {
					searchString = newQuizzes[i][quizAttribute].toString();
				}

				if (searchForSubstringInString(searchString, searchParam) === false) {
					newQuizzes[i].visible = false;
				}
			});
		}
		setQuizzes(newQuizzes);
	}, [searchParams]);

	const downloadQuizData = () => {
		const downloadQuizData = async () => {
			const quizIds = [];
			for (var i = 0; i < quizzes.length; i++) {
				quizIds.push(quizzes[i].id);
			}
			const res = await axiosWithAT.get(
				`/teacher/quizzes/download/?${quizIds.map((n, index) => `quizIds[${index}]=${n}`).join("&")}`,
				{ responseType: "blob" }
			);
			console.log(res);
			const href = URL.createObjectURL(res.data);

			const link = document.createElement("a");
			link.href = href;
			link.download = "MasterAccessQuizData.csv";

			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(href);
		};
		downloadQuizData();
	};

	const generateDateTextFromTimestamp = (timestamp) => {
		const date = new Date(parseInt(timestamp));
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();

		return `${month}/${day}/${year}`;
	};

	const changeQuizzes = (quizId) => {
		const deleteQuiz = async (quizId) => {
			try {
				const res = await axiosWithAT.delete(`/teacher/quizzes/`, {
					params: { quizId },
				});
			} catch (e) {
				if (e?.status === 403) {
					await logout();
					navigate(`/${p.login}`);
				}
				console.log(e);
				return;
			}

			var copyQuizzes;
			for (var i = 0; i < quizzes.length; i++) {
				if (quizzes[i].id === quizId) {
					copyQuizzes = [...quizzes];
					copyQuizzes[i].visible = false;
					break;
				}
			}
			setQuizzes(copyQuizzes);
		};

		deleteQuiz(quizId);
	};

	return (
		<div style={{ margin: "1%" }}>
			<ShowForRole role={"teacher"}>
				<Button
					style={{
						textAlign: "left",
						float: "left",
					}}
					variant="contained"
					onClick={() => {
						navigate(`/${p.createOrEditQuiz}`, {
							state: { quizId: null, enrollments: null },
						});
					}}
				>
					Create Quiz
				</Button>
			</ShowForRole>
			<Button
				style={{
					textAlign: "left",
					float: "left",
				}}
				variant="contained"
				onClick={() =>
					setSearchParams((searchParams) =>
						Object.assign(
							...Object.keys(searchParams).map((key) => ({
								[key]: "",
							}))
						)
					)
				}
			>
				Clear Search
			</Button>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<TableHead>
						<TableRow>
							<TableCell></TableCell>
							<TableCell>Title</TableCell>
							<TableCell>Description</TableCell>
							<TableCell>Max Grade</TableCell>
							<TableCell>Date (M/D/Y)</TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>Search By</TableCell>
							{Object.entries(searchParams).map(([studentParam, searchParam]) => (
								<TableCell key={studentParam}>
									<input
										value={searchParam}
										onChange={(e) => {
											setSearchParams((searchParams) => ({
												...searchParams,
												[studentParam]: e.target.value,
											}));
										}}
									></input>
								</TableCell>
							))}
							<TableCell></TableCell>
						</TableRow>
						{quizzes.map((quiz, i) => (
							<ShowForCondition key={quiz.id} condition={quiz.visible}>
								<TableRow
									sx={{
										"&:last-child td, &:last-child th": {
											border: 0,
										},
									}}
								>
									<TableCell>
										<ShowForRole role={"teacher"}>
											<IconButton aria-label="delete" onClick={() => changeQuizzes(quiz.id)}>
												<DeleteIcon />
											</IconButton>
										</ShowForRole>
									</TableCell>
									<TableCell>{quiz.title}</TableCell>
									<TableCell>{quiz.description}</TableCell>
									<TableCell>{quiz.maxGrade}</TableCell>
									<TableCell>{generateDateTextFromTimestamp(quiz.timestamp)}</TableCell>
									<TableCell>
										<Button
											variant="contained"
											onClick={() => {
												if (auth.role === "student") {
													navigate(`/${p.studentQuizEnrollment}`, {
														state: {
															quiz: quiz,
															enrollment: enrollments[i],
														},
													});
												} else if (auth.role === "teacher") {
													navigate(`/${p.teacherQuizEnrollments}`, {
														state: {
															quiz: quiz,
														},
													});
												}
											}}
										>
											Details
										</Button>
									</TableCell>
								</TableRow>
							</ShowForCondition>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<ShowForRole role={"teacher"}>
				<ShowForCondition condition={quizzes.length !== 0}>
					<Button variant="contained" onClick={() => downloadQuizData()}>
						Download Data For Quizzes
					</Button>
				</ShowForCondition>
			</ShowForRole>
		</div>
	);
};

export default Quiz;
