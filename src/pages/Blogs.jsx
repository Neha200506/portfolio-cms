import React, { useState, useEffect } from "react";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "../services/api";
import "./Blogs.css";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    published: false,
    published_at: new Date().toISOString().slice(0, 16),
  });

  const fetchBlogs = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getBlogs();
      if (response.data && response.data.success) {
        setBlogs(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      let msg = "Failed to fetch blogs.";
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
    fetchBlogs();
  }, []);

  const generateSlug = (titleText) => {
    return titleText
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "title" && !isEditing && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      published: false,
      published_at: new Date().toISOString().slice(0, 16),
    });
    setEditingId(null);
    setIsEditing(false);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleOpenEditModal = (blog) => {
    let formattedDate = new Date().toISOString().slice(0, 16);
    if (blog.published_at) {
      try {
        formattedDate = new Date(blog.published_at).toISOString().slice(0, 16);
      } catch (err) {
        // Keep default if invalid date
      }
    }

    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image_url: blog.image_url || "",
      published: Boolean(blog.published),
      published_at: formattedDate,
    });
    setEditingId(blog.id);
    setIsEditing(true);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      published: false,
      published_at: new Date().toISOString().slice(0, 16),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.title.trim()) {
      setErrorMessage("Blog title is required.");
      return;
    }

    const finalSlug = formData.slug.trim() || generateSlug(formData.title);
    if (!finalSlug) {
      setErrorMessage("Blog slug is required.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      slug: finalSlug,
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      image_url: formData.image_url.trim(),
      published: Boolean(formData.published),
      published_at: formData.published_at
        ? new Date(formData.published_at).toISOString()
        : new Date().toISOString(),
    };

    setActionLoading(true);

    try {
      if (isEditing && editingId) {
        const response = await updateBlog(editingId, payload);
        setSuccessMessage(response.data?.message || "Blog post updated successfully.");
      } else {
        const response = await createBlog(payload);
        setSuccessMessage(response.data?.message || "Blog post created successfully.");
      }
      handleCloseModal();
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      let msg = "Failed to save blog post.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await deleteBlog(id);
      setSuccessMessage(response.data?.message || "Blog post deleted successfully.");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      let msg = "Failed to delete blog post.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="blogs-container">
      <div className="blogs-wrapper">
        {/* Header Bar */}
        <div className="blogs-header-bar">
          <div className="blogs-header">
            <span className="blogs-badge">CMS Panel</span>
            <h1 className="blogs-title">Blogs Management</h1>
            <p className="blogs-subtitle">
              Publish and manage your articles, thoughts, and technical posts.
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Blog Post</span>
          </button>
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
        <div className="blogs-card">
          {loading ? (
            /* Loading State */
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading blog posts...</span>
            </div>
          ) : blogs.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h2 className="empty-title">No Blog Posts Found</h2>
              <p className="empty-description">
                You haven't written any blog posts yet. Click below to write and publish your first article.
              </p>
              <button className="btn-primary" onClick={handleOpenAddModal}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Write Your First Blog Post</span>
              </button>
            </div>
          ) : (
            /* Blogs Grid */
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <div key={blog.id || blog.slug} className="blog-item-card">
                  {/* Banner Image */}
                  <div className="blog-banner-container">
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="blog-banner-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="banner-fallback"
                      style={{ display: blog.image_url ? "none" : "flex" }}
                    >
                      <svg className="banner-fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                        <polyline points="8.5 10 12 13.5 15.5 10" />
                        <line x1="12" y1="6" x2="12" y2="13.5" />
                      </svg>
                      <span className="banner-fallback-text">No Header Image</span>
                    </div>

                    <span
                      className={`published-status-badge ${
                        blog.published ? "published" : "draft"
                      }`}
                    >
                      {blog.published ? "✓ Published" : "● Draft"}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="blog-card-body">
                    <h3 className="blog-card-title">{blog.title}</h3>
                    {blog.slug && <span className="blog-slug-tag">/{blog.slug}</span>}

                    {blog.excerpt && (
                      <p className="blog-card-excerpt">{blog.excerpt}</p>
                    )}

                    {blog.published_at && (
                      <div className="blog-meta-date">
                        Published: {formatDateDisplay(blog.published_at)}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="blog-card-footer">
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDelete(blog.id)}
                      disabled={actionLoading}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleOpenEditModal(blog)}
                      disabled={actionLoading}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? "Edit Blog Post" : "Add New Blog Post"}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="blogs-form">
              <div className="form-group">
                <label htmlFor="blog-title">Title *</label>
                <input
                  id="blog-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Building Modern Web Applications"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-slug">Slug URL *</label>
                <input
                  id="blog-slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. building-modern-web-applications"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-excerpt">Excerpt</label>
                <textarea
                  id="blog-excerpt"
                  name="excerpt"
                  className="excerpt-input"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary or hook for the article..."
                  disabled={actionLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-content">Content</label>
                <textarea
                  id="blog-content"
                  name="content"
                  className="content-input"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your article content here..."
                  disabled={actionLoading}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="blog-image">Image URL</label>
                  <input
                    id="blog-image"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/cover.jpg"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="blog-published-at">Published Date & Time</label>
                  <input
                    id="blog-published-at"
                    name="published_at"
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={handleInputChange}
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  disabled={actionLoading}
                />
                <span className="checkbox-label">Publish this post</span>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Update Blog Post" : "Save Blog Post"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Blogs;
