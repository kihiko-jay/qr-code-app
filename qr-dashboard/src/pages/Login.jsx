import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import styles from "../styles/auth.module.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value.trim(), // Trim whitespace immediately
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!credentials.email || !credentials.password) {
      setError("Both email and password are required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      // Use correct .env variable based on the environment
      const apiUrl = import.meta.env.VITE_API_URL ?? process.env.REACT_APP_API_URL ?? 'http://localhost:5000'; 

      console.log("API URL:", apiUrl); // ✅ Debugging: Ensure the API URL is correct
      console.log("Login Attempt - Email:", credentials.email);
      console.log("Login Attempt - Password:", credentials.password);

      const response = await axios.post(
        `${apiUrl}/api/auth/login`, // ✅ Fixed axios.post syntax
        {
          email: credentials.email.toLowerCase(), // Normalize email
          password: credentials.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // For cross-origin cookies if needed
        }
      );

      // Secure token handling
      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";

      console.error("Login error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.qrPattern} style={{ top: "20%", left: "10%" }} />
        <div className={styles.qrPattern} style={{ bottom: "15%", right: "12%" }} />
        <div className={styles.card}>
          <h2 className={styles.title}>Welcome Back</h2>
          {error && <p className={styles.error}>{error}</p>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.input}
                value={credentials.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={styles.input}
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.showPasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.button} 
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className={styles.links}>
            <Link to="/signup" className={styles.link}>Create Account</Link>
            <Link to="/forgot-password" className={styles.link}>Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
