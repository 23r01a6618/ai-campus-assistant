import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatInterface.css';
import StructuredResponse from './StructuredResponse';
import { sendMessage } from '../services/api';

export default function ChatInterface({ userToken }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Welcome to Campus AI Assistant! I'm here to help you find information about events, clubs, facilities, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(input, userToken);
      
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        timestamp: new Date(),
        data: response.data,  // Structured response with sections
        aiResponse: response.aiResponse  // Gemini-powered response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: error.error || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🎓 Campus AI Assistant</h2>
        <p>Ask me anything about your campus</p>
      </div>

      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`message message-${msg.sender} ${msg.isError ? 'error' : ''}`}>
            <div className="message-content">
              {msg.text && <p>{msg.text}</p>}
              {msg.aiResponse && <div className="ai-response"><p>{msg.aiResponse}</p></div>}
              {msg.data && <StructuredResponse sections={msg.data.sections} />}
            </div>
            <small className="message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        ))}
        {loading && (
          <div className="message message-bot loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about events, clubs, facilities, or anything else..."
          disabled={loading}
          className="message-input"
        />
        <button type="submit" disabled={loading} className="send-button">
          {loading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}
