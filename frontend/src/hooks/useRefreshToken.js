import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
	const { setAuth } = useAuth();

	const refresh = async () => {
		try {
			const res = await axios.get("/refresh", {
				withCredentials: true,
			});

			setAuth(res.data);
			return res.data;
		} catch (e) {
			// If this error happens, then it means that the request to refresh failed.
			return Promise.reject(e);
		}
	};
	return refresh;
};

export default useRefreshToken;
