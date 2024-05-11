import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DynamicNavbar = () => {
	const { auth } = useAuth();
	
	return auth?.role ? (
		<nav>
			<Link to="/"> Home </Link>
			<Link to="/quiz"> Quiz </Link>
			<Link to="/logout"> Logout</Link>
		</nav>
	) : (
		<nav>
			<Link to="/register"> Register </Link>
			<Link to="/login"> Login </Link>
		</nav>
	);
};

export default DynamicNavbar;
