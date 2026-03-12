# Resume AI Assistant

A modern AI-powered resume analysis application that uses Retrieval-Augmented Generation (RAG) to help recruiters and hiring managers analyze multiple resumes and get intelligent answers about candidates.

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │ ───▶ │   FastAPI       │ ───▶ │   Vector Store  │
│   (React+Vite)  │      │   (Backend)     │      │   (ChromaDB)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   Gemini LLM    │
                        │   (Google AI)   │
                        └─────────────────┘
```

### Component Breakdown

#### Frontend (`frontend/`)
- **Framework**: React 19 with Vite
- **HTTP Client**: Axios
- **Components**:
  - `App.jsx` - Main application container
  - `UploadResume.jsx` - PDF upload component with drag-and-drop
  - `AskQuestion.jsx` - Question input interface
  - `ResultCard.jsx` - Answer display component

#### Backend (`backend/`)
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Key Modules**:
  - [`app.py`](backend/app.py) - Main FastAPI application with REST endpoints
  - [`rag_engine.py`](backend/rag_engine.py) - RAG pipeline implementation
  - [`vector_store.py`](backend/vector_store.py) - ChromaDB vector store setup
  - [`resume_parser.py`](backend/resume_parser.py) - PDF text extraction

#### Data Layer
- **Vector Database**: ChromaDB (local SQLite-based)
- **Embeddings**: HuggingFace `sentence-transformers/all-MiniLM-L6-v2`
- **LLM**: Google Gemini 2.0 Flash

---

## 🔄 RAG Pipeline

### Overview

The application implements a complete Retrieval-Augmented Generation pipeline to answer questions about uploaded resumes:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Upload     │    │   Parse &    │    │   Chunk &    │    │   Embed &    │
│   PDF Resume │ ─▶ │   Extract    │ ─▶ │   Split      │ ─▶ │   Store      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                        │
                                                                        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Display    │ ◀──│   Format &   │ ◀──│   Generate   │ ◀──│   Retrieve   │
│   Answer     │    │   Return     │    │   Response   │    │   Context    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Pipeline Steps

#### 1. Document Ingestion (Upload)
- User uploads PDF resumes via frontend
- [`resume_parser.py`](backend/resume_parser.py) extracts text using `pypdf`

#### 2. Text Chunking
- [`RecursiveCharacterTextSplitter`](https://python.langchain.com/docs/modules/data_connection/document_transformers/) splits text into overlapping chunks
- **Chunk Size**: 500 characters
- **Overlap**: 50 characters

#### 3. Embedding & Storage
- [`HuggingFaceEmbeddings`](backend/vector_store.py:10) converts chunks to vectors
- Vectors stored in ChromaDB with persistence

#### 4. Retrieval (Query Time)
- User asks a question
- Question is embedded using same model
- ChromaDB retrieves top-k (k=3) most similar chunks

#### 5. Generation
- Retrieved context + prompt sent to Gemini LLM
- LLM generates formatted response with:
  - Candidate name
  - Match reason
  - Source section

---

## 🚀 How to Run

### Prerequisites

- **Python**: 3.8+
- **Node.js**: 18+
- **Google API Key**: Required for Gemini LLM

### Environment Setup

1. **Clone the repository**
   ```bash
   cd assessment
   ```

2. **Create virtual environment (Backend)**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API Keys**

   Create or edit [`backend/.env`](backend/.env):
   ```env
   GOOGLE_API_KEY_1=your_google_api_key_here
   ```

   To get a Google API key:
   1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Create a new API key
   3. Copy it to the `.env` file

5. **Install Frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

#### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn app:app --reload --port 8000
```
Backend runs at: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

#### Option 2: Run with Scripts (PowerShell)

```powershell
# Start backend
cd backend; .\.venv\Scripts\Activate; uvicorn app:app --reload --port 8000

# In another terminal - Start frontend
cd frontend; npm run dev
```

### Using the Application

1. **Open Browser**: Navigate to http://localhost:5173
2. **Upload Resumes**: Drag and drop PDF resumes into the upload area
3. **Ask Questions**: Type questions like:
   - "Who has Python experience?"
   - "Find candidates with management skills"
   - "Who has the most years of experience?"

---

## 📁 Project Structure

```
assesment/
├── README.md                 # This file
├── backend/
│   ├── app.py               # FastAPI main application
│   ├── rag_engine.py        # RAG pipeline logic
│   ├── vector_store.py      # ChromaDB vector store
│   ├── resume_parser.py     # PDF text extraction
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   ├── uploaded_resumes.json # Resume tracking
│   └── vector_db/           # ChromaDB persistence
│       └── chroma.sqlite3
└── frontend/
    ├── package.json         # Node dependencies
    ├── vite.config.js       # Vite configuration
    ├── index.html          # Entry HTML
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Main component
        ├── api.js          # API client
        ├── styles.css      # Global styles
        ├── index.css       # Base styles
        └── components/
            ├── UploadResume.jsx
            ├── AskQuestion.jsx
            └── ResultCard.jsx
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/upload-resume` | Upload PDF resume |
| `GET` | `/resumes` | List uploaded resumes |
| `DELETE` | `/resumes/{filename}` | Delete a resume |
| `POST` | `/ask` | Ask question about resumes |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Axios |
| Backend | FastAPI, Uvicorn |
| Vector Store | ChromaDB |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) |
| LLM | Google Gemini 2.0 Flash |
| PDF Parsing | pypdf |
| Text Splitting | LangChain |

---

## 📝 License

This project is for demonstration purposes.#   R e s u m e _ Q A 
 
 
