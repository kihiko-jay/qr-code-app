import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { FiUsers, FiPackage, FiLogOut, FiMenu } from "react-icons/fi";
import { FaQrcode } from "react-icons/fa";
import styles from "../styles/Dashboard.module.css";

const getInitials = (username) => {
  if (!username) return "U";
  return username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalCodes: 0, monthlyScans: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchStats = useCallback(async (token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${apiUrl}/api/qrcodes/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError(prev => prev || "Failed to load statistics");
    }
  }, []);

  const handleAuthError = useCallback((err) => {
    console.error("Auth error:", err);
    const errorMessage = err.response?.data?.message || "Authentication failed";
    setError(errorMessage);
    
    if (err.response?.status === 401) {
      sessionStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res.data;
      sessionStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      await fetchStats(token);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, handleAuthError, navigate]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Don't fetch user if we already have it in sessionStorage
        if (parsedUser) return;
      } catch (e) {
        console.error("User data parsing error:", e);
        sessionStorage.removeItem("user");
      }
    }
    
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const checkSession = () => {
      const token = sessionStorage.getItem("token");
      if (!token) navigate("/login");
    };

    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const initials = useMemo(() => getInitials(user?.username), [user?.username]);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
    </div>
  );

  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <p>{error}</p>
        <div className={styles.errorActions}>
          <button onClick={() => window.location.reload()}>Retry</button>
          <button onClick={() => navigate("/login")}>Login Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* ... rest of your JSX remains exactly the same ... */}
    </div>
  );
};

export default Dashboard;