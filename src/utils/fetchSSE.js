async function fetchSSE(resource, options) {
  const { onMessage, ...fetchOptions } = options;

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
          console.log("Line matching :", line);
          if (line.startsWith('data:') && line.slice(5).trim().startsWith('{')) {
            console.log(" NOT Line matching :", line);
            onParse({ type: 'event', data: line.slice(5) });
          }else {
            // 未识别的行，记录警告日志
            console.warn("Unrecognized line format:", line);
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

  const parser = createParser((event) => {
    if (event.type === 'event' && event.data !== '[DONE]') {
      onMessage(event.data);
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
