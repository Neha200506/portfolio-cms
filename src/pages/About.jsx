import React, { useState, useEffect } from "react";
import { getAbout, createAbout, updateAbout, deleteAbout } from "../services/api";
import "./About.css";

function About() {
  const [aboutList, setAboutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    profile_image_url: "",
    email: "",
    location: "",
  });

  const fetchAbout = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getAbout();
      if (response.data && response.data.success) {
        const rawData = response.data.data;
        const list = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
        setAboutList(list);
      } else {
        setAboutList([]);
      }
    } catch (error) {
      console.error("Error fetching about information:", error);
      let msg = "Failed to fetch About information.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartAdd = () => {
    setFormData({
      name: "",
      title: "",
      bio: "",
      profile_image_url: "",
      email: "",
      location: "",
    });
    setEditingId(null);
    setIsAdding(true);
    setIsEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleStartEdit = (item) => {
    setFormData({
      name: item.name || "",
      title: item.title || "",
      bio: item.bio || "",
      profile_image_url: item.profile_image_url || "",
      email: item.email || "",
      location: item.location || "",
    });
    setEditingId(item.id);
    setIsEditing(true);
    setIsAdding(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      title: "",
      bio: "",
      profile_image_url: "",
      email: "",
      location: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Name field is required.");
      return;
    }

    setActionLoading(true);

    try {
      if (isEditing && editingId) {
        const response = await updateAbout(editingId, formData);
        setSuccessMessage(response.data?.message || "About information updated successfully.");
        setIsEditing(false);
        setEditingId(null);
      } else {
        const response = await createAbout(formData);
        setSuccessMessage(response.data?.message || "About information created successfully.");
        setIsAdding(false);
      }
      fetchAbout();
    } catch (error) {
      console.error("Error saving about information:", error);
      let msg = "Failed to save About information.";
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this About information?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await deleteAbout(id);
      setSuccessMessage(response.data?.message || "About information deleted successfully.");
      if (editingId === id) {
        handleCancel();
      }
      fetchAbout();
    } catch (error) {
      console.error("Error deleting about information:", error);
      let msg = "Failed to delete About information.";
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

  return (
    <div className="about-container">
      <div className="about-wrapper">
        {/* Page Heading */}
        <div className="about-header">
          <span className="about-badge">CMS Panel</span>
          <h1 className="about-title">About Management</h1>
          <p className="about-subtitle">
            Manage your personal profile, biography, and contact details.
          </p>
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

        {/* Main Card */}
        <div className="about-card">
          {/* Loading State */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading About information...</span>
            </div>
          ) : isAdding || isEditing ? (
            /* Add / Edit Form */
            <form onSubmit={handleSubmit} className="about-form">
              <div className="form-header">
                <h2 className="form-title">
                  {isEditing ? "Edit About Information" : "Add About Information"}
                </h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Jane Doe"
                    disabled={actionLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="title">Professional Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Full-Stack Developer"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. jane@example.com"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. San Francisco, CA"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="profile_image_url">Profile Image URL</label>
                  <input
                    id="profile_image_url"
                    name="profile_image_url"
                    type="url"
                    value={formData.profile_image_url}
                    onChange={handleInputChange}
                    placeholder="e.g. https://example.com/avatar.jpg"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">Biography</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Write a brief overview of your background, experience, and passions..."
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Information</span>
                  )}
                </button>
              </div>
            </form>
          ) : aboutList.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h2 className="empty-title">No About Information Record</h2>
              <p className="empty-description">
                You haven't created your About details yet. Add your profile information to showcase on your portfolio.
              </p>
              <button className="btn-primary" onClick={handleStartAdd}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add About Information</span>
              </button>
            </div>
          ) : (
            /* Display About Information */
            <div className="about-display">
              {aboutList.map((item) => (
                <div key={item.id || item.created_at || Math.random()} className="about-display-item">
                  <div className="about-display-header">
                    <div className="profile-avatar-container">
                      {item.profile_image_url ? (
                        <img
                          src={item.profile_image_url}
                          alt={item.name}
                          className="profile-avatar"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "block";
                            }
                          }}
                        />
                      ) : null}
                      <svg
                        className="avatar-placeholder"
                        style={{ display: item.profile_image_url ? "none" : "block" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>

                    <div className="about-profile-info">
                      <h2 className="display-name">{item.name}</h2>
                      {item.title && <span className="display-title-tag">{item.title}</span>}

                      <div className="meta-info-list">
                        {item.email && (
                          <div className="meta-item">
                            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="meta-item">
                            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.bio && (
                    <div className="bio-section">
                      <h3 className="bio-label">Biography</h3>
                      <p className="bio-text">{item.bio}</p>
                    </div>
                  )}

                  <div className="action-buttons">
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(item.id)}
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
                      onClick={() => handleStartEdit(item)}
                      disabled={actionLoading}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit Information</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default About;
