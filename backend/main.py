import os
import io
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import fitz

from langchain_text_splitters import CharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS

load_dotenv()

app = FastAPI()

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

# Store vector store in memory
knowledge_base = None

# ── Request model for /ask ────────────────────────────────────────────────────
class QuestionRequest(BaseModel):
    question: str

# ── POST /upload ──────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global knowledge_base

    # Extract text
    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()

    # Chunk text
    splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = splitter.split_text(text)

    # Create embeddings and vector store
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GOOGLE_API_KEY
    )
    knowledge_base = FAISS.from_texts(chunks, embeddings)

    return {"message": "PDF indexed successfully", "chunks": len(chunks)}

# ── POST /ask ─────────────────────────────────────────────────────────────────
@app.post("/ask")
async def ask_question(request: QuestionRequest):
    global knowledge_base

    if knowledge_base is None:
        return {"error": "No PDF uploaded yet"}

    # Search for relevant chunks
    docs = knowledge_base.similarity_search(request.question)
    context = "\n\n".join([doc.page_content for doc in docs])

    # Build prompt
    prompt = f"""Answer the question as clearly and accurately as possible using the context below.
If the answer is not found in the context, say "I couldn't find that in the paper."
Do not make up information.

Context:
{context}

Question: {request.question}

Answer:"""

    # Get answer from Gemini
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3
    )
    response = llm.invoke(prompt)

    # Return answer and source chunks
    return {
        "answer": response.content,
        "sources": [doc.page_content for doc in docs]
    }