import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";

// Persistent login functionality adapted from Dave Gray @ https://www.youtube.com/watch?v=27KeYk-5vJw&ab_channel=DaveGray
const PersistentLogin = () => {
	const { auth } = useAuth();
	const refresh = useRefreshToken();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const updateAccessToken = async () => {
			try {
				await refresh();
				
			} catch (e) {
                // If the requst to refresh fails, then this means that the refreshToken has most likely expired.
				console.log(e);
			}
			setIsLoading(false);
		};
		!auth?.accessToken ? updateAccessToken() : setIsLoading(false);
	}, []);

	return <>{isLoading ? <p>Loading</p> : <Outlet />}</>;
};

export default PersistentLogin;
