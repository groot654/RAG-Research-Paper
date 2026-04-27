import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle PDF upload
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.message) {
        setUploaded(true);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setUploading(false);
    }
  };

  // Handle question
  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.answer) {
        setAnswer(data.answer);
        setSources(data.sources || []);
      } else {
        setError("No answer received.");
      }
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Sidebar */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-white">📄 RAG Research</h1>
          <p className="text-sm text-gray-400 mt-1">Ask questions about any paper</p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-300 font-medium">Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setFile(e.target.files[0]); setUploaded(false); }}
            className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
          />
          {file && (
            <p className="text-xs text-gray-500 truncate">📎 {file.name}</p>
          )}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded transition"
          >
            {uploading ? "Indexing..." : "Upload & Index"}
          </button>
          {uploaded && (
            <p className="text-xs text-green-400">✅ Paper indexed successfully!</p>
          )}
        </div>

        <div className="mt-auto text-xs text-gray-600">
          <p>Powered by</p>
          <p>Gemini + LangChain + FAISS</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8 gap-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold">Ask a Question</h2>
          <p className="text-gray-400 text-sm mt-1">
            Upload a research paper on the left, then ask anything about it.
          </p>
        </div>

        {/* Question input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="What problem does this paper solve?"
            disabled={!uploaded}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
          <button
            onClick={handleAsk}
            disabled={!uploaded || loading || !question.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-3 rounded-lg transition"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Answer */}
        {answer && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-400 mb-3">Answer</h3>
            <p className="text-gray-100 text-sm leading-relaxed">{answer}</p>
          </div>
        )}

        {/* Source chunks */}
        {sources.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              📚 Source chunks used
            </h3>
            <div className="flex flex-col gap-3">
              {sources.map((src, i) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-xs text-gray-400 leading-relaxed"
                >
                  <span className="text-gray-500 font-medium">Chunk {i + 1}: </span>
                  {src}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!answer && !loading && uploaded && (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            Ask a question above to get started
          </div>
        )}

        {!uploaded && !answer && (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            Upload a PDF on the left to get started
          </div>
        )}
      </div>
    </div>
  );
}

export default App;