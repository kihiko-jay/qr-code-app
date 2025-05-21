import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/auth.module.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Enhanced validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("All fields are required");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          role: formData.role
        }),
        credentials: "include",
        mode: "cors"
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || 
          (data.code === "USER_EXISTS" ? "Email or username already exists" : "Registration failed")
        );
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.qrPattern} style={{ top: '20%', left: '10%' }} />
        <div className={styles.qrPattern} style={{ bottom: '15%', right: '12%' }} />
        
        <div className={styles.card}>
          <h2 className={styles.title}>Create Account</h2>
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={loading}
              />
              <small className={styles.hint}>Minimum 8 characters</small>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Account Type</label>
              <select
                name="role"
                className={styles.input}
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="user">Standard User</option>
                <option value="paid">Premium User</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.loading} />
                  Registering...
                </>
              ) : "Sign Up"}
            </button>
          </form>
          
          <p className={styles.text}>
            Already have an account?{" "}
            <Link to="/login" className={styles.link}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;