import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToModel, cancelMessage, switchModel } from '../services/modelService';
import HistoryModal from './HistoryModal';
import '../styles/sidebar.css';

const Sidebar = ({ codeText, setCodeText }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const chatHistoryRef = useRef(null);
  const [currentModel, setCurrentModel] = useState('default');

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => {
      if (newMessage.role === 'system' && !newMessage.loading && newMessage.content === '') {
        return prevMessages.filter((msg) => msg.id !== newMessage.id);
      }
      if (newMessage.role === 'model' && newMessage.loading) {
        const lastMessageIndex = prevMessages.length - 1;
        if (prevMessages[lastMessageIndex]?.role === 'model') {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = { ...newMessage };
          return updatedMessages;
        }
      }
      if (newMessage.role === 'model' && !newMessage.loading && newMessage.content === '') {
        return prevMessages.filter((msg) => msg.id !== newMessage.id);
      }
      if (newMessage.role === 'model' && !newMessage.loading) {
        const lastMessageIndex = prevMessages.length - 1;
        if (prevMessages[lastMessageIndex]?.role === 'model') {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = { ...newMessage };
          return updatedMessages;
        }
      }
      return [...prevMessages, newMessage];
    });
  };

  const handleSendClick = () => {
    if (isSending) {
      cancelMessage();
      setIsSending(false);
    } else {
      if (!input.trim()) return;
      const messageContent = input;
      setInput('');
      setIsSending(true);
      sendMessageToModel(messageContent, addMessage, addMessage, setIsSending, codeText);
    }
  };

  const handleModelSwitch = (model) => {
    switchModel(model);
    setCurrentModel(model);
  };

  return (
    <div id="custom-sidebar" className="sidebar-container">
      {/* 模型切换按钮 */}
      <div className="model-switch-container">
        <button onClick={() => handleModelSwitch('default')} disabled={currentModel === 'default'}>
          默认模型
        </button>
        <button onClick={() => handleModelSwitch('deepSeek')} disabled={currentModel === 'deepSeek'}>
          DeepSeek 模型
        </button>
      </div>

      {/* 聊天记录容器 */}
      <div className="chat-history" id="chat-history" ref={chatHistoryRef}>
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`chat-bubble ${msg.role}-bubble`}>
            {msg.role === 'model' ? (
              <span dangerouslySetInnerHTML={{ __html: msg.content }} />
            ) : (
              msg.content
            )}
            {msg.loading && <span className="loading-indicator">...</span>}
            <span className="timestamp">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* 输入框和发送按钮 */}
      <div className="chat-input-container">
        {/* 代码文本展示框 */}
        {codeText && (
          <div className="code-display-box">
            <button
              className="close-button"
              onClick={() => setCodeText('')}
            >
              ×
            </button>
            <p className="code-text">{codeText}</p>
          </div>
        )}

        {/* 输入框和发送按钮并排排列 */}
        <div style={{ display: 'flex', width: '100%' }}>
          <textarea
            className="chat-input"
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendClick();
              }
            }}
          />
          <button className="send-button" onClick={handleSendClick}>
            {isSending ? '中断' : '发送'}
          </button>
        </div>
      </div>

      {/* 历史记录弹窗 */}
      <HistoryModal
        isVisible={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
      />
    </div>
  );
};

export default Sidebar;
