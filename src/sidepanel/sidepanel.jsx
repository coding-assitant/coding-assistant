// SidePanel.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
// import { chrome } from 'browser';

const SidePanel = () => {
  const [codeText, setCodeText] = useState('');
  const openextensionPage = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('extensionPage.html')  // 获取扩展内页面的 URL
    });
  };

  useEffect(() => {
    // 读取初始值
    chrome.storage.local.get(['codeText'], (result) => {
      if (result.codeText) {
        setCodeText(result.codeText);
      }
    });

    // 监听存储变化
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes.codeText) {
        setCodeText(changes.codeText.newValue);
      }
    });

    // 清理监听器
    return () => {
      chrome.storage.onChanged.removeListener((changes, areaName) => {
        if (changes.codeText) {
          setCodeText(changes.codeText.newValue);
        }
      });
    };
  }, []);
    // 右上角按钮点击功能
    const openExtensionPage = () => {
      chrome.runtime.openOptionsPage();
    };
  
    return (
      <div className="side-panel-container">
        {/* 右上角图标 */}
        <div className="top-right-icon-container">
          <button className="top-right-icon" onClick={openextensionPage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="grey" /* 修改颜色为灰色 */
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
        {/* 原有功能 */}
        <Sidebar codeText={codeText} setCodeText={setCodeText} />
      </div>
    );
};

export default SidePanel;

import {createRoot} from "react-dom/client";
const container = document.getElementById('root');
const root =createRoot(container);
root.render(<SidePanel />)

// ReactDOM.render(<SidePanel />, document.getElementById('root'));
