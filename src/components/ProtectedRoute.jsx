import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAllowed(false);
        return;
      }

      const { data, error } = await supabase.rpc(
        "has_active_subscription"
      );

      if (error) {
        console.error("Subscription check error:", error);
        setAllowed(false);
        return;
      }

      setAllowed(data === true);
    } catch (error) {
      console.error("Protected route error:", error);
      setAllowed(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">
            Checking subscription...
          </div>
          <p className="text-slate-400 mt-2">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <Navigate
        to="/subscribe"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;