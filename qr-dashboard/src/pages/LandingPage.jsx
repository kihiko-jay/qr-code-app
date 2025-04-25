// HomePage.jsx
import { Link } from "react-router-dom";
import styles from "../styles/Homepage.module.css";
import heroImage from "../Assets/HeroImage.webp";

const HomePage = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.highlight}>Unlock Dynamic Campaigns With Smart QR Solutions</h2>
          <nav className={styles.nav}>
            <Link to="/login" className={styles.primaryButton}>Sign In</Link>
            <Link to="/signup" className={styles.primaryButton}>Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>
              Transform Your Marketing with 
              <span className={styles.highlight}> Smart QR Codes</span>
            </h1>
            <p className={styles.heroSubtext}>
              Create, customize, and track dynamic QR codes with enterprise-grade analytics.
            </p>
            <div className={styles.ctaContainer}>
              <Link to="/qr-generator" className={styles.primaryButton}>
                Start Free Trial
              </Link>
              <p className={styles.ctaNote}>No credit card required</p>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <img 
              src={heroImage} 
              alt="QR Code Analytics Dashboard" 
              className={styles.heroImage} 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Powerful Features</h2>
          <p className={styles.sectionSubtitle}>Everything you need for modern marketing</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Campaign Tracking</h3>
            <p>Real-time analytics for QR scans—measure engagement by location, time, and device.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.featureTitle}>Custom Design</h3>
            <p>Embed logos, colors, and patterns while ensuring 100% scan reliability.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h3 className={styles.featureTitle}>Digital Menus</h3>
            <p>Convert restaurant menus into scannable codes for contactless ordering.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛒</div>
            <h3 className={styles.featureTitle}>Instant Checkout</h3>
            <p>Link QR codes to payment gateways for one-tap purchases.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎟️</div>
            <h3 className={styles.featureTitle}>Event Access</h3>
            <p>Secure ticketing with unique, fraud-proof QR codes.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📚</div>
            <h3 className={styles.featureTitle}>Interactive Learning</h3>
            <p>Enhance textbooks with scannable codes for AR content.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3 className={styles.footerTitle}>Smart QR Marketing Solutions</h3>
            <p>© {new Date().getFullYear()} All rights reserved</p>
          </div>
          <nav className={styles.footerNav}>
            <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
            <Link to="/terms" className={styles.footerLink}>Terms</Link>
            <Link to="/contact" className={styles.footerLink}>Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;