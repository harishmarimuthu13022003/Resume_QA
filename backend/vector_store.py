import os
from dotenv import load_dotenv
# Use Hugging Face embeddings instead of Google
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

# Use Hugging Face embeddings - free, no API key needed
embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def get_vector_store():
    print("Initializing vector store...")
    try:
        vectordb = Chroma(
            persist_directory="vector_db",
            embedding_function=embedding
        )
        print("Vector store initialized successfully")
        return vectordb
    except Exception as e:
        print(f"ERROR initializing vector store: {str(e)}")
        raise