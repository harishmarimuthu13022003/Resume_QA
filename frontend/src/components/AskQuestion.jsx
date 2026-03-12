import { useState } from "react";
import { askQuestion } from "../api";

export default function AskQuestion({ setResult, setIsLoading, isLoading, hasResumes }) {
  const [question, setQuestion] = useState("");

  const ask = async () => {
    console.log("Ask button clicked!");
    console.log("Question:", question);
    console.log("hasResumes:", hasResumes);
    
    if (!question.trim()) {
      alert("Please enter a question!");
      return;
    }
    if (!hasResumes) {
      alert("Please upload at least one resume first!");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calling API...");
      const res = await askQuestion(question);
      console.log("API Response:", res.data);
      setResult(res.data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      setResult(`Sorry, I encountered an error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="glass-card question-section">
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Ask About Candidates
      </h2>
      
      <div className="question-input-wrapper">
        <textarea
          className="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Who has the most experience with Python? or Find candidates with React skills..."
          rows="3"
        />
      </div>

      <button 
        className="btn btn-primary btn-full" 
        onClick={ask}
        disabled={isLoading || !question.trim()}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Ask AI
          </>
        )}
      </button>

      {!hasResumes && (
        <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', marginTop: '10px' }}>
          Upload resumes first to start asking questions
        </p>
      )}
    </div>
  );
}
