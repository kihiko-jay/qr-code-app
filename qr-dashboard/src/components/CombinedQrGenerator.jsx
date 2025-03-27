import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import styles from "../styles/CombinedQrGenerator.module.css";

const DEFAULT_USER = { role: "paid" };

const CombinedQRGenerator = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    qrData: "",
    color: "#000000",
    logo: null,
    generatedUrl: "",
    loading: false,
    error: null,
    logoPreview: ""
  });

  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : DEFAULT_USER;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return DEFAULT_USER;
    }
  };

  const user = getUserData();
  const isPremium = user.role === "premium";

  useEffect(() => {
    return () => {
      if (state.logoPreview) URL.revokeObjectURL(state.logoPreview);
    };
  }, [state.logoPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setState(prev => ({ ...prev, error: "Invalid file type - only images allowed" }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: "File size must be less than 2MB" }));
      return;
    }

    setState(prev => ({
      ...prev,
      logo: file,
      logoPreview: URL.createObjectURL(file),
      error: null
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      setState(prev => ({ ...prev, error: "Not authenticated. Please login again." }));
      return;
    }

    if (!validateInput(state.qrData)) return;

  // Removed duplicate handleGenerate function definition

    setState(prev => ({ ...prev, loading: true, error: null }));

    const formData = new FormData();
    formData.append("data", state.qrData);
    
    if (isPremium) {
      formData.append("color", state.color);
      if (state.logo) formData.append("logo", state.logo);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/qrcode/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000
        }
      );

      setState(prev => ({
        ...prev,
        generatedUrl: response.data.qrImageUrl,
        error: null
      }));
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const validateInput = (input) => {
    if (!input.trim()) {
      setState(prev => ({ ...prev, error: "Please enter valid content for the QR code" }));
      return false;
    }
    
    try {
      new URL(input);
    } catch (_) {
      if (!confirm("The input doesn't look like a valid URL. Generate anyway?")) return false;
    }
    
    return true;
  };

  const handleGenerationError = (error) => {
    console.error("Full error object:", error);
    console.error("Error response:", error.response);
    
    const errorMessage = error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      "Failed to generate QR code. Please try again.";
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      generatedUrl: ""
    }));
  };
  const handleDownload = () => {
    if (!state.generatedUrl) return;
    
    const filename = `QR_${state.qrData.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}.png`;
    const link = document.createElement("a");
    link.href = state.generatedUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!state.generatedUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this QR Code",
          url: state.generatedUrl
        });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(state.generatedUrl)}`, "_blank");
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          QR Code Generator
          {isPremium && <span className={styles.premiumBadge}>PRO</span>}
        </h1>
      </header>

      <form onSubmit={handleGenerate} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="qr-content" className={styles.label}>
            QR Code Content *
          </label>
          <input
            id="qr-content"
            type="text"
            placeholder="https://example.com or your text"
            value={state.qrData}
            onChange={(e) => setState(prev => ({ ...prev, qrData: e.target.value }))}
            className={styles.input}
            required
            aria-describedby="input-help"
          />
          <small id="input-help" className={styles.helpText}>
            Enter a valid URL or any text content
          </small>
        </div>

        {isPremium && (
          <>
            <div className={styles.inputGroup}>
              <label htmlFor="qr-color" className={styles.label}>
                QR Code Color
                <span className={styles.premiumTag}>(Premium Feature)</span>
              </label>
              <input
                id="qr-color"
                type="color"
                value={state.color}
                onChange={(e) => setState(prev => ({ ...prev, color: e.target.value }))}
                className={styles.colorInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="qr-logo" className={styles.label}>
                Upload Logo
                <span className={styles.premiumTag}>(Premium Feature)</span>
              </label>
              <input
                id="qr-logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                aria-describedby="logo-help"
              />
              <small id="logo-help" className={styles.helpText}>
                Maximum file size: 2MB (PNG/JPG)
              </small>

              {state.logoPreview && (
                <div className={styles.filePreview}>
                  <img 
                    src={state.logoPreview} 
                    alt="Logo preview" 
                    className={styles.logoPreview}
                  />
                  <button 
                    type="button" 
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      logo: null, 
                      logoPreview: "" 
                    }))}
                    className={styles.removeButton}
                    aria-label="Remove logo"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <button 
          type="submit" 
          className={styles.button} 
          disabled={state.loading}
          aria-busy={state.loading}
        >
          {state.loading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Generating QR Code...
            </>
          ) : (
            "Generate QR Code"
          )}
        </button>
      </form>

      {state.error && (
        <div className={styles.error} role="alert">
          ⚠️ {state.error}
        </div>
      )}

      <section className={styles.preview}>
        <h2 className={styles.subtitle}>
          {state.generatedUrl ? "Generated QR Code" : "Live Preview"}
        </h2>
        
        <div className={styles.qrContainer}>
          {state.generatedUrl ? (
            <img 
              src={state.generatedUrl} 
              alt="Generated QR Code" 
              className={styles.qrImage} 
              loading="lazy"
            />
          ) : (
            <QRCodeSVG
              value={state.qrData || " "}
              size={200}
              level="H"
              bgColor={isPremium ? state.color : "#000000"}
              className={styles.qrSVG}
              includeMargin={true}
            />
          )}
        </div>

        {state.generatedUrl && (
          <div className={styles.actions}>
            <button 
              onClick={handleDownload}
              className={styles.actionButton}
              aria-label="Download QR code"
            >
              Download
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(state.generatedUrl)}
              className={styles.actionButton}
              aria-label="Copy QR code link"
            >
              Copy Link
            </button>
            <button 
              onClick={handleShare}
              className={styles.actionButton}
              aria-label="Share QR code"
            >
              Share
            </button>
          </div>
        )}
      </section>

      {!isPremium && (
        <aside className={styles.upgradeBanner}>
          <h3>Unlock Premium Features</h3>
          <ul className={styles.featureList}>
            <li>Custom QR Code Colors</li>
            <li>Brand Logo Integration</li>
            <li>Advanced Analytics</li>
            <li>Priority Support</li>
          </ul>
          <button 
            onClick={() => navigate("/upgrade")}
            className={styles.upgradeButton}
          >
            Upgrade to PRO
          </button>
        </aside>
      )}
    </div>
  );
};

export default CombinedQRGenerator;