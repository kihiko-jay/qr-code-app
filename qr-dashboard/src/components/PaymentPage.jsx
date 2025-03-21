import { useState } from "react";
import styles from "../styles/PaymentPage.module.css";
import Logo from "../assets/logo.png"; // Update with your logo path

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (paymentMethod === "mpesa") {
        if (!/^2547\d{8}$/.test(phone)) {
          setMessage("Invalid M-Pesa phone number format");
          return;
        }

        const response = await fetch("/api/mpesa/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, amount }),
        });

        const data = await response.json();
        setMessage(data.message || "MPesa payment initiated successfully");
      } else {
        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setMessage("Failed to start Stripe payment");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={Logo} alt="QrX Logo" className={styles.logo} />
          <h1 className={styles.brandName}>QrX</h1>
        </div>
        <p className={styles.tagline}>Futuristic Digital Engagement</p>
      </header>

      <main className={styles.content}>
        <h2 className={styles.title}>Choose Payment Method</h2>

        <div className={styles.methodGrid}>
          <div
            className={`${styles.methodCard} ${
              paymentMethod === "mpesa" ? styles.active : ""
            }`}
            onClick={() => setPaymentMethod("mpesa")}
          >
            <div className={styles.methodIcon}>📱</div>
            <h3 className={styles.methodTitle}>M-Pesa</h3>
            <p className={styles.methodDesc}>Mobile Money Payment</p>
          </div>

          <div
            className={`${styles.methodCard} ${
              paymentMethod === "stripe" ? styles.active : ""
            }`}
            onClick={() => setPaymentMethod("stripe")}
          >
            <div className={styles.methodIcon}>💳</div>
            <h3 className={styles.methodTitle}>Credit/Debit Card</h3>
            <p className={styles.methodDesc}>Secure Stripe Payment</p>
          </div>
        </div>

        {paymentMethod === "mpesa" && (
          <div className={styles.inputGroup}>
            <input
              type="tel"
              placeholder="2547XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
              pattern="2547\d{8}"
            />
            <span className={styles.inputNote}>
              Enter your M-Pesa number in 2547XX XXX XXX format
            </span>
          </div>
        )}

        <div className={styles.amountGroup}>
          <label className={styles.amountLabel}>Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            min="1"
            className={styles.amountInput}
          />
        </div>

        <button
          className={styles.payButton}
          onClick={handlePayment}
          disabled={loading || (paymentMethod === "mpesa" && !phone)}
        >
          {loading ? (
            <div className={styles.spinner}></div>
          ) : (
            `Pay $${amount}`
          )}
        </button>

        {message && (
          <div
            className={`${styles.message} ${
              message.includes("Failed") ? styles.error : styles.success
            }`}
          >
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentPage;