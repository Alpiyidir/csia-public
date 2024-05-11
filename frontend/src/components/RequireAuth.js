import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { routePaths as p } from "../config"

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();
    
    return allowedRoles.includes(auth?.role) ? (
        <Outlet />
    ) : auth?.role ? (
        <Navigate to={`/${p.root}`} state={{ from: location }} replace />
    ) : (
        <Navigate to={`/${p.login}`} state={{ from: location }} replace />
    );
};

export default RequireAuth;
