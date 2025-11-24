import React, { useState } from "react";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const toggleChat = () => setOpen(!open);

  const sendMessage = () => {
    if (!input.trim()) return;

    // User message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Bot typing simulation
    setTyping(true);

    setTimeout(() => {
      const botMsg = {
        sender: "bot",
        text: "Mình là Chatbot demo nè! Backend chưa kết nối nên trả lời thử nha 💜",
      };

      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 800);
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
