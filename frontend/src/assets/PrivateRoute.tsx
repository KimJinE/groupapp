import { ReactElement } from "react";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
    children: ReactElement;
}

function PrivateRoute({children}: PrivateRouteProps): JSX.Element {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;