import fetchSSE from '../utils/fetchSSE';
import {marked} from 'marked';
import {saveFavorite} from './favoriteService'
import { saveHistory } from './historyService';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 可根据需要选择其他主题样式

// 配置 marked 的高亮函数
marked.use({
  renderer: {
    code(code, infostring) {
      try {
        console.log("Processing code block...");
        console.log("Raw code block content:", code);
        console.log("Infostring (language):", infostring);

        // 检查 code 是否为对象，并提取实际代码内容
        if (typeof code === 'object' && code !== null) {
          // console.warn("Code block content is an object. Extracting 'text' field.");
          code = code.text || ''; // 使用 text
        }

        // 确保 code 是字符串
        if (typeof code !== 'string') {
          console.error("Code block content is not a string:", code);
          code = String(code || ''); // 转为字符串，避免报错
        }

        const lang = (infostring || '').split(/\s+/)[0];
        if (lang && hljs.getLanguage(lang)) {
          const highlighted = hljs.highlight(code, { language: lang }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } else {
          const highlighted = hljs.highlightAuto(code).value;
          return `<pre><code class="hljs">${highlighted}</code></pre>`;
        }
      } catch (err) {
        console.error("Error processing code block:", err);
        return `<pre><code>${code}</code></pre>`;
      }
    }
  }
});

const apiKey = process.env.API_KEY;
let controller;

// 全局变量，用于管理正常回复和重新回复的气泡 ID
const globalState = {
  currentModelBubbleId: null,
  retryBubbleId: null,
  latestMessageId: null,  // 用于追踪最新消息的 ID
};

let globalText = '';  // 用于存储文本

// 设置全局文本的函数
export const setGlobalText = (text) => {
  globalText = text;
  console.log('Global text set:', globalText);  // 打印设置的文本，确认是否成功
};

// 获取全局文本的函数
export const getGlobalText = () => globalText;

const messageHistory = new Map();

let uniqueIdCounter = 0;
// 生成唯一的消息 ID
function generateUserBubbleId() {
  uniqueIdCounter += 1; // 每次生成 ID 时递增
  return `${Date.now()}-${uniqueIdCounter}`; // 时间戳 + 计数器组合成唯一 ID
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getStorageSync(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function(result) {
      if (result[key]) {
        resolve(result[key]);
      } else {
        reject(new Error(`Key ${key} not found`));
      }
    });
  });
}

export async function sendMessageToModel(messageContent, onUserMessage, onModelMessage, setIsSending, codetext='',isRetry = false, messageObject = null) {
  isRetry = !!isRetry; // 确保 isRetry 为布尔值
  controller = new AbortController();
  const { signal } = controller;
  const timestamp = new Date().toLocaleTimeString();
  // 如果是新消息而不是重试，创建并存储消息对象
  if (!isRetry) {
    const userBubbleId = generateUserBubbleId();
    messageObject = { id: userBubbleId, content: messageContent };
    onUserMessage({ role: 'user', content: messageContent, timestamp, loading: false, id: userBubbleId });
    saveHistory('user', messageContent);
    messageHistory.set(userBubbleId, messageObject);  // 将完整的消息对象存入 Map
    globalState.latestMessageId = userBubbleId; // 更新最新消息 ID
    // console.log("新消息存储到 messageHistory:", userBubbleId, messageContent);
    globalState.retryBubbleId = null;
    globalState.latestMessageId = userBubbleId; // 更新最新消息 ID
  } else if (messageObject) {
    // console.log("重试消息使用的 userBubbleId:", messageObject.id);
    if (!messageObject) {
      return;
    }
  }

  let modelBubbleId = null;
  let loadingBubbleId = generateUserBubbleId();
  let isFirstUpdate = true;

  if (isRetry && messageObject) {
    modelBubbleId = globalState.retryBubbleId;
    onModelMessage({ role: 'model', content: '', loading: false, id: modelBubbleId });
    onModelMessage({ role: 'system', content: '重新回复中...', timestamp: '', loading: true, id: modelBubbleId });
  } else {
    onModelMessage({ role: 'system', content: '模型正在思考中...', timestamp: '', loading: true, id: loadingBubbleId });
  }

  let modelResponseContent = "";

  try {
    setIsSending(true);


    console.log('发送请求参数:', {
      inputs: { code: codetext },
      query: messageObject.content,
      response_mode: 'streaming',
      id: await getStorageSync('id')
    });

    await fetchSSE('http://172.16.215.118:8888/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      //   'Authorization': `Bearer app-8fXyKoEq2Ka1XI3ZSs1FftaG`
      },
      body: JSON.stringify({
        // inputs:
        //     {
        //       'code': codetext,
        //     },
        query: messageObject.content,
        // response_mode: "streaming",
        user_id: await getStorageSync('key'),
        solution_id: 158709
      }),
      signal,
      onMessage: (data) => {
        console.log("data : ", data);
        try {
          //{"event": "message", "conversation_id": "71468e0b-b489-4e25-965e-bd86467bff04", "message_id": "d8792cc9-5b8b-4532-80b5-dedfc1200f00", "created_at": 1734343651, "task_id": "9040f0d7-f504-4b44-858f-5c904b882c1e", "id": "d8792cc9-5b8b-4532-80b5-dedfc1200f00", "answer": "include", "from_variable_selector": null}
          const parsedData = JSON.parse(data);
          console.log(parsedData)
          const content = parsedData.answer || "";
          modelResponseContent += content;

          if (isRetry && isFirstUpdate) {
            onModelMessage({ role: 'system', content: '', loading: false, id: modelBubbleId });
            isFirstUpdate = false;
          } else if (!modelBubbleId) {
            onModelMessage({ role: 'system', content: '', loading: false, id: loadingBubbleId });
            modelBubbleId = loadingBubbleId;
          }

          onModelMessage({
            role: 'model',
            content: marked.parse(modelResponseContent.trim()),
            timestamp: timestamp,
            loading: true,
            id: modelBubbleId,
          });
          // }
        } catch (err) {
          console.error("解析数据时出错：", err);
        }
      },
      onError: () => {
        console.error("Error event received:", data);
      },
      onMessageEnd: () => {
        console.log("Message end event received:", data);
      },
    });

    if (modelBubbleId) {
      const finalContent = marked.parse(modelResponseContent.trim());
      const contentWithButton = `${finalContent.trim()}${generateButtonHTML(modelBubbleId).trim()}`;
      onModelMessage({
        role: 'model',
        content: contentWithButton,
        timestamp: timestamp,
        loading: false,
        id: modelBubbleId,
      });
      saveHistory('model', modelResponseContent);
      bindButtonEvents(modelBubbleId, modelResponseContent, onModelMessage, setIsSending, messageObject);

      if (!isRetry) {
        globalState.retryBubbleId = modelBubbleId;
      }
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      onModelMessage({ role: 'system', content: '请求已中断', timestamp: '' });
    } else {
      onModelMessage({ role: 'error', content: '错误：无法连接到模型', timestamp });
    }
  } finally {
    setIsSending(false);
  }
}

export function cancelMessage() {
  if (controller) controller.abort();
}

function bindButtonEvents(id, content, onModelMessage, setIsSending, messageObject) {
  // 延迟绑定事件，确保按钮容器和按钮都已生成
  setTimeout(() => {
    // 检查按钮容器是否存在
    const container = document.querySelector(`#button-container-${id}`);

    // 绑定通用按钮事件
    const bindButton = (selector, callback, description) => {
      const button = container.querySelector(selector);
      if (button) {
        button.addEventListener('click', callback);
        console.log(`绑定${description}事件: ${selector}`);
      } else {
        console.warn(`${description}未找到: ${selector}`);
      }
    };

    // 绑定复制按钮事件
    bindButton('.copy-button', () => {
      console.log('复制按钮被点击');
      fallbackCopyTextToClipboard(content);
    }, '复制按钮');

    // 绑定重试按钮事件

    bindButton('.retry-button', () => {
      console.log('当前最新消息ID:', globalState.latestMessageId);
      console.log('当前重试的消息ID:', messageObject?.id);

      if (!messageObject) {
        console.error('重试失败：messageObject 为空');
        return;
      }

      if (messageObject.id !== globalState.latestMessageId) {
        alert('暂不支持历史消息重新回复');
        return;
      }

      const originalMessageData = messageHistory.get(messageObject.id);
      if (!originalMessageData) {
        console.error('重试失败：未找到原始用户输入');
        return;
      }

      console.log('重试使用的消息数据:', originalMessageData);

      // 修正参数传递
      sendMessageToModel(
          originalMessageData.content, // 用户消息内容
          null, // 不触发用户消息渲染
          onModelMessage, // 渲染模型响应的回调
          setIsSending, // 控制发送状态的回调
          '', // 代码内容
          true, // 标记为重试
          originalMessageData // 传递正确的消息对象
      );
    }, '重试按钮');


    // 绑定收藏按钮事件
    bindButton('.favorite-button', () => {
      console.log('收藏按钮被点击');
      saveFavorite(content);
      alert('已收藏');
    }, '收藏按钮');
  }, 100); // 延迟 100ms 检查并绑定事件
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert('已复制到剪贴板');
  } catch (err) {
    console.error('复制到剪贴板失败:', err);
    alert('复制失败，请手动复制');
  }
  document.body.removeChild(textArea);
}

// 生成按钮 HTML 的辅助函数
function generateButtonHTML(id) {
  return `
    <div class="button-container" id="button-container-${id}">
      <button class="copy-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_406_3945)">
            <path d="M16.8602 5H12.0002V0.016L16.8602 5ZM10.0002 7V0H5.00015C4.2045 0 3.44144 0.31607 2.87883 0.87868C2.31622 1.44129 2.00015 2.20435 2.00015 3V19H17.0002V7H10.0002ZM19.0002 7.01V21.038H7.00015V24H22.0002V10L19.0002 7.01Z" fill="#374957"/>
          </g>
          <defs>
            <clipPath id="clip0_406_3945">
              <rect width="24" height="24" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </button>
      <button class="favorite-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_406_2240)">
            <path d="M14.7618 11.5869C14.2152 11.8981 13.6192 12.1132 12.9998 12.2229V23.8739C13.5269 23.7713 14.0336 23.5832 14.4998 23.3169L20.5268 19.8379C21.286 19.3978 21.9164 18.7662 22.355 18.0062C22.7937 17.2462 23.0254 16.3844 23.0268 15.5069V8.54693C23.0236 8.01274 22.9342 7.48257 22.7618 6.97693L14.7618 11.5869Z" fill="#374957"/>
            <path d="M10.242 9.8569C10.7775 10.165 11.3846 10.3271 12.0024 10.3271C12.6203 10.3271 13.2274 10.165 13.7629 9.8569L21.763 5.2469C21.4086 4.83978 20.9905 4.49293 20.525 4.2199L14.5 0.736897C13.7394 0.299519 12.8773 0.0693359 12 0.0693359C11.1226 0.0693359 10.2605 0.299519 9.49995 0.736897L3.47295 4.2169C3.024 4.47979 2.61908 4.81149 2.27295 5.1999L10.242 9.8569Z" fill="#374957"/>
            <path d="M11 12.2232C10.3802 12.1138 9.78389 11.8986 9.23699 11.5872L1.25699 6.92322C1.07232 7.4449 0.976324 7.99382 0.972992 8.54722V15.5072C0.974454 16.3847 1.20609 17.2465 1.64478 18.0065C2.08347 18.7665 2.71386 19.3981 3.47299 19.8382L9.49999 23.3172C9.96626 23.5835 10.473 23.7716 11 23.8742V12.2232Z" fill="#374957"/>
          </g>
          <defs>
            <clipPath id="clip0_406_2240">
              <rect width="24" height="24" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </button>
      <button class="retry-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_405_1548)">
            <path d="M3.08615 10.6841C3.8103 5.76306 8.3866 2.36083 13.3076 3.08498C14.9866 3.33203 16.5615 4.04842 17.8511 5.15163L16.6902 6.31251C16.3011 6.7017 16.3012 7.33267 16.6905 7.72176C16.8773 7.90851 17.1306 8.01347 17.3948 8.01351H21.9647C22.515 8.01351 22.9611 7.56739 22.9611 7.01705V2.44715C22.961 1.89681 22.5148 1.45077 21.9644 1.45087C21.7003 1.45091 21.4469 1.55587 21.2601 1.74262L19.9646 3.03803C15.0245 -1.36557 7.44996 -0.930701 3.04635 4.00937C1.48628 5.75947 0.473881 7.92878 0.134578 10.2486C0.000799559 11.071 0.559034 11.8462 1.38141 11.98C1.4555 11.992 1.53033 11.9985 1.60539 11.9994C2.3578 11.9913 2.98937 11.4303 3.08615 10.6841Z" fill="#374957"/>
            <path d="M22.3939 11.9992C21.6415 12.0073 21.0099 12.5684 20.9131 13.3146C20.189 18.2356 15.6127 21.6378 10.6917 20.9137C9.0127 20.6666 7.43773 19.9503 6.14815 18.8471L7.30904 17.6862C7.69814 17.297 7.69804 16.666 7.30881 16.2769C7.12201 16.0902 6.86866 15.9852 6.60451 15.9852H2.03471C1.48437 15.9852 1.03824 16.4313 1.03824 16.9816V21.5515C1.03838 22.1019 1.4846 22.5479 2.03494 22.5478C2.29909 22.5478 2.55244 22.4428 2.73924 22.2561L4.03465 20.9606C8.97356 25.3647 16.5476 24.9312 20.9517 19.9922C22.5126 18.2418 23.5255 16.0717 23.8647 13.7511C23.999 12.9287 23.4413 12.1532 22.619 12.0189C22.5446 12.0067 22.4693 12.0001 22.3939 11.9992Z" fill="#374957"/>
          </g>
          <defs>
            <clipPath id="clip0_405_1548">
              <rect width="24" height="24" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </button>      
    </div>
  `;
}