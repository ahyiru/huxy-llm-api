# huxy-llm-api

一个简洁、易用的用于简化 Ollama 和 OpenAI API 调用的 Node.js 库。支持流式响应和自定义配置，适用于快速集成大语言模型服务。

## 特性

- **统一接口**：提供一致的 API 调用方式，支持 Ollama 和 OpenAI 两种服务
- **流式支持**：内置流式响应处理，支持实时回调
- **灵活配置**：支持自定义模型参数和 API 配置
- **错误处理**：内置参数验证和错误处理机制
- **多功能支持**：支持聊天、文本生成、响应处理等多种 AI 功能
- **自定义 Fetch**：使用 `Undici` 实现高性能 HTTP 请求

## 安装

```bash
npm install huxy-llm-api
# 或
pnpm add huxy-llm-api
# 或
yarn add huxy-llm-api
```

## 快速开始

### 基本用法

```javascript
import startApi from 'huxy-llm-api';

// 初始化 Ollama API
const ollamaApi = startApi('ollama', {
  apiKey: 'your-api-key',
  host: 'http://localhost:11434',
  // undici dispatcher
  dispatcher: {
    headersTimeout: 10 * 60 * 1000,
  },
}, {
  model: 'qwen3-vl:latest',
  options: {
    num_ctx: 4096,
  },
});

// 初始化 OpenAI API
const openaiApi = startApi('openai', {
  apiKey: 'your-api-key',
  baseURL: 'https://api.openai.com/v1',
});
```

### 调用示例

#### Ollama - 生成文本

```javascript
const result = await ollamaApi.generate('你好', {
  model: 'qwen3-vl',
  stream: false,
  options: {
    temperature: 0.15,
    top_p: 0.9,
  },
}, (message) => {
  console.log('实时响应:', message);
});

console.log('最终结果:', result);
```

#### OpenAI - 聊天对话

```javascript
const response = await openaiApi.chat('你是谁', {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  stream: true,
}, (message, rawResponse) => {
  console.log('实时消息:', message);
  console.log('原始响应:', rawResponse);
});

console.log('对话结果:', response);
```

## API 文档

### `startApi(apiType, userConfig, userOption)`

初始化 LLM API 客户端。

**参数:**

- `apiType`: `'ollama'` 或 `'openai'` - 指定要使用的 API 类型
- `userConfig`: 对象 - 自定义 API 接口配置，如 apiKey、baseURL、fetch 等
- `userOption`: 对象 - 通用模型参数配置

**返回:** API 客户端实例，包含以下方法：

### Ollama 方法

- `generate(prompt, configs, callback)`: 文本生成
- `chat(prompt, configs, callback)`: 聊天对话
- <del>`responses(prompt, configs, callback)`: 结构化响应</del>

### OpenAI 方法

- `chat(prompt, configs, callback)`: 聊天对话
- `responses(prompt, configs, callback)`: 结构化响应

### 通用参数

- `prompt`: 字符串或消息数组 - 输入提示
- `configs`: 对象 - 模型参数配置
  - `model`: 模型名称
  - `system`: 系统提示词
  - `stream`: 是否流式响应（默认: false）
  - `think`: 是否开启思考模式（需模型支持）（Boolean 或 'high | medium | low'。默认: false）
  - `options`: 其他模型参数（OpenAI 可使用 `extra_body`）[详细参数配置 parameter](https://docs.ollama.com/modelfile#parameter)
     - `temperature`: 生成温度（0-1）
     - `top_p`: 核采样概率
     - ...
- `callback`: 函数 - 流式响应回调

## 配置

### 默认配置

项目提供了默认配置，可以通过环境变量或参数覆盖：

**Ollama 默认配置:**

```javascript
{
  apiKey: process.env.OLLM_API_KEY || '1234',
  host: process.env.OLLM_API_HOST || 'http://localhost:11434',
  params: {
    // keep_alive: -1,
  },
  options: {
    // temperature: 0.6,
  }
}
```

**OpenAI 默认配置:**

```javascript
{
  apiKey: process.env.LLM_API_KEY || '1234',
  baseURL: process.env.LLM_API_BASEURL || 'http://localhost:11434/v1',
  params: {
    // temperature: 1,
  },
  options: {
    // thinking: true,
  }
}
```

### 环境变量

支持通过环境变量配置 API 密钥和地址：

```bash
# Ollama
export OLLM_API_KEY="your-key"
export OLLM_API_HOST="http://localhost:11434"

# OpenAI
export LLM_API_KEY="your-key"
export LLM_API_BASEURL="https://api.openai.com/v1"
```

## 示例

查看 [example.js](./example.js) 了解完整用法示例。

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License © [ahyiru](https://github.com/ahyiru)

## 联系

- GitHub: [https://github.com/ahyiru/huxy-llm-api](https://github.com/ahyiru/huxy-llm-api)
- Issues: [https://github.com/ahyiru/huxy-llm-api/issues](https://github.com/ahyiru/huxy-llm-api/issues)
