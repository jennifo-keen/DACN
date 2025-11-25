import React, { useState } from "react";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const toggleChat = () => setOpen(!open);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // user message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const text = input;
    setInput("");
    setTyping(true);

    try {
      // gọi về backend AI
      const res = await fetch("http://localhost:4000/api/ai/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.answer || "AI không trả lời được.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Lỗi kết nối server AI ❌" }
      ]);
    }

    setTyping(false);
  };


  return (
    <>
      {!open && (
        <button className="chat-floating-btn" onClick={toggleChat}>
          <img
            src="/icons/chat-icon.svg"
            alt="Chat"
            style={{ width: "30px", height: "30px" }}
          />
        </button>
      )}

      {open && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>Trợ lý Ai ✨ </span>
            <button className="close-btn" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`bubble-row ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="avatar">🤖</div>
                )}

                <div className={`chat-msg ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="bubble-row bot">
                <div className="avatar">🤖</div>
                <div className="chat-msg bot typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-bar">

            <input
              type="text"
              value={input}
              placeholder="Enter your message"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button className="send-btn" onClick={sendMessage}>
              <img
                src="/icons/send-icon.svg"
                alt="Send"
                style={{ width: "25px", height: "25px" }}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
