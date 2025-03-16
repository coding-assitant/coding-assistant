import { getController, setController } from '../services/modelService';  // 导入方法
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
    // 清除本地存储中的对话相关信息
    localStorage.removeItem('conversation_id');
    localStorage.removeItem('message_id');
    // 获取当前的 controller 并中止请求
    const currentController = getController();
    if (currentController) {
        currentController.abort(); // 中断当前请求
        console.log("Current conversation aborted.");
    }

    // 创建新的 AbortController
    const newController = new AbortController();
    setController(newController); // 更新 controller

    console.log("New conversation started. conversation_id and parent_message_id cleared.");
  
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