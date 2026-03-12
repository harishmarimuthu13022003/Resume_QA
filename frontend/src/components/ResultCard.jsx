export default function ResultCard({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card result-section">
        <div className="loading">
          <span className="spinner"></span>
          Analyzing resumes...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card result-section">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>Ask a question to get AI-powered insights about your candidates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card result-section">
      <div className="result-header">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          AI Analysis
        </h3>
        <span className="result-badge">Generated</span>
      </div>
      
      <div className="result-content">
        <p>{result}</p>
      </div>
    </div>
  );
}
