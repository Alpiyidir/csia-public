import { useRef, useState, useEffect } from "react";
import Axios from "axios";
import {
    faCheck,
    faTimes,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../Register.css"
require("dotenv").config();

const USERNAME_REGEX = /^[a-zA-Z0-9-_]{6,24}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]){8,100}$/;

function Register() {
    const usernameRef = useRef()
    const errRef = useRef();

    const [username, setUsername] = useState("");
    const [validUsername, setValidUsername] = useState(false);
    const [usernameFocus, setUsernameFocus] = useState(false);

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [verifyPwd, setVerifyPwd] = useState("");
    const [validVerifyPwd, setValidVerifyPwd] = useState(false);
    const [verifyPwdFocus, setVerifyPwdFocus] = useState(false);

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        usernameRef.current.focus();
    }, []);

    useEffect(() => {
        const res = USERNAME_REGEX.test(username);
        console.log(res);
        console.log(username);
        setValidUsername(res);
    }, [username]);

    useEffect(() => {
        const res = PWD_REGEX.test(pwd);
        console.log(res);
        console.log(pwd);
        setValidPwd(res);
        const match = pwd === verifyPwd;
        setValidVerifyPwd(match);
    }, [pwd, verifyPwd]);

    useEffect(() => {
        setErrMsg("");
    }, [username, pwd, verifyPwd]);

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "none"}>
                {errMsg}
            </p>
            <h1>Register</h1>
            <form>
                <label htmlFor="username">
                    Username:
                    <span className={validUsername ? "check" : "none"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span
                        className={
                            !validUsername && username ? "times" : "none"
                        }
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="text"
                    id="username"
                    ref={usernameRef}
                    autoComplete="off"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    onFocus={() => setUsernameFocus(true)}
                    onBlur={() => setUsernameFocus(false)}
                />
                <p
                    id="usernamenote"
                    className={
                        usernameFocus && username && !validUsername
                            ? "instructions"
                            : "none"
                    }
                >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    6 to 24 characters. <br />
                    Letters, numbers, underscores, hyphens allowed. <br />
                </p>
				<label htmlFor="pwd">
					Password:
				</label>
				<input
					type = "text"
					id="pwd"
					autocomplete="off"
					onChange={(e) => setPwd(e.target.value)}
					required
					onFocus={() => setPwdFocus(true)}
					onBlur={() => setPwdFocus(false)}
				/>
				<p 
					id="pwdnote"
					
            </form>
        </section>
    );
}

export default Register;
