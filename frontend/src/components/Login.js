import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import {routePaths as p} from "../config"
import "../Login.css";

function Login() {
	const navigate = useNavigate();
	const { setAuth } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		login();
	};

	useEffect(() => {
		setError("");
	}, [email, password]);

	const login = async () => {
		try {
			const res = await axios.post(
				"/auth",
				{
					email: email,
					password: password,
				},
				{ withCredentials: true }
			);
			setAuth(res.data);
			navigate(p.root);
		} catch (e) {
			console.log(e);
			if (e?.response?.data?.message) {
				setError(e.response.data.message);
			} else {
				setError(e.message);
			}
		}
	};

	return (
		<div>
			<h1>Log In</h1>
			<form onSubmit={(e) => handleSubmit(e)}>
				<div>
					<label class="logreg" htmlFor="email">
						Email
					</label>
					<input
						class="logreg"
						type="text"
						id="email"
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div>
					<label class="logreg" htmlFor="password">
						Password
					</label>
					<input
						class="logreg"
						type="text"
						id="password"
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<input type="submit" value="Log In"></input>
			</form>
			<div>
				<label class="logreg" htmlFor="registerlink">Already have an account? </label>
				<Link id="registerlink" to="/register">
					Register
				</Link>
				<p id="error" className={error === "" ? "none" : "display"}>
					Error: {error}
				</p>
			</div>
		</div>
	);
}

export default Login;
