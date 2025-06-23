import { Navigate, Outlet } from "react-router-dom";
// import jwtDecode from "jwt-decode"; 

import { jwtDecode } from "jwt-decode";
const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!token || !storedRole) {
        return <Navigate to="/" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const tokenRole = decodedToken.role; // Assuming the role is stored as `role` in the token

        // Token expiration check
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");

            return <Navigate to="/" />;
        }

        // Role verification: Check token role matches stored role
        if (tokenRole === storedRole && allowedRoles.includes(tokenRole)) {
            return <Outlet />;
        } else {
            return <Navigate to="/unauthorized" />;
        }

    } catch (error) {
        console.error("Invalid token format:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        return <Navigate to="/" />;
    }
};

export default ProtectedRoute;
