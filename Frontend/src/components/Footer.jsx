import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="footer" className="site-footer">
      <div className="footer-container">
        <h2 className="footer-title">GET IN TOUCH</h2>
        <div className="footer-grid">
          <div className="footer-item">
            <i className="fas fa-envelope"></i>
            <p>
              <a href="mailto:robohub26@gmail.com">robohub26@gmail.com</a>
            </p>
          </div>
          <div className="footer-item">
            <i className="fab fa-linkedin"></i>
            <p>
              <a
                href="https://www.linkedin.com/in/robohub-enablement-and-advisory-technologies-12a0443ba"
                target="_blank"
                rel="noopener noreferrer"
              >
                Linkedin
              </a>
            </p>
          </div>
          <div className="footer-item">
            <i className="fas fa-map-marker-alt"></i>
            <p>Tamilnadu, India</p>
          </div>
          <div className="footer-item">
            <i className="fas fa-phone"></i>
            <p>
              <a href="tel:+917899770470">+91 78997 70470</a>
            </p>
          </div>
        </div>
        <p className="footer-copy">© 2026 RoboHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;