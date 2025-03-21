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
  }, [navigate]);

  const fetchStats = async (token) => {
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
  };

  const handleAuthError = (err) => {
    console.error("Auth error:", err);
    const errorMessage = err.response?.data?.message || "Authentication failed";
    setError(errorMessage);
    
    if (err.response?.status === 401) {
      sessionStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("User data parsing error:", e);
        sessionStorage.removeItem("user");
      }
    }
    
    fetchUser();

    const checkSession = () => {
      const token = sessionStorage.getItem("token");
      if (!token) navigate("/login");
    };

    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, [fetchUser, navigate]);

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
      <button 
        className={styles.mobileMenuToggle}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <FiMenu />
      </button>

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <FaQrcode className={styles.brandIcon} />
          <h2>QR Expert</h2>
        </div>

        <nav className={styles.nav}>
          {[
            { path: "/dashboard/generate", label: "Basic Generator", icon: <FaQrcode /> },
            { path: "/dashboard/combined", label: "Advanced Generator", icon: <FaQrcode /> },
            { path: "/dashboard/my-qrcodes", label: "My Codes", icon: <FiPackage /> },
            ...(user?.role === "admin" ? [
              { path: "/admin/users", label: "Manage Users", icon: <FiUsers /> },
              { path: "/admin/qrcodes", label: "All Codes", icon: <FaQrcode /> }
            ] : [])
          ].map((item) => (
            <button
              key={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.userPanel}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <p className={styles.userName}>{user?.username || "Guest"}</p>
            <p className={styles.userRole}>{user?.role || "Member"}</p>
          </div>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Welcome back, {user?.username?.split(" ")?.[0] || "User"}</h1>
          <div className={styles.statsContainer}>
            {[
              { title: "Total QR Codes", value: stats.totalCodes },
              { title: "Monthly Scans", value: stats.monthlyScans?.toLocaleString() || 0 }
            ].map((stat) => (
              <div key={stat.title} className={styles.statCard}>
                <h3>{stat.title}</h3>
                <p>{stat.value || <span className={styles.skeleton}>--</span>}</p>
              </div>
            ))}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;