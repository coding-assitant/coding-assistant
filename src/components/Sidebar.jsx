import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToModel, cancelMessage, switchModel } from '../services/modelService';
import HistoryModal from './HistoryModal';
import '../styles/sidebar.css';

const Sidebar = ({ codeText, setCodeText }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false); // 新增状态变量
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const chatHistoryRef = useRef(null);
  const [currentModel, setCurrentModel] = useState('default');
  const [showModelSwitch, setShowModelSwitch] = useState(false);

  // 新增切换方法
  const toggleModelSwitch = () => {
    setShowModelSwitch(!showModelSwitch);
  };

  // 修改后的模型切换容器
  const ModelSwitch = () => (
  <div className={`model-switch-container ${showModelSwitch ? 'visible' : ''}`}>
    <button onClick={() => handleModelSwitch('default')}
      className={currentModel === 'default' ? 'active' : ''}>
      默认模型
    </button>
    <button onClick={() => handleModelSwitch('deepSeek')}
      className={currentModel === 'deepSeek' ? 'active' : ''}>
      DeepSeek
    </button>
  </div>
  );
  
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

  
  const handleModelSwitch = (model) => {
    switchModel(model);
    setCurrentModel(model);
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

      {/* 输入框容器外新增包裹层 */}
      <div className="input-area-wrapper">
        {/* 新增触发按钮 */}
        <button
          className="model-switch-trigger"
          onClick={toggleModelSwitch}
        >
          {showModelSwitch ? '▼' : '▲'}
        </button>
      
        {/* 渲染模型切换容器 */}
        <ModelSwitch />

        {/* 原有输入框容器 */}
        <div className="chat-input-container">
          {/* 代码文本展示框 */}
          {codeText && (
            <div className="code-display-box">
              <button
                className="close-button"
                onClick={() => setCodeText('')} // 点击按钮清空 codeText
              > X
              </button>
              <p className="code-text">{codeText}</p>
            </div>
          )}

          {/* 输入框和发送按钮并排排列 */}
          <div style={{ display: 'flex', width: '100%' }}>
            <textarea
              className="chat-input"
              placeholder="给“coding assistant”发送消息"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
            />
            <button className='send-button' onClick={handleSendClick}>
              {isSending ? (
                <svg t="1737373005664" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8942" width="18" height="18">
                  <path d="M320 896a64 64 0 0 1-64-64V192a64 64 0 0 1 128 0v640a64 64 0 0 1-64 64zM704 896a64 64 0 0 1-64-64V192a64 64 0 0 1 128 0v640a64 64 0 0 1-64 64z" fill="#ffffff" p-id="8943"></path>
                </svg>
              ) : (
                <svg t="1737372825203" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6861" width="18" height="18">
                  <path d="M975.104 356.096a48.896 48.896 0 0 0-48.896 48.64v443.136a76.8 76.8 0 0 1-76.8 76.8H175.616a76.8 76.8 0 0 1-76.8-76.8V404.736a48.896 48.896 0 0 0-97.792 0v443.136A175.872 175.872 0 0 0 175.616 1024h673.024A176.128 176.128 0 0 0 1024 847.872V404.736a48.896 48.896 0 0 0-48.896-48.64z" p-id="6862" fill="#ffffff"></path>
                  <path d="M386.56 748.8h246.016a51.2 51.2 0 0 1 51.2 41.472 48.896 48.896 0 0 1-48.384 56.064h-244.992a51.2 51.2 0 0 1-51.2-41.728 48.896 48.896 0 0 1 47.36-55.808zM547.328 4.352l204.8 234.752a12.8 12.8 0 0 1-9.728 21.248h-100.608a12.544 12.544 0 0 0-12.544 11.008c-7.68 54.528-53.248 296.192-269.056 332.8a13.056 13.056 0 0 1-10.496-22.784 272.896 272.896 0 0 0 99.072-184.832 1001.728 1001.728 0 0 0 7.424-122.624 13.312 13.312 0 0 0-12.8-13.056H332.8a12.8 12.8 0 0 1-9.728-21.248l204.8-234.496a12.8 12.8 0 0 1 19.456-0.768z" p-id="6863" fill="#ffffff"></path>
                </svg>
              )}
            </button>
          </div>
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
