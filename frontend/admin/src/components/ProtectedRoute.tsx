import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import type { Role } from "../app/redux/authSlice";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  redirectPath?: string;
}

export default function ProtectedRoute({
  allowedRoles,
  redirectPath = "/",
}: ProtectedRouteProps) {
  const role = useSelector((state: RootState) => state.auth.role);

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
