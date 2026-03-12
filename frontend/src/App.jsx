import { useState, useEffect } from "react";
import UploadResume from "./components/UploadResume";
import AskQuestion from "./components/AskQuestion";
import ResultCard from "./components/ResultCard";
import { getResumes } from "./api";
import "./styles.css";

export default function App() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resumes, setResumes] = useState([]);

  const fetchResumes = async () => {
    try {
      const res = await getResumes();
      setResumes(res.data.resumes || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setResumes([]);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUploadComplete = () => {
    // Clear previous result when new resumes are uploaded
    setResult("");
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <header className="app-header">
          <h1>Resume AI Assistant</h1>
          <p>Upload multiple resumes and ask AI-powered questions about your candidates</p>
        </header>

        <UploadResume 
          resumes={resumes} 
          setResumes={setResumes}
          onUploadComplete={handleUploadComplete}
        />

        <AskQuestion 
          setResult={setResult}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          hasResumes={resumes.length > 0}
        />

        <ResultCard result={result} isLoading={isLoading} />
      </div>
    </div>
  );
}
