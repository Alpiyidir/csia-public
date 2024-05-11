import { useEffect, useState } from "react";
import { searchForSubstringInString } from "../utils/utils";
import ShowForCondition from "./ShowForCondition";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAxiosWithAT from "../hooks/useAxiosWithAT";
import { routePaths as p } from "../config"

import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

const StudentSelector = ({ students, setStudents }) => {
	const [columnInfo, setColumnInfo] = useState({
		email: { selected: true, orderAsc: true, searchParam: "" },
		firstName: { selected: false, orderAsc: true, searchParam: "" },
		lastName: { selected: false, orderAsc: true, searchParam: "" },
	});
	const [repeatUntilStudentsLoaded, setRepeatUntilStudentsLoaded] = useState(false);

	const navigate = useNavigate();
	const logout = useLogout();
	const axiosWithAT = useAxiosWithAT();

	useEffect(() => {
		const abortController = new AbortController();

		const getStudents = async () => {
			try {
				const res = await axiosWithAT.get(`/teacher/students`, {
					signal: abortController.signal,
				});
				for (var i = 0; i < res.data.studentsDetails.length; i++) {
					res.data.studentsDetails[i].selected = false;
					res.data.studentsDetails[i].visible = true;
				}
				setStudents(res.data.studentsDetails);
			} catch (e) {
				if (e?.status === 403) {
					await logout();
					navigate(`/${p.login}`);
				}
				console.log(e);
			}
		};

		getStudents();

		return () => abortController.abort();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (students.length !== 0) {
				orderTableBy("email");
			} else {
				setRepeatUntilStudentsLoaded(!repeatUntilStudentsLoaded);
			}
		}, 5);
	}, [repeatUntilStudentsLoaded]);

	useEffect(() => {
		var studentsCopyOrdered;
		// Update sort
		Object.entries(columnInfo).every(([studentAttribute, { selected }]) => {
			if (selected) {
				studentsCopyOrdered = [...orderTableBy(studentAttribute)];
				// Returning false stops the loop.
				return false;
			}
			return true;
		});

		// Update search filter
		for (var i = 0; i < studentsCopyOrdered.length; i++) {
			studentsCopyOrdered[i].visible = true;
			const searchAttributes = Object.keys(columnInfo);
			for (var j = 0; j < searchAttributes.length; j++) {
				const searchAttribute = searchAttributes[j];
				if (
					searchForSubstringInString(studentsCopyOrdered[i][searchAttribute], columnInfo[searchAttribute].searchParam) === false
				) {
					studentsCopyOrdered[i].visible = false;
				}
			}
			setStudents(studentsCopyOrdered);
		}
	}, [columnInfo]);

	const handleOrderButtonClicked = (studentAttribute) => () => {
		setColumnInfo((columnInfo) => {
			var copyColumnInfo = {};
			Object.entries(columnInfo).forEach(([loopStudentAttribute, params]) => {
				copyColumnInfo = {
					...copyColumnInfo,
					[loopStudentAttribute]: { ...params },
				};
				copyColumnInfo[loopStudentAttribute].selected = false;
			});
			copyColumnInfo[studentAttribute].selected = true;
			copyColumnInfo[studentAttribute].orderAsc = columnInfo[studentAttribute].selected
				? !columnInfo[studentAttribute].orderAsc
				: columnInfo[studentAttribute].orderAsc;
			return copyColumnInfo;
		});
	};

	const changeSelected = (checked, i) => {
		setStudents((students) => {
			const studentsCopyOrdered = [...students];
			studentsCopyOrdered[i].selected = checked;
			return studentsCopyOrdered;
		});
	};

	const clearSelectedStudents = () => {
		const copyStudents = [...students];
		for (var i = 0; i < copyStudents.length; i++) {
			if (copyStudents[i].selected === true) {
				copyStudents[i].selected = false;
			}
		}
		setStudents(copyStudents);
	};

	const orderTableBy = (sortByAttribute) => {
		const ascending = columnInfo[sortByAttribute].orderAsc;

		const studentsCopy = [...students];
		for (var i = 0; i < studentsCopy.length - 1; i++) {
			var indexOfInterest = i;
			for (var j = i + 1; j < studentsCopy.length; j++) {
				var comparingCharAtIndex = 0;
				while (
					comparingCharAtIndex !== studentsCopy[j][sortByAttribute].length &&
					comparingCharAtIndex !== studentsCopy[indexOfInterest][sortByAttribute].length &&
					studentsCopy[j][sortByAttribute].charAt(comparingCharAtIndex) ===
						studentsCopy[indexOfInterest][sortByAttribute].charAt(comparingCharAtIndex)
				) {
					comparingCharAtIndex++;
				}

				if (
					comparingCharAtIndex === studentsCopy[indexOfInterest][sortByAttribute].length ||
					comparingCharAtIndex === studentsCopy[j][sortByAttribute].length
				) {
					// If listed is ordered in an ascending order, shorter entries that have same substrings are ordered to come earlier than a larger string
					// that contains the substring
					if (studentsCopy[indexOfInterest][sortByAttribute].length > studentsCopy[j][sortByAttribute].length) {
						if (ascending) {
							indexOfInterest = j;
						}
					} else if (studentsCopy[indexOfInterest][sortByAttribute].length < studentsCopy[j][sortByAttribute].length) {
						if (!ascending) {
							indexOfInterest = j;
						}
					} else {
						if (studentsCopy[indexOfInterest].id > studentsCopy[j].id) {
							if (ascending) {
								indexOfInterest = j;
							}
						} else {
							if (!ascending) {
								indexOfInterest = j;
							}
						}
					}
				} else {
					if (
						studentsCopy[j][sortByAttribute]
							.charAt(comparingCharAtIndex)
							.localeCompare(studentsCopy[indexOfInterest][sortByAttribute].charAt(comparingCharAtIndex)) ===
						(ascending ? -1 : 1)
					) {
						indexOfInterest = j;
					}
				}
			}

			if (indexOfInterest !== i) {
				const tmp = studentsCopy[indexOfInterest];
				studentsCopy[indexOfInterest] = studentsCopy[i];
				studentsCopy[i] = tmp;
			}
		}
		setStudents(studentsCopy);
		return studentsCopy;
	};

	return (
		<div style={{ margin: "1%" }}>
			<div style={{ textAlign: "left" }}>
				<Button variant="contained" onClick={() => clearSelectedStudents()}>
					Clear Selected Students
				</Button>
				<Button
					style={{ marginRight: "5px" }}
					variant="contained"
					onClick={() =>
						setColumnInfo((columnInfo) =>
							Object.assign(
								...Object.keys(columnInfo).map((studentAttribute) => ({
									[studentAttribute]: {
										...columnInfo[studentAttribute],
										searchParam: "",
									},
								}))
							)
						)
					}
				>
					Clear Search
				</Button>
			</div>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<TableHead></TableHead>
					<TableHead>
						<TableRow>
							<TableCell></TableCell>
							<TableCell>Email</TableCell>
							<TableCell>First Name</TableCell>
							<TableCell>Last Name</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>Search By</TableCell>
							{Object.entries(columnInfo).map(([studentAttribute, { searchParam }]) => (
								<TableCell key={studentAttribute}>
									<input
										value={searchParam}
										onChange={(e) => {
											setColumnInfo((columnInfo) => ({
												...columnInfo,
												[studentAttribute]: {
													...columnInfo[studentAttribute],
													searchParam: e.target.value,
												},
											}));
										}}
									></input>
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							<TableCell>Order By</TableCell>
							{Object.entries(columnInfo).map(([studentAttribute, { selected, orderAsc }]) => (
								<TableCell key={studentAttribute}>
									<Button
										style={{
											color: selected ? "#4892db" : "#808080",
										}}
										onClick={handleOrderButtonClicked(studentAttribute)}
									>
										{orderAsc ? "Ascending" : "Descending"}
									</Button>
								</TableCell>
							))}
						</TableRow>
						{students.map((student, i) => (
							<TableRow
								key={student.id}
								sx={{
									"&:last-child td, &:last-child th": {
										border: 0,
									},
								}}
							>
								<ShowForCondition condition={student.visible}>
									<TableCell>
										<Checkbox
											checked={student.selected}
											onClick={(e) => {
												changeSelected(e.target.checked, i);
											}}
										></Checkbox>
									</TableCell>
									<TableCell>{student.email}</TableCell>
									<TableCell>{student.firstName}</TableCell>
									<TableCell>{student.lastName}</TableCell>
								</ShowForCondition>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
};

export default StudentSelector;
