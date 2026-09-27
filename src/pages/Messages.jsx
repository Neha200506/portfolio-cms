import React, { useState, useEffect } from "react";
import { getMessages, updateMessage, deleteMessage } from "../services/api";
import "./Messages.css";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [activeFilter, setActiveFilter] = useState("All"); // "All", "Unread", "Read"
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getMessages();
      if (response.data && response.data.success) {
        setMessages(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      let msg = "Failed to fetch contact messages.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleReadStatus = async (msgObj, e) => {
    if (e) e.stopPropagation();
    const newReadStatus = !msgObj.is_read;
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateMessage(msgObj.id, { is_read: newReadStatus });
      setSuccessMessage(
        response.data?.message ||
          `Message marked as ${newReadStatus ? "read" : "unread"}.`
      );

      // Update state locally
      setMessages((prev) =>
        prev.map((m) => (m.id === msgObj.id ? { ...m, is_read: newReadStatus } : m))
      );
      if (selectedMessage && selectedMessage.id === msgObj.id) {
        setSelectedMessage((prev) => ({ ...prev, is_read: newReadStatus }));
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      let msg = "Failed to update message status.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetailModal = async (msgObj) => {
    setSelectedMessage(msgObj);
    // Auto mark as read if currently unread
    if (!msgObj.is_read) {
      try {
        await updateMessage(msgObj.id, { is_read: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === msgObj.id ? { ...m, is_read: true } : m))
        );
        setSelectedMessage((prev) => ({ ...prev, is_read: true }));
      } catch (err) {
        console.error("Error auto-marking message as read:", err);
      }
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedMessage(null);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await deleteMessage(id);
      setSuccessMessage(response.data?.message || "Message deleted successfully.");
      if (selectedMessage && selectedMessage.id === id) {
        handleCloseDetailModal();
      }
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      let msg = "Failed to delete message.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === "Unread") return !m.is_read;
    if (activeFilter === "Read") return m.is_read;
    return true;
  });

  return (
    <div className="msg-container">
      <div className="msg-wrapper">
        {/* Header Bar */}
        <div className="msg-header-bar">
          <div className="msg-header">
            <span className="msg-badge">CMS Panel</span>
            <h1 className="msg-title">Contact Messages</h1>
            <p className="msg-subtitle">
              Review, read, and manage contact form inquiries submitted through your portfolio.
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="unread-counter-badge">
              <span className="unread-dot"></span>
              <span>{unreadCount} Unread Message{unreadCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="success-alert" role="status">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="error-alert" role="alert">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter Pills */}
        {!loading && messages.length > 0 && (
          <div className="msg-filter-bar">
            {["All", "Unread", "Read"].map((filter) => (
              <button
                key={filter}
                className={`msg-filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter} {filter === "Unread" ? `(${unreadCount})` : ""}
              </button>
            ))}
          </div>
        )}

        {/* Main Card */}
        <div className="msg-card">
          {loading ? (
            /* Loading State */
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h2 className="empty-title">No Contact Messages</h2>
              <p className="empty-description">
                You haven't received any messages yet. Incoming inquiries will appear here.
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="empty-state">
              <h2 className="empty-title">No {activeFilter} Messages</h2>
              <p className="empty-description">
                There are currently no messages matching the "{activeFilter}" filter.
              </p>
            </div>
          ) : (
            /* Messages List */
            <div className="msg-list">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id || msg.created_at}
                  className={`msg-item-card ${!msg.is_read ? "unread" : ""}`}
                >
                  <div className="msg-item-header">
                    <div className="msg-sender-info">
                      <div className="sender-name-row">
                        <h3 className="sender-name">{msg.name}</h3>
                        <span className={`msg-status-pill ${msg.is_read ? "read" : "unread"}`}>
                          {msg.is_read ? "Read" : "Unread"}
                        </span>
                      </div>
                      <a href={`mailto:${msg.email}`} className="sender-email">
                        {msg.email}
                      </a>
                    </div>

                    <span className="msg-date-str">{formatDateString(msg.created_at)}</span>
                  </div>

                  {msg.subject && (
                    <h4 className="msg-subject-line">Subject: {msg.subject}</h4>
                  )}

                  {msg.message && (
                    <p className="msg-snippet">{msg.message}</p>
                  )}

                  {/* Card Actions Footer */}
                  <div className="msg-card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleToggleReadStatus(msg)}
                      disabled={actionLoading}
                    >
                      <span>{msg.is_read ? "Mark Unread" : "Mark Read"}</span>
                    </button>
                    <button
                      className="btn-danger"
                      onClick={(e) => handleDelete(msg.id, e)}
                      disabled={actionLoading}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleOpenDetailModal(msg)}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Message Details</h2>
              <button className="modal-close-btn" onClick={handleCloseDetailModal}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="msg-detail-body">
              <div className="detail-meta-grid">
                <div className="meta-field">
                  <span className="meta-field-label">Sender Name</span>
                  <span className="meta-field-value">{selectedMessage.name}</span>
                </div>

                <div className="meta-field">
                  <span className="meta-field-label">Email Address</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="meta-field-value sender-email"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <div className="meta-field">
                  <span className="meta-field-label">Date Received</span>
                  <span className="meta-field-value">
                    {formatDateString(selectedMessage.created_at)}
                  </span>
                </div>

                <div className="meta-field">
                  <span className="meta-field-label">Status</span>
                  <span className="meta-field-value">
                    {selectedMessage.is_read ? "Read" : "Unread"}
                  </span>
                </div>
              </div>

              {selectedMessage.subject && (
                <div className="meta-field">
                  <span className="meta-field-label">Subject</span>
                  <span className="meta-field-value">{selectedMessage.subject}</span>
                </div>
              )}

              <div className="full-msg-box">
                <h4 className="full-msg-label">Message Content</h4>
                <p className="full-msg-text">{selectedMessage.message}</p>
              </div>

              <div className="modal-footer-actions">
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={actionLoading}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Delete Message</span>
                </button>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleToggleReadStatus(selectedMessage)}
                    disabled={actionLoading}
                  >
                    <span>
                      {selectedMessage.is_read ? "Mark as Unread" : "Mark as Read"}
                    </span>
                  </button>
                  <button className="btn-primary" onClick={handleCloseDetailModal}>
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
