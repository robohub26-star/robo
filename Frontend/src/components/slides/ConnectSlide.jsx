import React from 'react';
import './ConnectSlide.css';

const ConnectSlide = ({ isVisible }) => {
  return (
    <section className={`slide ${isVisible ? 'is-visible' : ''}`} id="slide-connect">
      <img src="/images/connect_industry_1774087316811.png" alt="Industry Connection" className="bg-image" />
      <div className="overlay-gradient"></div>
      <div className="content">
        <div className="eyebrow">Pillar 03 · Connect</div>
        <h1>INDUSTRY <span>TALENT BRIDGE</span></h1>
        <p className="desc">
          A seamless bridge between intensely trained participants and forward-thinking industry partners. Providing validated, deployment-ready talent directly to companies through our dedicated portal.
        </p>
        <div className="talent-bridge">
          <div className="bridge-cards">
            <div className="bridge-card primary">
              <div className="icon"><i className="fas fa-user-graduate"></i></div>
              <h3>For Participants</h3>
              <ul>
                <li>Create and manage personal profile</li>
                <li>View enrolled courses and certifications</li>
                <li>Track hands-on performance and assessments</li>
                <li>Showcase skills to employers</li>
              </ul>
            </div>
            <div className="bridge-card secondary">
              <div className="icon"><i className="fas fa-building"></i></div>
              <h3>For Companies</h3>
              <ul>
                <li>Create an organisation account</li>
                <li>View verified candidate profiles</li>
                <li>Filter by courses, skills and performance</li>
                <li>Identify talent for internships and roles</li>
              </ul>
            </div>
          </div>
          <div className="bridge-benefits">
            <div className="benefit">Faster access to trained & validated candidates</div>
            <div className="benefit">Reduced recruitment & onboarding effort</div>
            <div className="benefit">Better visibility of real hands-on capability</div>
            <div className="benefit">Stronger alignment between training & industry needs</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectSlide;