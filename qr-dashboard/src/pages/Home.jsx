import { useEffect, useState } from "react";
import { verifyToken } from "../utils/authService";
import { Link } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await verifyToken();
      if (res.userId) {
        setUser(res.userId);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="p-6">
      <h1>Welcome to QR Code Dashboard</h1>
      {user ? (
        <Link to="/dashboard" className="bg-blue-500 text-white p-2 rounded">Go to Dashboard</Link>
      ) : (
        <Link to="/login" className="bg-green-500 text-white p-2 rounded">Login</Link>
      )}
    </div>
  );
}

export default Home;
