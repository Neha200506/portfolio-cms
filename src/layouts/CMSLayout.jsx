import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./CMSLayout.css";

function CMSLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="cms-layout-container">
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <div className="brand-icon-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="mobile-brand-title">Portfolio CMS</span>
        </div>
        <button
          className="mobile-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Reusable Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main CMS Page Content */}
      <main className="cms-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default CMSLayout;
