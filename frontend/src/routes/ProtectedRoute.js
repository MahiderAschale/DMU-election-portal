import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  // normalize role
  if (user) {
    user.role = user.role?.toLowerCase().trim();
  }

  return children;
}

export default ProtectedRoute;