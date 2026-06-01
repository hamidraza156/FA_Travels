import React from 'react';
import '../styles/Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Explore Pakistan</h1>
        <p>Discover the most beautiful travel destinations across Pakistan.</p>
        <Link to="/destinations" className="cta-button">Start Your Journey</Link>
      </div>
    </div>
  );
};

export default Home;
