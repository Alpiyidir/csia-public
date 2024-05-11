import useAuth from "../hooks/useAuth";

const ShowForRole = ({ role, children }) => {
    const { auth } = useAuth();
    if (auth?.role === role) {
        return children;
    } else {
        return null;
    }
};

export default ShowForRole;
