**RAG Research Paper Q&A**

A full-stack Retrieval-Augmented Generation (RAG) application that lets you upload any research paper and ask questions about it using natural language.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Vector Database | FAISS (local) |
| Embeddings | Gemini text-embedding |
| LLM | Gemini 2.0 Flash |
| PDF Processing | PyMuPDF |
| RAG Framework | LangChain |

## ✨ Features

- Upload any research paper in PDF format
- Automatically extracts and indexes the content
- Ask questions in natural language
- Get accurate answers grounded in the paper
- View source chunks used to generate the answer

## 🏗️ Project Structure
rag-paper-app/
├── backend/
│   ├── main.py        # FastAPI server
│   └── .env           # API keys (not committed)
├── frontend/
│   └── src/
│       └── App.jsx    # React UI
└── README.md
## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API key (free at aistudio.google.com)

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install fastapi uvicorn python-multipart pymupdf langchain langchain-text-splitters langchain-google-genai langchain-community faiss-cpu python-dotenv

# Create .env file in backend folder
echo GEMINI_API_KEY=your_key_here > backend/.env

# Run the backend
cd backend
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Run the frontend
npm run dev
```

### Usage

1. Open `http://localhost:5173` in your browser
2. Upload a research paper PDF using the sidebar
3. Wait for it to be indexed
4. Type your question and press Ask
5. View the answer and source chunks

## 📝 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

## 🔮 Future Plans

- Multimodal RAG (images and tables)
- Chat history and memory
- Support for multiple PDFs
- Deploy to cloud
