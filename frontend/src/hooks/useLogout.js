import axios from "../api/axios";
import useAuth from "../hooks/useAuth";

const useLogout = () => {
	const { setAuth } = useAuth();

	const logout = async () => {
		setAuth({});
		try {
			await axios.get("/logout", { withCredentials: true });
		} catch (e) {
			console.log(e);
		}
	};

	return logout;
};

export default useLogout;
