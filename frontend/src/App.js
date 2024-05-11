import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { routePaths as p, routePaths } from "./config";

import Home from "./components/Home";
import Error from "./components/Error"
import Login from "./components/Login";
import Profile from "./components/Profile";
import Quiz from "./components/Quiz";
import Register from "./components/Register";
import PersistentLogin from "./components/PersistentLogin";
import Logout from "./components/Logout";
import StudentQuizEnrollment from "./components/StudentQuizEnrollment";
import TeacherQuizEnrollments from "./components/TeacherQuizEnrollments";
import RequireAuth from "./components/RequireAuth";
import DynamicNavbar from "./components/DynamicNavbar";
import CreateOrEditQuiz from "./components/CreateOrEditQuiz";

class App extends React.Component {	
	render() {
		return (
			<Router>
				<div style={{display: "inline-block"}}>
					<p style={{fontSize: "26px", marginBottom: "0px"}}><b>MasterAccess</b></p>
				</div>
				{
					
				}
				
				<DynamicNavbar/>
				<Routes>
				
                    <Route path={p.register} element={<Register />} />
					<Route path={p.login} element={<Login />} />
					

					{/* protected */}
					<Route element={<PersistentLogin/>}>
						<Route element={<RequireAuth allowedRoles={["teacher", "student"]}/>}>
							<Route path={p.root} element={<Home />} />
							<Route path={p.profile} element={<Profile />} />
							<Route path={p.quiz} element={<Quiz />} />
							<Route path={p.logout} element={<Logout/>} />
						</Route>

						<Route element={<RequireAuth allowedRoles={["teacher"]}/>}>
							<Route path={p.teacherQuizEnrollments} element={<TeacherQuizEnrollments />}></Route>
							<Route path={p.createOrEditQuiz} element={<CreateOrEditQuiz />}></Route>
						</Route>

						<Route element={<RequireAuth allowedRoles={["student"]}/>}>
							<Route path={p.studentQuizEnrollment} element={<StudentQuizEnrollment />}></Route>
						</Route>
					</Route>

					{/* catch other routes */}
					<Route path="*" element={<Error />} />
					
				</Routes>
			</Router>
		);
	}
}

export default App;
