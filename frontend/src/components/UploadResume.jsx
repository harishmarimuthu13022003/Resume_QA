import { useState, useRef } from "react";
import { uploadResume, getResumes, deleteResume } from "../api";

export default function UploadResume({ resumes, setResumes, onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const fetchResumes = async () => {
    try {
      const res = await getResumes();
      console.log("Fetched resumes response:", res.data);
      setResumes(res.data.resumes || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);
    console.log("Selected files:", filesArray.map(f => f.name));
  };

  const handleUpload = async () => {
    console.log("Upload button clicked!");
    alert("Upload button clicked! Files: " + selectedFiles.length);
    
    if (selectedFiles.length === 0) {
      alert("No files selected!");
      return;
    }

    setIsUploading(true);
    
    try {
      console.log("Starting upload loop...");
      for (let i = 0; i < selectedFiles.length; i++) {
        console.log("Uploading file:", selectedFiles[i].name);
        const response = await uploadResume(selectedFiles[i]);
        console.log("Upload response:", response.data);
      }
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      await fetchResumes();
      
      alert(`Successfully uploaded ${selectedFiles.length} resume(s)!`);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Error uploading resumes:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to upload resume(s): ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await deleteResume(filename);
      await fetchResumes();
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert("Failed to delete resume.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const filesArray = Array.from(files);
      setSelectedFiles(filesArray);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="glass-card upload-section">
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Upload Resumes
      </h2>
      
      <div 
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onClick={handleZoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        
        <p>
          {isUploading ? "Uploading..." : "Drag & drop resumes here or click to browse"}
        </p>
        <p className="hint">Supports PDF, DOCX, DOC, TXT files</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="selected-header">
            <span className="selected-count">
              {selectedFiles.length} file(s) selected
            </span>
            <button className="clear-btn" onClick={clearSelection}>
              Clear
            </button>
          </div>
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                {file.name}
              </li>
            ))}
          </ul>
          <button 
            className="upload-btn" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
          </button>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <div className="resume-list">
          <div className="resume-header">
            <h3>Uploaded Resumes ({resumes.length})</h3>
          </div>
          {resumes.map((resume, index) => (
            <div key={index} className="resume-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              {resume}
              <button 
                className="remove-btn" 
                onClick={() => handleDelete(resume)}
                title="Remove resume"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
