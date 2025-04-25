import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaQrcode, 
  FaChartLine, 
  FaCrown, 
  FaUserShield,
  FaPalette,
  FaImage,
  FaShieldAlt,
  FaServer,
  FaBolt,
  FaHeadset
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import styles from "../styles/PremiumDashboard.module.css";

const PremiumDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCodes: 0,
    scansToday: 0,
    premiumUntil: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPremiumData = async () => {
      try {
        // In a real app, fetch from your backend API
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/user/premium-status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Failed to fetch premium data");
        
        const { userData, stats } = await response.json();
        
        setStats({
          totalCodes: stats.totalCodes || 0,
          scansToday: stats.scansToday || 0,
          premiumUntil: stats.premiumUntil || ""
        });
        
        setUser({
          username: userData.username,
          email: userData.email,
          isPremium: true
        });
        
      } catch (error) {
        console.error("Error fetching premium data:", error);
        // Redirect to payment if not premium
        if (error.message.includes("not premium")) {
          navigate("/payment");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCreatePremiumQR = () => {
    navigate("/dashboard/premium-qr-generator");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your premium dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.premiumContainer}>
      {/* Premium Header */}
      <header className={styles.premiumHeader}>
        <div className={styles.headerContent}>
          <div className={styles.premiumBadge}>
            <FaCrown className={styles.crownIcon} />
            <span>PREMIUM MEMBER</span>
          </div>
          <h1>Welcome back, {user?.username || 'Premium User'}</h1>
          <p className={styles.subtitle}>
            You have full access to all premium features until {stats.premiumUntil || "your subscription ends"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.premiumContent}>
        {/* Stats Overview */}
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaQrcode />
            </div>
            <h3>Your QR Codes</h3>
            <p className={styles.statValue}>{stats.totalCodes}</p>
            <p className={styles.statLabel}>Active Codes</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaChartLine />
            </div>
            <h3>Today's Scans</h3>
            <p className={styles.statValue}>{stats.scansToday}</p>
            <p className={styles.statLabel}>Total Scans</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaUserShield />
            </div>
            <h3>Premium Status</h3>
            <p className={styles.statValue}>Active</p>
            <p className={styles.statLabel}>Until {stats.premiumUntil}</p>
          </div>
        </section>

        {/* Premium Features */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Your Premium Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaPalette />
              </div>
              <h3>Custom Branding</h3>
              <p>Create branded QR codes with your colors and logo</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaImage />
              </div>
              <h3>Logo Integration</h3>
              <p>Embed your logo directly into QR codes</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaShieldAlt />
              </div>
              <h3>Advanced Security</h3>
              <p>Password-protected and dynamic QR codes</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaServer />
              </div>
              <h3>API Access</h3>
              <p>Integrate with your existing systems</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaBolt />
              </div>
              <h3>Bulk Generation</h3>
              <p>Create hundreds of QR codes at once</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FaHeadset />
              </div>
              <h3>Priority Support</h3>
              <p>24/7 dedicated support team</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionButtons}>
            <button 
              className={styles.primaryButton}
              onClick={handleCreatePremiumQR}
            >
              <FaQrcode /> Create Premium QR Code
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={() => navigate('/dashboard/analytics')}
            >
              View Analytics Dashboard
            </button>
            <button 
              className={styles.tertiaryButton}
              onClick={() => navigate('/dashboard/bulk-generator')}
            >
              Bulk QR Generator
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.premiumFooter}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Need help? <a href="/support">Contact our premium support</a>
          </p>
          <button 
            onClick={handleLogout} 
            className={styles.logoutButton}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PremiumDashboard;