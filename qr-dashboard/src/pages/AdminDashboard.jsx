import { useEffect, useState } from "react";
import { verifyToken, logout } from "../utils/authService";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await verifyToken();
      if (res.userId) {
        setUser(res.userId);
      } else {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async (url, setter) => {
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
      }
    };

    if (user) {
      if (activeTab === "users") {
        fetchData("http://localhost:5000/api/admin/users", setUsers);
      } else if (activeTab === "qrCodes") {
        fetchData("http://localhost:5000/api/admin/qrcodes", setQrCodes);
      } else if (activeTab === "payments") {
        fetchData("http://localhost:5000/api/admin/payments", setPayments);
      }
    }
  }, [activeTab, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h2>Admin Panel</h2>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
        <ul className={styles.nav}>
          <li
            className={activeTab === "users" ? styles.active : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </li>
          <li
            className={activeTab === "qrCodes" ? styles.active : ""}
            onClick={() => setActiveTab("qrCodes")}
          >
            QR Codes
          </li>
          <li
            className={activeTab === "payments" ? styles.active : ""}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </li>
        </ul>
      </aside>

      <main className={styles.content}>
        {activeTab === "users" && (
          <div className={styles.section}>
            <h2>Manage Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button className={styles.warningButton}>Block</button>
                      <button className={styles.dangerButton}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "qrCodes" && (
          <div className={styles.section}>
            <h2>QR Code Analytics</h2>
            <table>
              <thead>
                <tr>
                  <th>QR Code</th>
                  <th>Scans</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map(qr => (
                  <tr key={qr._id}>
                    <td>{qr.data}</td>
                    <td>{qr.scanCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "payments" && (
          <div className={styles.section}>
            <h2>Payment Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.user?.name} ({payment.user?.email})</td>
                    <td>${payment.amount}</td>
                    <td>
                      <span className={
                        payment.status === "completed" ? styles.successText : styles.errorText
                      }>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;