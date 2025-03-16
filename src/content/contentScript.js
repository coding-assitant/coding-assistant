import React, { useEffect } from 'react';
import { showIcon } from '../utils/iconManager';

const App = () => {
  // 鼠标事件监听器：处理选中文本并显示图标
  useEffect(() => {
    const mouseUpListener = (e) => {
      // 只处理鼠标左键（button === 0）抬起事件
      if (e.button === 0) {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
          chrome.storage.local.set({ codeText: selectedText });
          showIcon(e.pageX, e.pageY, selectedText);
        }
      }
    };

    const contextMenuListener = (e) => {
      // 检查是否有选中文本，记录日志，保留默认行为
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        console.log('右键菜单触发，选中文本为：', selectedText);
      }
    };

    document.addEventListener('mouseup', mouseUpListener);
    document.addEventListener('contextmenu', contextMenuListener);

    // 清理监听器
    return () => {
      document.removeEventListener('mouseup', mouseUpListener);
      document.removeEventListener('contextmenu', contextMenuListener);
    };
  }, []);
}

export default App;

// React 挂载逻辑
import { createRoot } from 'react-dom/client';
const mountNode = document.createElement('div');
document.body.appendChild(mountNode);
const root = createRoot(mountNode);
root.render(<App />);
