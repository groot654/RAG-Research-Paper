import { useState, useRef } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  const handleFile = (f) => {
    setFile(f);
    setUploaded(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    const valid = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (f && f.type === "application/pdf") handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.message) setUploaded(true);
    } catch {
      alert("Could not connect to backend.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !uploaded) return;
    const q = question.trim();
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer || "No answer found.", sources: data.sources || [] },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Could not connect to backend.", sources: [] }]);
    } finally {
      setLoading(false);
      setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="flex w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl">

        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-5 p-6 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>📄</div>
            <div>
              <div className="text-white font-semibold text-sm">RAG Research</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>AI Paper Assistant</div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl p-5 text-center cursor-pointer transition-all"
            style={{
              border: `1.5px dashed ${dragging ? "rgba(102,126,234,0.8)" : "rgba(255,255,255,0.2)"}`,
              background: dragging ? "rgba(102,126,234,0.1)" : "rgba(255,255,255,0.03)",
            }}>
            <div className="text-3xl mb-2">☁️</div>
            <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              Drag & drop your PDF, DOCX, or TXT file<br />
              <span style={{ color: "#667eea", fontWeight: 600 }}>or click to browse</span>
            </div>
            <input ref={inputRef} type="file" accept=".pdf, .docx, .txt" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {/* File badge */}
          {file && (
            <div className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: "rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.3)" }}>
              <span className="text-xl">📑</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{file.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {(file.size / 1024).toFixed(0)} KB
                </div>
              </div>
              {uploaded && <span style={{ color: "#4ade80" }}>✓</span>}
            </div>
          )}

          {/* Upload button */}
          <button onClick={handleUpload} disabled={!file || uploading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}>
            {uploading ? "Indexing..." : "Index Paper"}
          </button>

          {/* Status */}
          {uploaded && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }}></div>
              <span className="text-xs font-medium" style={{ color: "#4ade80" }}>Paper indexed successfully</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 text-center text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }}>
            Powered by<br />
           <span style={{ color: "#667eea", fontWeight: 600 }}>or click to browse</span>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col" style={{ background: "rgba(255,255,255,0.97)" }}>

          {/* Topbar */}
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div>
              <div className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>Ask about your paper</div>
              <div className="text-xs mt-0.5" style={{ color: "#888" }}>
                {file ? file.name : "No paper uploaded yet"}
              </div>
            </div>
            <div className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#f0f0ff", border: "1px solid #d4d4ff", color: "#534AB7" }}>
              gemini-2.0-flash
            </div>
          </div>

          {/* Chat area */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
                <div className="text-4xl">💬</div>
                <div className="text-sm" style={{ color: "#888" }}>
                  {uploaded ? "Ask anything about your paper" : "Upload a paper to get started"}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="px-4 py-2.5 rounded-2xl rounded-br-sm text-white text-sm max-w-xs leading-relaxed"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-lg">
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", color: "#1a1a2e", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>A</div>
                      <span className="text-xs" style={{ color: "#aaa" }}>RAG Assistant</span>
                      {msg.sources?.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                          style={{ background: "#f5f3ff", border: "1px solid #e0d9ff", color: "#534AB7" }}>
                          📚 {msg.sources.length} sources
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking animation */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2"
                  style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#667eea", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: "#888" }}>Searching paper...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="px-6 py-4 flex gap-3 items-center"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={uploaded ? "Ask anything about the paper..." : "Upload a paper first..."}
              disabled={!uploaded || loading}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none disabled:opacity-50"
              style={{ background: "#f8f8fc", border: "1.5px solid #e8e6ff", color: "#1a1a2e" }}
            />
            <button onClick={handleAsk} disabled={!uploaded || loading || !question.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", fontSize: 16 }}>
              ➤
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}