import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));

          setAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
