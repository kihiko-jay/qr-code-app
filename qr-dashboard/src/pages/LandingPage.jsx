// HomePage.jsx
import { Link } from "react-router-dom";
import styles from "../styles/Homepage.module.css";
import heroImage from "../Assets/HeroImage.webp";
import colors from "../styles/colors.module.css"
const HomePage = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
     
      <header className={styles.header}>
        
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>QRXpert</h1>
          <nav className={styles.nav}>
            <Link to="/login" className={styles.navLink}>Sign In</Link>
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
             
             
<Link to="/qr-generator" className={styles.ctaButton}>
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
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.sectionTitle}>Custom Design</h3>
            <p>Brand-aligned QR codes with colors, logos, and frames</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.sectionTitle}>Custom Design</h3>
            <p>Brand-aligned QR codes with colors, logos, and frames</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.sectionTitle}>Custom Design</h3>
            <p>Brand-aligned QR codes with colors, logos, and frames</p>
          </div>
          
          {/* Add other feature cards similarly */}
        </div>
      </section>

      {/* Other sections follow similar structured patterns */}
      

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.sectionTitle}>
            <h3 className={styles.footerLogo} >QRXpert</h3>
            </div>
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