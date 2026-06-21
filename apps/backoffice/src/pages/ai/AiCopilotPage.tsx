import React, { useState } from "react";

interface Message { role: "user" | "assistant"; content: string; }

const suggestedQueries = [
  "Show operators with declining GGR",
  "Which providers are losing money?",
  "Show pending settlements",
  "Show high-risk players",
  "Which routes have rising error rates?",
  "Explain why this withdrawal is blocked",
  "Generate banner concepts for summer promotion"
];

export function AiCopilotPage(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState("operations");

  const contexts = ["kpi", "risk", "operations", "media", "support", "workflow"];

  const send = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const assistantMessage: Message = {
      role: "assistant",
      content: `[AI Copilot — ${context} context] I understand you're asking about: "${userMessage.content}". In a production environment, I would analyze your platform data, query the warehouse, and provide a detailed response with specific metrics and recommendations. Connect the AI service to Cloudflare Workers AI or OpenAI to enable live responses.`
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Copilot</h1>
          <p className="page-subtitle">Natural language assistant for KPIs, risk, operations, media, and support workflows</p>
        </div>
        <div className="page-actions">
          <select className="select" value={context} onChange={(e) => setContext(e.target.value)} style={{ width: "160px" }}>
            {contexts.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)} Context</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => setMessages([])}>Clear</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", height: "calc(100vh - 200px)" }}>
        {/* Chat */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header">
            <div className="card-title">🤖 Copilot — {context.charAt(0).toUpperCase() + context.slice(1)} Mode</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤖</div>
                <div className="empty-state-title">How can I help you today?</div>
                <div className="empty-state-description">Ask me about KPIs, providers, players, routes, payments, or compliance. I can analyze data and provide recommendations.</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: msg.role === "user" ? "var(--color-brand-600)" : "var(--color-neutral-100)",
                  color: msg.role === "user" ? "#fff" : "var(--color-neutral-800)",
                  fontSize: "0.875rem",
                  lineHeight: "1.5"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex" }}>
                <div style={{ background: "var(--color-neutral-100)", padding: "12px 16px", borderRadius: "12px 12px 12px 2px" }}>
                  <span className="spinner" style={{ width: "14px", height: "14px" }} /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--color-neutral-200)", display: "flex", gap: "12px" }}>
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              placeholder="Ask anything about providers, players, routes, finance…"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => void send()} disabled={!input.trim() || isLoading}>
              {isLoading ? <span className="spinner" style={{ width: "14px", height: "14px" }} /> : "Send"}
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="card" style={{ height: "fit-content" }}>
          <div className="card-header">
            <div className="card-title">Suggested Queries</div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {suggestedQueries.map((query) => (
              <button
                key={query}
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal" }}
                onClick={() => setInput(query)}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
