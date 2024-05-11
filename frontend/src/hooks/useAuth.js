import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

export default () => {
	return useContext(AuthContext);
};