import React from "react";
import styles from "../styles/Header.module.css"
import colors from "../styles/colors.module.css"
const Header = () => {
  return (
    <div className={styles.header}>
  <h1 className={styles.mainTitle}>QrX Marketing Solutions</h1>
  <p className={styles.tagline}>Futuristic Digital Engagement</p>
  
  {/* Rest of your header content */}
    </div>
  );
};

export default Header;