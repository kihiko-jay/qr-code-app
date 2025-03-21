import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminQrCodes.module.css";

const AdminQrCodes = () => {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQrCodes = async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/qrcodes`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );

                setQrCodes(res.data);
            } catch (err) {
                console.error("Error fetching QR codes:", err);
                setError("Failed to load QR codes.");
            } finally {
                setLoading(false);
            }
        };

        fetchQrCodes();
    }, [navigate]);

    const deleteQrCode = async (qrId) => {
        if (!window.confirm("Are you sure you want to delete this QR code?")) return;

        try {
            const token = sessionStorage.getItem("token");

            await axios.delete(
                `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/qrcodes/${qrId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            setQrCodes(qrCodes.filter((qr) => qr._id !== qrId));
        } catch (err) {
            console.error("Error deleting QR code:", err);
            alert("Failed to delete QR code.");
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
            <h1 className={styles.title}>Manage QR Codes</h1>
            <div className={styles.tableContainer}>
                <table className={styles.qrTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>QR Name</th>
                            <th>Created By</th>
                            <th>Creation Date</th>
                            <th>QR Code</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qrCodes.map((qr) => (
                            <tr key={qr._id}>
                                <td className={styles.idCell}>{qr._id}</td>
                                <td>{qr.name}</td>
                                <td className={styles.userCell}>
                                    <span className={styles.userBadge}>
                                        {qr.createdBy.username}
                                    </span>
                                </td>
                                <td className={styles.dateCell}>
                                    {new Date(qr.createdAt).toLocaleDateString()}
                                </td>
                                <td className={styles.qrImageCell}>
                                    <img 
                                        src={qr.qrImageUrl} 
                                        alt="QR Code" 
                                        className={styles.qrImage}
                                    />
                                </td>
                                <td className={styles.actionsCell}>
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => deleteQrCode(qr._id)}
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

export default AdminQrCodes;