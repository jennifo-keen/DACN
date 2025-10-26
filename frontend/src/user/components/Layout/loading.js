import React, { useEffect } from 'react';

const Loading = () => {
  useEffect(() => {
    const styleId = 'loading-styles';
    let style = document.getElementById(styleId);
    
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 770px;
          max-height: 1000px;
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px 20px;
        }
        
        .spinner-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
        }
        
        .spinner {
          width: 80px;
          height: 80px;
          border: 4px solid rgba(255, 107, 53, 0.1);
          border-top: 4px solid #ff6b35;
          border-right: 4px solid #ff8c5a;
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }
        
        .spinner-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 3px solid rgba(255, 107, 53, 0.2);
          border-bottom: 3px solid #ff6b35;
          border-radius: 50%;
          animation: spin-reverse 0.8s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        
        /* Pulsing dots */
        .loading-text {
          margin-top: 30px;
          color: #666;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .loading-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          background: #ff6b35;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }
        
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        /* Glowing effect */
        .spinner-wrapper::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        /* Loading progress bar */
        .loading-progress {
          margin-top: 20px;
          width: 200px;
          height: 4px;
          background: rgba(255, 107, 53, 0.1);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        
        .loading-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff6b35 0%, #ff8c5a 50%, #ff6b35 100%);
          background-size: 200% 100%;
          border-radius: 10px;
          animation: progress 1.5s ease-in-out infinite;
        }
        
        @keyframes progress {
          0% {
            width: 0%;
            background-position: 0% 50%;
          }
          50% {
            width: 70%;
            background-position: 100% 50%;
          }
          100% {
            width: 100%;
            background-position: 0% 50%;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <div className="spinner-inner"></div>
      </div>
      
      <div className="loading-text">
        <span>Đang tải</span>
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
      
      <div className="loading-progress">
        <div className="loading-progress-bar"></div>
      </div>
    </div>
  );
};

export default Loading;