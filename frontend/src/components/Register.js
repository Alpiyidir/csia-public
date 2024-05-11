import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { routePaths as p } from "../config"
import "../Register.css";

function Register() {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordsMatch, setPasswordsMatch] = useState(false);
	const [teacherKey, setTeacherKey] = useState("");

	const [checked, setChecked] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		register();
	};

	const register = async () => {
		// Guard to check if passwords match on the front end before sending form to the API
		if (passwordsMatch === false) {
			setError("Passwords do not match.");
			return;
		}

		try {
			// If the I'm a teacher checkbox is unchecked, the teacherKey is sent as an empty string as user did not intent do send it.

			var teacherKeyToBeSent = teacherKey;
			if (checked === false) {
				teacherKeyToBeSent = "";
			}
			const res = await axios.post("/register", {
				email: email,
				firstName: firstName,
				lastName: lastName,
				password: password,
				teacherKey: teacherKeyToBeSent,
			});

			if (res.data?.created === false) {
				if (res.data?.message) {
					setError(res.data.message);
				} else {
					setError("Unknown error, account not created.");
				}
			} else {
				navigate(`/${p.login}`);
			}
		} catch (e) {
			if (e?.response?.data?.message) {
				setError(e.response.data.message);
			} else {
				setError("Unexpected http error with code " + e.request.status);
			}
		}
	};

	useEffect(() => {
		password === confirmPassword
			? setPasswordsMatch(true)
			: setPasswordsMatch(false);
	}, [password, confirmPassword]);

	useEffect(() => {
		setError("");
	}, [email, firstName, lastName, password, confirmPassword, teacherKey]);

	return (
		<section>
			<h1>Register</h1>
			<form onSubmit={(e) => handleSubmit(e)}>
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
				<label class="logreg" htmlFor="firstname">
					First Name
				</label>
				<input
					class="logreg"
					type="text"
					id="firstname"
					onChange={(e) => setFirstName(e.target.value)}
					required
				/>
				<label class="logreg" htmlFor="lastname">
					Last Name
				</label>
				<input
					class="logreg"
					type="text"
					id="lastname"
					onChange={(e) => setLastName(e.target.value)}
					required
				/>
				<label class="logreg" htmlFor="password">
					Password
				</label>
				<input
					class="logreg"
					type="text"
					id="password"
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="off"
					required
				/>
				<label class="logreg" htmlFor="confirmpwd">
					Confirm Password
				</label>
				<input
					class="logreg"
					type="text"
					id="confirmpwd"
					onChange={(e) => setConfirmPassword(e.target.value)}
					autoComplete="off"
					required
				/>
				<div className={checked ? "display" : "none"}>
					<label class="logreg" htmlFor="teacherkey">
						Teacher registration key
					</label>
					<input
						class="logreg"
						type="text"
						id="teacherkey"
						autoComplete="off"
						onChange={(e) => setTeacherKey(e.target.value)}
						required={checked ? "required" : null}
					/>
				</div>
				<div style={{ textAlign: "center" }}>
					<label class="checkbox" htmlFor="teachercheckbox">
						I'm a teacher
					</label>
					<input
						id="teachercheckbox"
						type="checkbox"
						onChange={(e) => {
							setChecked(e.target.checked);
						}}
					/>
				</div>

				<button type="submit" value="Sign Up">
					Sign Up
				</button>
			</form>
			<label class="logreg" htmlFor="loginlink">Already registered? </label>
			<Link id="loginlink" to="/login">
				Login
			</Link>
			<p id="error" className={error === "" ? "none" : "display"}>
				Error: {error}
			</p>
		</section>
	);
}

export default Register;
