import os
import shutil
import json
from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv

# ✅ CORS
from fastapi.middleware.cors import CORSMiddleware

from resume_parser import extract_text_from_pdf
from rag_engine import ask_question
from vector_store import get_vector_store

from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

app = FastAPI()

# ✅ CORS FIX - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy initialization of vector store
vectordb = None

def get_vectordb():
    global vectordb
    if vectordb is None:
        print("Initializing vector store...")
        vectordb = get_vector_store()
        print("Vector store initialized")
    return vectordb

# File to track uploaded resumes
RESUMES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploaded_resumes.json")

def get_uploaded_resumes():
    """Load list of uploaded resume filenames"""
    if os.path.exists(RESUMES_FILE):
        with open(RESUMES_FILE, "r") as f:
            return json.load(f)
    print(f"Resume file {RESUMES_FILE} does not exist, returning empty list")
    return []

def save_resume_filename(filename):
    """Save a resume filename to the tracking file"""
    resumes = get_uploaded_resumes()
    if filename not in resumes:
        resumes.append(filename)
        with open(RESUMES_FILE, "w") as f:
            json.dump(resumes, f)
        print(f"Saved resume filename: {filename}. Total resumes: {len(resumes)}")

def remove_resume_filename(filename):
    """Remove a resume filename from the tracking file"""
    resumes = get_uploaded_resumes()
    if filename in resumes:
        resumes.remove(filename)
        with open(RESUMES_FILE, "w") as f:
            json.dump(resumes, f)


@app.get("/")
def home():
    return {"message": "Resume AI Assistant Running"}


# Upload Resume
@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    print(f"Starting upload for file: {file.filename}")
    try:
        # Get vector store (lazy initialization)
        db = get_vectordb()
        
        os.makedirs("temp", exist_ok=True)

        file_path = f"temp/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"File saved to: {file_path}")

        text = extract_text_from_pdf(file_path)
        print(f"Extracted text length: {len(text)}")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

        chunks = splitter.split_text(text)
        print(f"Created {len(chunks)} chunks")

        db.add_texts(chunks)
        print("Added chunks to vector store")

        db.persist()
        print("Persisted vector store")
        
        # Save the filename to track uploaded resumes
        save_resume_filename(file.filename)
        print(f"Saved filename: {file.filename}")

        return {"message": "Resume uploaded successfully"}
    except Exception as e:
        print(f"ERROR during upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500


@app.get("/resumes")
def get_resumes():
    """Get list of all uploaded resume filenames"""
    resumes = get_uploaded_resumes()
    print(f"GET /resumes returning: {resumes}")
    return {"resumes": resumes}


@app.delete("/resumes/{filename}")
def delete_resume(filename: str):
    """Delete a specific resume"""
    # Remove from tracking file
    remove_resume_filename(filename)
    
    # Remove temp file if exists
    file_path = f"temp/{filename}"
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return {"message": f"Resume {filename} deleted successfully"}


# Ask Question
@app.post("/ask")
async def ask(data: dict):
    try:
        question = data["question"]

        answer = ask_question(question)

        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}, 500