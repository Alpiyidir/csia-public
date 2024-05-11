
import { useRef, useState, useEffect, Checkbox } from "react";
import {Link} from "react-router-dom";
import Axios from "axios";
import "../Register.css"

const NAME_REGEX = /^[a-zA-Z]{2,24}$/
const USERNAME_REGEX = /^[a-zA-Z0-9-_]{6,24}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]){8,100}$/;

function Register() {
    const usernameRef = useRef()

    const [username, setUsername] = useState("");
    const [validUsername, setValidUsername] = useState(false);

    const [firstName, setFirstName] = useState("")
    const [validFirstName, setValidFirstName] = useState("")

    const [lastName, setLastName] = useState("")
    const [validLastName, setValidLastName] = useState("")

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);

    const [confirmPwd, setConfirmPwd] = useState("");
    const [validConfirmPwd, setValidConfirmPwd] = useState(false);

    const teacherKeyLabel = useRef()
    const [teacherKey, setTeacherKey] = useState(false)
    const teacherCheckboxRef = useRef()
    

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

	// Sets the username box as focus after DOMContentloaded
    useEffect(() => {
        usernameRef.current.focus();
    }, []);

    useEffect(() => {
        const res = USERNAME_REGEX.test(username);
        setValidUsername(res);
    }, [username]);

    useEffect(() => {
        const res = PWD_REGEX.test(pwd);
        setValidPwd(res);
        const match = pwd === confirmPwd;
        setValidConfirmPwd(match);
    }, [pwd, confirmPwd]);

    useEffect(() => {
        const status = teacherCheckboxRef.current
        console.log(status)
    }, [teacherCheckboxRef])

    return (
        <section>
            <h1>Register</h1>
            <form>
                <label htmlFor="username">
                    Username:
                </label>
                <input
                    type="text"
                    id="username"
                    ref={usernameRef}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
				<label htmlFor="pwd">
					Password:
				</label>
				<input
					type="text"
					id="pwd"
					autoComplete="off"
					onChange={(e) => setPwd(e.target.value)}
					required
				/>
				<label htmlFor="confirmpwd">
					Confirm Password:
				</label>
				<input
					type="text"
					id="confirmpwd"
					autoComplete="off"
					onChange={(e) => setConfirmPwd(e.target.value)}
					required
				/>
                <label htmlFor="teacherkey" className={hideTeacherKeyLabel}>
                    Teacher registration key:
                </label>
                <input
                    type="text"
                    id="teacherkey"
                    autoComplete="off"
                    onChange={(e) => setTeacherKey(e.target.value)}
                />
                <label htmlFor="teachercheckbox">
                    I'm a teacher
                </label>
                <input id="teachercheckbox" type="checkbox"/>
                <button>Sign Up</button>
            </form>
            <label htmlFor="loginlink">
                Already Registered?
            </label>
            <Link id="loginlink" to="/login">Login</Link>
        </section>
    );
}

export default Register;
