async function fetchSSE(resource, options) {
  const { onMessage, onError, onMessageEnd, ...fetchOptions } = options;
  
  // ÄÚÁª createParser º¯Êý
  function createParser(onParse) {
    let buffer = '';
    return {
      feed(chunk) {
        buffer += chunk;
        let position = 0;
        while (position < buffer.length) {
          const nextNewline = buffer.indexOf('\n', position);
          if (nextNewline === -1) break;
          const line = buffer.slice(position, nextNewline);
          position = nextNewline + 1;
          if (line.startsWith('data:') && line.slice(5).trim().startsWith('{')) {
            const eventData = line.slice(5).trim();
            try {
              const parsedData = JSON.parse(eventData);
              if (parsedData.event === 'message') {
                // console.log("处理 message 类型事件:", parsedData);
                onParse({ event: 'message', data: line.slice(5) });
              } else if (parsedData.event === 'error') {
                console.error("处理 error 类型事件:", parsedData);
                onError();  // 调用 onError 处理错误
              } else if (parsedData.event === 'message_end') {
                // console.log("处理 message_end 类型事件:", parsedData);
                onMessageEnd();  // 调用 onMessageEnd 处理消息结束
              }
            } catch (e) {
              console.error("JSON 解析错误:", e);
            }
          }else {
            // 未识别的行，记录警告日志
            // console.warn("Unrecognized line format:", line);
          }
        }
        buffer = buffer.slice(position);
      },
    };
  }

  const response = await fetch(resource, fetchOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const parser = createParser((mes) => {
    if (mes.event === 'message') {
      onMessage(mes.data);
    }
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: isDone } = await reader.read();
    done = isDone;
    if (value) {
      parser.feed(decoder.decode(value));
    }
  }
}

export default fetchSSE;
