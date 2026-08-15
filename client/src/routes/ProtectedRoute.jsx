import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  const location = useLocation();

  // Wait until AuthContext finishes checking
  // whether the user has a valid session.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // User is not logged in.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // User is authenticated.
  return <Outlet />;
};

export default ProtectedRoute;
