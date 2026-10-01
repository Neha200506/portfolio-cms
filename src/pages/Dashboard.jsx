import React, { useState, useEffect } from "react";
import API, {
  getSkills,
  getBlogs,
  getExperience,
  getMessages,
  getMedia,
} from "../services/api";
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

  const [counts, setCounts] = useState({
    projects: 0,
    skills: 0,
    blogs: 0,
    experience: 0,
    messages: 0,
    media: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        projectsRes,
        skillsRes,
        blogsRes,
        experienceRes,
        messagesRes,
        mediaRes,
      ] = await Promise.allSettled([
        API.get("/projects"),
        getSkills(),
        getBlogs(),
        getExperience(),
        getMessages(),
        getMedia(),
      ]);

      const extractData = (res) => {
        if (res.status === "fulfilled" && res.value?.data?.success) {
          return Array.isArray(res.value.data.data) ? res.value.data.data : [];
        }
        return [];
      };

      const projectsList = extractData(projectsRes);
      const skillsList = extractData(skillsRes);
      const blogsList = extractData(blogsRes);
      const experienceList = extractData(experienceRes);
      const messagesList = extractData(messagesRes);
      const mediaList = extractData(mediaRes);

      setCounts({
        projects: projectsList.length,
        skills: skillsList.length,
        blogs: blogsList.length,
        experience: experienceList.length,
        messages: messagesList.length,
        media: mediaList.length,
      });

      const sortedMsgs = [...messagesList].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });

      setRecentMessages(sortedMsgs.slice(0, 5));
    } catch (err) {
      console.error("Error loading dashboard statistics:", err);
      setError("Failed to load live dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const statItems = [
    {
      title: "Projects",
      count: counts.projects,
      color: "#38bdf8",
      bgColor: "rgba(56, 189, 248, 0.1)",
      borderColor: "rgba(56, 189, 248, 0.25)",
      icon: (
        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      title: "Skills",
      count: counts.skills,
      color: "#818cf8",
      bgColor: "rgba(129, 140, 248, 0.1)",
      borderColor: "rgba(129, 140, 248, 0.25)",
      icon: (
        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Blogs",
      count: counts.blogs,
      color: "#c084fc",
      bgColor: "rgba(192, 132, 252, 0.1)",
      borderColor: "rgba(192, 132, 252, 0.25)",
      icon: (
        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      title: "Experience",
      count: counts.experience,
      color: "#34d399",
      bgColor: "rgba(52, 211, 153, 0.1)",
      borderColor: "rgba(52, 211, 153, 0.25)",
      icon: (
        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Messages",
      count: counts.messages,
      color: "#f472b6",
      bgColor: "rgba(244, 114, 182, 0.1)",
      borderColor: "rgba(244, 114, 182, 0.25)",
      icon: (
        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: "Media",
      count: counts.media,
      color: "#fbbf24",
      bgColor: "rgba(251, 191, 36, 0.1)",
      borderColor: "rgba(251, 191, 36, 0.25)",
      icon: (
        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Welcome Header */}
        <div className="dashboard-card header-card">
          <div className="dashboard-header">
            <span className="dashboard-badge">CMS Panel</span>
            <h1 className="dashboard-title">Dashboard Overview</h1>
            <h2 className="dashboard-welcome">
              Welcome back, {userName}!
            </h2>
          </div>
          <p className="dashboard-message">
            Here is your portfolio performance and content summary powered by live backend data.
          </p>
        </div>

        {error && <div className="dashboard-error-banner">{error}</div>}

        {/* Live Counts Grid */}
        <div className="dashboard-stats-grid">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="dashboard-stat-card"
              style={{ borderColor: item.borderColor }}
            >
              <div
                className="stat-icon-wrapper"
                style={{ backgroundColor: item.bgColor, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="stat-info">
                <span className="stat-count" style={{ color: item.color }}>
                  {loading ? "..." : item.count}
                </span>
                <span className="stat-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Messages Section */}
        <div className="dashboard-card recent-messages-card">
          <div className="recent-messages-header">
            <div>
              <h3 className="recent-title">Recent Messages</h3>
              <p className="recent-subtitle">
                Latest inquiries received from portfolio visitors
              </p>
            </div>
            <button className="recent-refresh-btn" onClick={fetchDashboardData} title="Refresh Live Data">
              Refresh Data
            </button>
          </div>

          {loading ? (
            <div className="dashboard-loading">Loading live data...</div>
          ) : recentMessages.length === 0 ? (
            <div className="recent-empty">No messages received yet.</div>
          ) : (
            <div className="recent-messages-list">
              {recentMessages.map((msg) => (
                <div key={msg.id || msg.created_at} className="recent-msg-item">
                  <div className="recent-msg-header">
                    <div className="recent-sender-info">
                      <span className="recent-sender-name">{msg.name || "Anonymous"}</span>
                      <span className="recent-sender-email">&lt;{msg.email}&gt;</span>
                    </div>
                    <span className="recent-msg-date">
                      {formatDate(msg.created_at || msg.createdAt)}
                    </span>
                  </div>
                  {msg.subject && (
                    <div className="recent-msg-subject">
                      <strong>Subject:</strong> {msg.subject}
                    </div>
                  )}
                  <p className="recent-msg-snippet">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
