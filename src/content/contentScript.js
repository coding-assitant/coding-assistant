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

  // 交叉观察器：当代码块进入视野时显示图标
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const codeBlock = entry.target;

            // 防止重复处理
            if (codeBlock.dataset.processed) return;
            codeBlock.dataset.processed = 'true';

            const rect = codeBlock.getBoundingClientRect();
            const x = window.scrollX + rect.right + 5;
            const y = window.scrollY + rect.top + 100;
            const text = codeBlock.textContent.trim();

            chrome.storage.local.set({ codeText: text });
            showIcon(x, y, text);
            observer.unobserve(codeBlock); // 停止观察该代码块
          }
        });
      },
      { threshold: 0.1 }
    );

    // 选择页面中的代码块并观察
    document.querySelectorAll('pre, code, .example_code').forEach((block) => {
      if (!block.dataset.processed) {
        observer.observe(block);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // 不需要渲染任何内容
};

export default App;

// React 挂载逻辑
import { createRoot } from 'react-dom/client';
const mountNode = document.createElement('div');
document.body.appendChild(mountNode);
const root = createRoot(mountNode);
root.render(<App />);
