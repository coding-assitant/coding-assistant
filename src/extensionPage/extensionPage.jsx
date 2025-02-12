// 获取按钮和侧边栏元素
const collapseSidebarBtn = document.getElementById('collapse-sidebar-btn');
const expandSidebarBtn = document.getElementById('expand-sidebar-btn');
const sidebar = document.querySelector('.leftSide-ptURZT');
const mainContent = document.querySelector('main');

// 点击缩起按钮
collapseSidebarBtn.addEventListener('click', function () {
  // 缩起侧边栏
  sidebar.classList.add('collapsed');
  mainContent.classList.add('collapsed');

  // 显示上边栏的展开按钮
  expandSidebarBtn.style.display = 'block';
});

// 点击展开按钮
expandSidebarBtn.addEventListener('click', function () {
  // 展开侧边栏
  sidebar.classList.remove('collapsed');
  mainContent.classList.remove('collapsed');

  // 隐藏上边栏的展开按钮
  expandSidebarBtn.style.display = 'none';
});


document.getElementById('new-chat-btn').addEventListener('click', function () {
    // 清空对话框
    document.getElementById('chat-history').innerHTML = '';

    // 发送请求通知后端创建新会话（如果需要）
    // fetch('http://你的后端地址/api/new-chat', { method: 'POST' })
    //     .then(response => response.json())
    //     .then(data => console.log('新对话创建成功:', data))
    //     .catch(error => console.error('新对话创建失败:', error));
});


// src/extensionPage/extensionPage.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import SideBar from '../components/Sidebar';  // 导入 SideBar 组件

const ExtensionPage = () => {
  return (
    <div>
      {/* 渲染 SideBar 组件 */}
      <SideBar />
    </div>  
  );
};

// React 渲染到 main 标签
ReactDOM.render(
  <ExtensionPage />,
  document.getElementById('main')
);