import startApi from './index.js';

const ollamaApi = startApi('ollama', {
  apiKey: '123',
  host: 'http://192.168.0.111:11434',
  // headers
  // fetch
});

const openaiApi = startApi('openai', {
  apiKey: '123',
  baseURL: 'http://192.168.0.111:11434/v1',
  // headers
  // fetch
});

const demo = async () => {
  const ollamaResult = await ollamaApi.generate('你好', {
    model: 'devstral-small-2',
    stream: false,
    options: {
      temperature: 0.15,
      top_p: 0.9,
    },
  }, (mesg) => {
    console.log(mesg);
  });
  console.log(ollamaResult);

  const openaiResult = await openaiApi.chat('你是谁', {
    model: 'qwen3-vl',
    temperature: 0.15,
    stream: true,
    extra_body: {
      top_k: 20,
    },
  }, (mesg, resp) => {
    console.log(mesg, resp);
  });
  console.log(openaiResult);
};

demo();
