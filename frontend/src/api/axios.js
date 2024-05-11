import axios from "axios";
const BASE_URL = "http://localhost:9000";

export default axios.create({
	baseURL: BASE_URL,
});

export const axiosWithCredentials = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});
