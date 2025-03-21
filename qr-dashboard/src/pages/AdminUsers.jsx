import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminUsers.module.css"; // CSS module import

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Keep all original useEffect and data fetching logic
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/users`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );

                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    // Preserve original delete functionality
    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = sessionStorage.getItem("token");

            await axios.delete(
                `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/users/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            setUsers(users.filter((user) => user._id !== userId));
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Failed to delete user.");
        }
    };

    // Preserve original promote functionality
    const promoteToAdmin = async (userId) => {
        try {
            const token = sessionStorage.getItem("token");

            const res = await axios.put(
                `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/users/${userId}/promote`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            setUsers(users.map((user) => (user._id === userId ? res.data : user)));
        } catch (err) {
            console.error("Error promoting user:", err);
            alert("Failed to promote user.");
        }
    };

    if (loading) return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
        </div>
    );

    if (error) return (
        <div className={styles.errorContainer}>
            <div className={styles.errorCard}>
                <p>{error}</p>
                <button onClick={() => navigate("/login")}>Return to Login</button>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Users</h1>
            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className={styles.idCell}>{user._id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={
                                        user.role === "admin" ? styles.adminBadge : styles.userBadge
                                    }>
                                        {user.role}
                                    </span>
                                </td>
                                <td className={styles.actionsCell}>
                                    {user.role !== "admin" && (
                                        <button 
                                            className={styles.promoteButton}
                                            onClick={() => promoteToAdmin(user._id)}
                                        >
                                            Promote to Admin
                                        </button>
                                    )}
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => deleteUser(user._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;