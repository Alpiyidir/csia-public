import React from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout"
import { routePaths as p } from "../config";

function About() {
    const navigate = useNavigate();
    const logout = useLogout();
	return (
		<div>
			<div>Are you sure you want to logout?</div>
			<div>
				<button onClick={() => {logout(); navigate(`/${p.login}`)}}>Yes</button> 
                <button onClick={() => {navigate(-1)}}>No</button>
			</div>
		</div>
	);
}

export default About;
