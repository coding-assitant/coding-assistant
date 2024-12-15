import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToModel, cancelMessage } from '../services/modelService'; // 新增 cancelMessage
import HistoryModal from './HistoryModal';
import '../styles/sidebar.css';


const Sidebar = ({ codeText, setCodeText }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false); // 新增状态变量
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const chatHistoryRef = useRef(null);

  // useEffect(() => {
  //   setInput(codeText);
  // }, [codeText]);

  // 监听 messages 变化并滚动到最新消息
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);
  // 更新消息列表的回调
  const addMessage = (newMessage) => {
    // console.log("New message received:", newMessage);
  
    setMessages((prevMessages) => {
      if (newMessage.role === 'system' && !newMessage.loading && newMessage.content === '') {
        // console.log("Removing loading bubble:", newMessage.id);
        return prevMessages.filter((msg) => msg.id !== newMessage.id);
      }
  
      if (newMessage.role === 'model' && newMessage.loading) {
        const lastMessageIndex = prevMessages.length - 1;
        if (prevMessages[lastMessageIndex]?.role === 'model') {
          // console.log("Updating existing model message with loading status:", newMessage);
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = { ...newMessage };
          return updatedMessages;
        }
      }

      if (newMessage.role === 'model' && !newMessage.loading && newMessage.content === '') {
        // console.log("Removing model bubble:", newMessage.id);
        return prevMessages.filter((msg) => msg.id !== newMessage.id);
      }

      // 如果是最终更新且 loading 为 false，则更新最后一个 model 消息
      if (newMessage.role === 'model' && !newMessage.loading) {
        const lastMessageIndex = prevMessages.length - 1;
        if (prevMessages[lastMessageIndex]?.role === 'model') {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = { ...newMessage };
          return updatedMessages;
        }
      }
  
      console.log("Adding new message to the list:", newMessage);
      return [...prevMessages, newMessage];
    });
  };
  
  
  const handleSendClick = () => {
    if (isSending) {
      // 当前为“中断”状态，取消请求
      cancelMessage();
      setIsSending(false); // 切换回“发送”状态
    } else {
      // 当前为“发送”状态，发送消息
      if (!input.trim()) return;
      const messageContent = input;
      setInput(''); // 清空输入框
      setIsSending(true); // 设置为“发送中”状态
      console.log("Sending message to model:", messageContent);
      // if (codeText === undefined) {
      //   codeText = "";
      // }
      console.log("Code text:", codeText);
      sendMessageToModel(messageContent, addMessage, addMessage, setIsSending, codeText); // 传递 setIsSending 以更新状态
    }
  };

  

  return (
    <div id="custom-sidebar" className="sidebar-container">
     
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
              onClick={() => setCodeText('')} // 点击按钮清空 codeText
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
