import { axiosWithCredentials } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

// Used to provide automatic refreshing of access tokens, created with the help of 
// Dave Gray's expressjs tutorial https://www.youtube.com/watch?v=nI8PYZNFtac&ab_channel=DaveGray
const useAxiosWithAT = () => {
	const { auth } = useAuth();
	const refresh = useRefreshToken();
	useEffect(() => {
		const reqIntercept = axiosWithCredentials.interceptors.request.use(
			(config) => {
				if (!config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
				}
				return config;
			},
			(e) => Promise.reject(e)
		);

		const resIntercept = axiosWithCredentials.interceptors.response.use(
			(res) => res,
			async (e) => {
                try {
                    const prevReq = e?.config;
                    if (e?.response?.status === 403 && !prevReq?.triedToUpdateAccessToken && e?.response?.data?.message === "accesstoken") {
                        prevReq.triedToUpdateAccessToken = true;
                        const { accessToken: newAccessToken } = await refresh();
                        prevReq.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        return axiosWithCredentials(prevReq);
                    }
                }
                catch (e) {
                    // Refresh most likely failed
                }
                return Promise.reject(e);
			}
		);

		return () => {
			axiosWithCredentials.interceptors.request.eject(reqIntercept);
			axiosWithCredentials.interceptors.response.eject(resIntercept);
		};
	}, [auth, refresh]);

	return axiosWithCredentials;
};

export default useAxiosWithAT;
