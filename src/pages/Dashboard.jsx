import React from "react";
import "./Dashboard.css";

function Dashboard() {
  const userString = localStorage.getItem("adminUser");
  let userName = "Admin";
  if (userString) {
    try {
      const userObj = JSON.parse(userString);
      if (userObj && userObj.name) {
        userName = userObj.name;
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <span className="dashboard-badge">CMS Panel</span>
          <h1 className="dashboard-title">Dashboard</h1>
          <h2 className="dashboard-welcome">Welcome to Portfolio CMS, {userName}!</h2>
        </div>
        <p className="dashboard-message">
          You can manage your portfolio content, projects, skills, and settings from this admin panel.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
