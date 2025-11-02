import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-primary border-b border-primary-border">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="flex space-x-8">
            <Link
              to="/"
              className="text-nav-text hover:text-nav-hover transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-nav-text hover:text-nav-hover transition-colors"
            >
              About
            </Link>
            <Link
              to="/faq"
              className="text-nav-text hover:text-nav-hover transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
