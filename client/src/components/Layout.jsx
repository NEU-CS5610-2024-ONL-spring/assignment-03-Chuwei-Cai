// Main layout for the project. It contains the header section (logo, menu, login) and the content section (trending books of the day).
import React, { useState } from 'react';
import "../style/Layout.css";
import logo from "../images/logo.svg";
import { Outlet, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Layout() {
  const { user, isAuthenticated, loginWithRedirect, logout} = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to handle menu toggle

  // function to handle login and logout
  const handleLoginLogout = () => {
    isAuthenticated ? logout({ returnTo: window.location.origin }) : loginWithRedirect();
  };

  // function to toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // define the main return components
  return (
    <div className="app">
      <div className="header">
        <div className="header-box">
          <nav className="menu">
          <img className="logo" src={logo} alt="app logo" />
            <div className="stack-menu" onClick={toggleMenu}>
              <span>☰</span>
            </div>
            <ul className={`menu-list ${isMenuOpen ? 'display' : ''}`}>
              <li><Link className="menu-tab-link" to="/">Home</Link></li>
              <li><Link className="menu-tab-link" to="/read-list">My Reading List</Link></li>
              <li><Link className="menu-tab-link" to="/my-profile">My Profile</Link></li>
            </ul>
          </nav>
          <div className="user-info">
            <div className="text">Welcome! {isAuthenticated ? user.email : ''}</div>
            <button className="login-button" onClick={handleLoginLogout}>
              {isAuthenticated ? 'Log Out' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
