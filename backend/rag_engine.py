import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from vector_store import get_vector_store

load_dotenv()

# Get API key from environment
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY_1")

def ask_question(query):
    print(f"Processing question: {query}")
    
    try:
        vectordb = get_vector_store()
        print("Got vector store")

        retriever = vectordb.as_retriever(
            search_kwargs={"k": 3}
        )
        print("Getting relevant documents...")

        docs = retriever.invoke(query)
        print(f"Found {len(docs)} documents")

        if not docs:
            return "No relevant information found in the uploaded resumes. Please upload resumes first."

        context = "\n".join([doc.page_content for doc in docs])

        prompt = f"""
You are an AI recruiter assistant.

Answer the question based only on the resume context.

Return response in this format:

Candidate: <name>
Match Reason: <reason>
Source: Resume section – Work Experience

Context:
{context}

Question:
{query}
"""

        print("Calling Gemini LLM...")
        
        # Use Google Gemini with the API key
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0,
            google_api_key=GOOGLE_API_KEY
        )

        response = llm.invoke(prompt)
        print(f"LLM response: {response.content}")

        return response.content
        
    except Exception as e:
        print(f"ERROR in ask_question: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Error: {str(e)}"
