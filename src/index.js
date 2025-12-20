import {Ollama as T} from 'ollama';
import E from 'openai';
import {fetch as I, Agent as L} from 'undici';
var P = 300 * 60 * 1e3,
  k = (t, a) => I(t, {...a, dispatcher: new L({headersTimeout: P})}),
  x = k;
var v = {
    config: {
      apiKey: process.env.LLM_API_KEY || 'ah.yiru@gmail.com',
      baseURL: process.env.LLM_API_BASEURL || 'http://192.168.0.111:11434/v1',
      timeout: process.env.LLM_API_TIMEOUT || 108e5,
      maxRetries: 3,
    },
    params: {model: 'qwen3-vl:latest', temperature: 0.15, max_tokens: 4096, top_p: 0.9, presence_penalty: 0.5, frequency_penalty: 0.5},
    options: {top_k: 20, repeat_penalty: 1.15, thinking: !0},
  },
  h = v;
var C = {
    config: {apiKey: process.env.OLLM_API_KEY || 'ah.yiru@gmail.com', host: process.env.OLLM_API_HOST || 'http://192.168.0.111:11434'},
    params: {model: 'qwen3-vl:latest', keep_alive: -1},
    options: {temperature: 0.6, num_ctx: 4096, top_k: 20, top_p: 0.9, repeat_penalty: 1.15},
  },
  g = C;
var _ = async (t, a, o) => {
    if (a) {
      let r = '',
        e = '';
      for await (let n of t) {
        let {type: c, delta: i} = n;
        (c === 'response.reasoning_text.delta' && (e += i), c === 'response.output_text.delta' && (r += i), o?.({content: r, reasoning: e}, n));
      }
      return {content: r, reasoning: e};
    }
    let [s = {}] = t.output ?? [];
    return (o?.(t), {reasoning: s.content?.[0]?.text, content: t.output_text});
  },
  R = async (t, a, o) => {
    if (a) {
      let n = '',
        c = '';
      for await (let i of t) {
        let {delta: p} = i.choices?.[0] ?? {},
          {reasoning: u, content: f} = p ?? {};
        (u && (c += u), f && (n += f), o?.({content: n, reasoning: c}, i));
      }
      return {content: n, reasoning: c};
    }
    let {message: s} = t.choices?.[0] ?? {},
      {content: r, reasoning: e} = s;
    return (o?.(t), {content: r, reasoning: e});
  };
var d = async (t, a, o) => {
    if (a) {
      let r = '',
        e = '';
      for await (let n of t) {
        let {type: c, delta: i} = n;
        (c === 'response.reasoning_text.delta' && (e += i), c === 'response.output_text.delta' && (r += i), o?.({content: r, reasoning: e}, n));
      }
      return {content: r, reasoning: e};
    }
    let [s = {}] = t.output ?? [];
    return (o?.(t), {reasoning: s.content?.[0]?.text, content: t.output_text});
  },
  A = async (t, a, o) => {
    if (a) {
      let e = '',
        n = '';
      for await (let c of t) {
        let i = c.reasoning ?? c.thinking,
          p = c.content ?? c.response;
        (i && (n += i), p && (e += p), o?.({content: e, reasoning: n}, c));
      }
      return {content: e, reasoning: n};
    }
    let s = t.reasoning ?? t.thinking,
      r = t.content ?? t.response;
    return (o?.(t), {content: r, reasoning: s});
  },
  w = async (t, a, o) => {
    if (a) {
      let n = '',
        c = '';
      for await (let i of t) {
        let {message: p} = i,
          u = p.reasoning ?? p.thinking,
          f = p.content ?? p.response;
        (u && (c += u), f && (n += f), o?.({content: n, reasoning: c}, i));
      }
      return {content: n, reasoning: c};
    }
    let {message: s} = t,
      r = s.reasoning ?? s.thinking,
      e = s.content ?? s.response;
    return (o?.(t), {content: e, reasoning: r});
  };
var m = (t, a = {}, o = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (o === 'chat') {
      let n = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: c, ...i} = a;
      return (c && (n = [{role: 'system', content: c}, ...n]), {messages: n, ...i});
    }
    let s = Array.isArray(t) ? t.slice(-1)[0]?.content : t,
      {instructions: r, ...e} = a;
    return (r || (e.instructions = e.system), {prompt: s, ...e});
  },
  l = ({options: t, extra_body: a, ...o}, s, r) => {
    let e = {...s.params, ...o},
      n = {...s.options, ...t};
    return (r === 'openai' ? (e.extra_body = {...n, ...a}) : (e.options = n), e);
  };
var y = {
  openai: {
    API: t => new E({...t, fetch: x}),
    config: h,
    llm: t => ({
      chat: async (a, o = {}, s) => {
        let r = R,
          e = m(a, o, 'chat'),
          n = await t.chat.completions.create(l(e, h, 'openai'));
        return r(n, e.stream, s);
      },
      responses: async (a, o = {}, s) => {
        let r = _,
          e = m(a, o, 'responses'),
          n = await t.responses.create(l(e, h, 'openai'));
        return r(n, e.stream, s);
      },
    }),
  },
  ollama: {
    API: t => new T({...t, fetch: x}),
    config: g,
    llm: t => ({
      chat: async (a, o = {}, s) => {
        let r = w,
          e = m(a, o, 'chat'),
          n = await t.chat(l(e, g, 'ollama'));
        return r(n, e.stream, s);
      },
      generate: async (a, o = {}, s) => {
        let r = A,
          e = m(a, o, 'generate'),
          n = await t.generate(l(e, g, 'ollama'));
        return r(n, e.stream, s);
      },
      responses: async (a, o = {}, s) => {
        let r = d,
          e = m(a, o, 'responses'),
          n = await t.responses(l(e, g, 'ollama'));
        return r(n, e.stream, s);
      },
    }),
  },
};
var K = (t = 'ollama', a) => {
    let o = y[t] ?? y.ollama,
      {API: s, config: r, llm: e} = o,
      n = s({...r.config, ...a});
    return e(n);
  },
  Q = K;
export {Q as default, K as startApi};
