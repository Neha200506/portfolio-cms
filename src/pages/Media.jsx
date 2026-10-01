import React, { useState, useEffect, useRef } from "react";
import { getMedia, uploadMediaFile, replaceMediaFile, deleteMedia } from "../services/api";
import "./Media.css";

function Media() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replaceMediaId, setReplaceMediaId] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getMedia();
      if (response.data && response.data.success) {
        setMediaItems(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setMediaItems([]);
      }
    } catch (error) {
      console.error("Error fetching media items:", error);
      let msg = "Failed to fetch media library.";
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
    fetchMedia();
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReplaceClick = (id, e) => {
    if (e) e.stopPropagation();
    setReplaceMediaId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadMediaFile(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setSuccessMessage(response.data?.message || "File uploaded successfully!");
      fetchMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
      let msg = "Failed to upload file.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleReplaceFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replaceMediaId) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await replaceMediaFile(replaceMediaId, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setSuccessMessage(response.data?.message || "Media item replaced successfully!");
      if (selectedMedia && selectedMedia.id === replaceMediaId && response.data?.data) {
        setSelectedMedia(response.data.data);
      }
      fetchMedia();
    } catch (error) {
      console.error("Error replacing media item:", error);
      let msg = "Failed to replace media item.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setReplaceMediaId(null);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this media item?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await deleteMedia(id);
      setSuccessMessage(response.data?.message || "Media item deleted successfully.");
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia(null);
      }
      fetchMedia();
    } catch (error) {
      console.error("Error deleting media item:", error);
      let msg = "Failed to delete media item.";
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

  const handleCopyUrl = (url, e) => {
    if (e) e.stopPropagation();
    if (url) {
      navigator.clipboard.writeText(url);
      setSuccessMessage("Media URL copied to clipboard!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  const isImageFile = (fileType, fileUrl) => {
    if (fileType && fileType.startsWith("image/")) return true;
    if (fileUrl && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(fileUrl)) return true;
    return false;
  };

  return (
    <div className="media-container">
      <div className="media-wrapper">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <input
          type="file"
          ref={replaceInputRef}
          style={{ display: "none" }}
          onChange={handleReplaceFileSelect}
        />

        {/* Header Bar */}
        <div className="media-header-bar">
          <div className="media-header">
            <span className="media-badge">CMS Panel</span>
            <h1 className="media-title">Media Library</h1>
            <p className="media-subtitle">
              Upload, preview, copy links, and manage image assets and files for your portfolio.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={handleUploadClick}
            disabled={uploading || actionLoading}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload Media</span>
          </button>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="upload-progress-card">
            <div className="progress-label-row">
              <span>Uploading file...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

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
        <div className="media-card">
          {loading ? (
            /* Loading State */
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading media library...</span>
            </div>
          ) : mediaItems.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <h2 className="empty-title">No Media Files Uploaded</h2>
              <p className="empty-description">
                Your media library is empty. Upload images, documents, or assets to use in your portfolio.
              </p>
              <button
                className="btn-primary"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload Your First File</span>
              </button>
            </div>
          ) : (
            /* Media Grid */
            <div className="media-grid">
              {mediaItems.map((item) => (
                <div key={item.id || item.file_url} className="media-item-card">
                  {/* Preview Box */}
                  <div
                    className="media-preview-box"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {isImageFile(item.file_type, item.file_url) ? (
                      <img
                        src={item.file_url}
                        alt={item.file_name}
                        className="media-thumbnail-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="media-file-fallback"
                      style={{
                        display: isImageFile(item.file_type, item.file_url)
                          ? "none"
                          : "flex",
                      }}
                    >
                      <svg className="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="fallback-ext">
                        {item.file_type ? item.file_type.split("/")[1] || "FILE" : "FILE"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="media-card-body">
                    <h3 className="media-filename" title={item.file_name}>
                      {item.file_name || "Untitled File"}
                    </h3>
                    <div className="media-meta-row">
                      <span>{formatBytes(item.file_size)}</span>
                      <span>{formatDateDisplay(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="media-card-footer">
                    <button
                      className="btn-secondary"
                      onClick={(e) => handleCopyUrl(item.file_url, e)}
                      title="Copy File URL"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy</span>
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={(e) => handleReplaceClick(item.id, e)}
                      disabled={uploading || actionLoading}
                      title="Edit / Replace File"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit / Replace</span>
                    </button>

                    <button
                      className="btn-danger"
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={actionLoading}
                      title="Delete File"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Detail View Modal */}
      {selectedMedia && (
        <div className="modal-overlay" onClick={() => setSelectedMedia(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedMedia.file_name}</h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedMedia(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="media-detail-body">
              {/* Image Preview / File Icon */}
              {isImageFile(selectedMedia.file_type, selectedMedia.file_url) && (
                <div className="full-preview-container">
                  <img
                    src={selectedMedia.file_url}
                    alt={selectedMedia.file_name}
                    className="full-preview-img"
                  />
                </div>
              )}

              <div className="detail-meta-grid">
                <div className="meta-field">
                  <span className="meta-field-label">File Name</span>
                  <span className="meta-field-value">{selectedMedia.file_name}</span>
                </div>

                <div className="meta-field">
                  <span className="meta-field-label">File Size</span>
                  <span className="meta-field-value">
                    {formatBytes(selectedMedia.file_size)}
                  </span>
                </div>

                <div className="meta-field">
                  <span className="meta-field-label">File Type</span>
                  <span className="meta-field-value">
                    {selectedMedia.file_type || "N/A"}
                  </span>
                </div>

                <div className="meta-field">
                  <span className="meta-field-label">Uploaded On</span>
                  <span className="meta-field-value">
                    {formatDateDisplay(selectedMedia.created_at)}
                  </span>
                </div>
              </div>

              {/* URL Copy Input */}
              <div className="meta-field">
                <span className="meta-field-label">Direct Media URL</span>
                <div className="url-copy-box">
                  <input
                    type="text"
                    readOnly
                    className="url-input"
                    value={selectedMedia.file_url || ""}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => handleCopyUrl(selectedMedia.file_url)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="modal-footer-actions">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn-secondary"
                    onClick={(e) => handleReplaceClick(selectedMedia.id, e)}
                    disabled={uploading || actionLoading}
                  >
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit / Replace</span>
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(selectedMedia.id)}
                    disabled={actionLoading}
                  >
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete File</span>
                  </button>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {selectedMedia.file_url && (
                    <a
                      href={selectedMedia.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ textDecoration: "none" }}
                    >
                      Open in New Tab
                    </a>
                  )}
                  <button
                    className="btn-primary"
                    onClick={() => setSelectedMedia(null)}
                  >
                    Close
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

export default Media;
