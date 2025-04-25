import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/auth.module.css";

// Constants
const MIN_PASSWORD_LENGTH = 8;
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 300000; // 5 minutes in milliseconds
const API_TIMEOUT = 15000; // 15 seconds
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    email: "", 
    password: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeoutActive, setTimeoutActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing token on initial render
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate(location.state?.from || "/combinedQrGenerator", { replace: true });
    }
  }, [navigate, location]);

  // Reset error when inputs change
  useEffect(() => {
    if (error && (credentials.email || credentials.password)) {
      setError("");
    }
  }, [credentials.email, credentials.password]);

  // Handle lockout timeout
  useEffect(() => {
    let timer;
    if (attempts >= MAX_ATTEMPTS) {
      setTimeoutActive(true);
      let timeLeft = LOCKOUT_TIME / 1000; // Convert to seconds
      
      timer = setInterval(() => {
        timeLeft -= 1;
        setRemainingTime(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          setAttempts(0);
          setTimeoutActive(false);
        }
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [attempts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: name === "password" ? value : value.trim()
    }));
  };

  const validateForm = () => {
    if (!credentials.email || !credentials.password) {
      setError("Both email and password are required");
      return false;
    }

    if (!EMAIL_REGEX.test(credentials.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || timeoutActive) return;

    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 
                    process.env.REACT_APP_API_BASE_URL || 
                    'http://localhost:5000';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        {
          email: credentials.email.toLowerCase(),
          password: credentials.password,
        },
        {
          headers: { 
            "Content-Type": "application/json",
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.data?.token) {
        throw new Error("Authentication failed: No token received");
      }

      // Store authentication data consistently
      localStorage.setItem("authToken", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Redirect to intended location or default page
      navigate(location.state?.from || "/combinedQrGenerator", { replace: true });

    } catch (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        // Handle specific error codes from backend
        switch (error.response.data?.code) {
          case "INVALID_CREDENTIALS":
            errorMessage = "Invalid email or password";
            break;
          case "ACCOUNT_LOCKED":
            errorMessage = "Account temporarily locked";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.name === "AbortError") {
        errorMessage = "Request timeout. Please check your connection.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      console.error("Login error:", error);
      setError(`${errorMessage} ${newAttempts < MAX_ATTEMPTS ? `(Attempt ${newAttempts}/${MAX_ATTEMPTS})` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  // Format remaining lockout time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.qrPattern} style={{ top: "20%", left: "10%" }} />
        <div className={styles.qrPattern} style={{ bottom: "15%", right: "12%" }} />
        
        <div className={styles.card}>
          <h2 className={styles.title}>Welcome Back</h2>
          
          {error && (
            <div className={styles.error} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              {error}
              {timeoutActive && (
                <div className={styles.lockoutWarning}>
                  Account locked. Try again in {formatTime(remainingTime)}
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.input}
                value={credentials.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading || timeoutActive}
                aria-invalid={!!error}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
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
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={loading || timeoutActive}
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  className={styles.showPasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || timeoutActive}
                  tabIndex={-1} // Prevent tab focus on this button
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
              <small className={styles.helpText}>
                Minimum {MIN_PASSWORD_LENGTH} characters
              </small>
            </div>

            <button 
              type="submit" 
              className={styles.button} 
              disabled={loading || timeoutActive || attempts >= MAX_ATTEMPTS}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Signing In...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className={styles.links}>
            <Link to="/signup" className={styles.link}>
              Don't have an account? Create one
            </Link>
            
            <Link to="/forgot-password" className={styles.link}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;