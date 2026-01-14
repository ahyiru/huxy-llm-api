import startApi from './src/index.js';

const ollamaApi = startApi('ollama', {
  apiKey: '1234',
  host: 'http://localhost:11434',
  // headers
  // fetch
});

const openaiApi = startApi('openai', {
  apiKey: '1234',
  baseURL: 'http://localhost:11434/v1',
  // headers
  // fetch
}, {
  model: 'qwen3-vl',
});

const demo = async () => {
  const ollamaResult = await ollamaApi.generate('你好', {
    model: 'ministral3:14b-reasoning',
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

  const responsesResult = await openaiApi.responses('你是谁', {
    model: 'qwen3-vl',
    temperature: 0.15,
    stream: true,
    options: {
      top_k: 20,
    },
  }, (mesg, resp) => {
    console.log(mesg, resp);
  });
  console.log(responsesResult);
};

demo();
