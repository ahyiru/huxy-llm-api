import {Ollama as T} from 'ollama';
import q from 'openai';
import {fetch as w, Agent as L} from 'undici';
var P = 300 * 60 * 1e3,
  k = (t, r) => w(t, {...r, dispatcher: new L({headersTimeout: P})}),
  y = k;
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
var K = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  _ = async (t, r, s) => {
    if (r) {
      let o = '',
        n = '';
      for await (let e of t) {
        let {type: i, delta: c} = e;
        (K.includes(i) && (n += c), i === 'response.output_text.delta' && (o += c), s?.({content: o, reasoning: n}, e));
      }
      return {content: o, reasoning: n};
    }
    return (s?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  d = async (t, r, s) => {
    if (r) {
      let e = '',
        i = '';
      for await (let c of t) {
        let {delta: p} = c.choices?.[0] ?? {},
          {reasoning: l, content: f} = p ?? {};
        (l && (i += l), f && (e += f), s?.({content: e, reasoning: i}, c));
      }
      return {content: e, reasoning: i};
    }
    s?.(t);
    let {message: a} = t.choices?.[0] ?? {},
      {content: o, reasoning: n} = a;
    return {content: o, reasoning: n};
  };
var O = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  R = async (t, r, s) => {
    if (r) {
      let o = '',
        n = '';
      for await (let e of t) {
        let {type: i, delta: c} = e;
        (O.includes(i) && (n += c), i === 'response.output_text.delta' && (o += c), s?.({content: o, reasoning: n}, e));
      }
      return {content: o, reasoning: n};
    }
    return (s?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  A = async (t, r, s) => {
    if (r) {
      let n = '',
        e = '';
      for await (let i of t) {
        let c = i.reasoning ?? i.thinking,
          p = i.content ?? i.response;
        (c && (e += c), p && (n += p), s?.({content: n, reasoning: e}, i));
      }
      return {content: n, reasoning: e};
    }
    s?.(t);
    let a = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: a};
  },
  I = async (t, r, s) => {
    if (r) {
      let e = '',
        i = '';
      for await (let c of t) {
        let {message: p} = c,
          l = p.reasoning ?? p.thinking,
          f = p.content ?? p.response;
        (l && (i += l), f && (e += f), s?.({content: e, reasoning: i}, c));
      }
      return {content: e, reasoning: i};
    }
    let {message: a} = t;
    s?.(t);
    let o = a.reasoning ?? a.thinking;
    return {content: a.content ?? a.response, reasoning: o};
  };
var u = (t, r = {}, s = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (s === 'chat') {
      let o = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...e} = r;
      return (n && (o = [{role: 'system', content: n}, ...o]), {messages: o, ...e});
    }
    if (s === 'responses') {
      let {instructions: o, system: n, ...e} = r;
      return (o || (e.instructions = n), {input: t, ...e});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...r};
  },
  m = ({options: t, extra_body: r, ...s}, a, o) => {
    let n = {...a.params, ...s},
      e = {...a.options, ...t};
    return (o === 'openai' ? (n.extra_body = {...e, ...r}) : (n.options = e), n);
  };
var x = {
  openai: {
    API: t => new q({...t, fetch: y}),
    config: h,
    llm: t => ({
      chat: async (r, s = {}, a) => {
        let o = d,
          n = u(r, s, 'chat'),
          e = await t.chat.completions.create(m(n, h, 'openai'));
        return o(e, n.stream, a);
      },
      responses: async (r, s = {}, a) => {
        let o = _,
          n = u(r, s, 'responses'),
          e = await t.responses.create(m(n, h, 'openai'));
        return o(e, n.stream, a);
      },
    }),
  },
  ollama: {
    API: t => new T({...t, fetch: y}),
    config: g,
    llm: t => ({
      chat: async (r, s = {}, a) => {
        let o = I,
          n = u(r, s, 'chat'),
          e = await t.chat(m(n, g, 'ollama'));
        return o(e, n.stream, a);
      },
      generate: async (r, s = {}, a) => {
        let o = A,
          n = u(r, s, 'generate'),
          e = await t.generate(m(n, g, 'ollama'));
        return o(e, n.stream, a);
      },
      responses: async (r, s = {}, a) => {
        let o = R,
          n = u(r, s, 'responses'),
          e = await t.responses(m(n, g, 'ollama'));
        return o(e, n.stream, a);
      },
    }),
  },
};
var U = (t = 'ollama', r) => {
    let s = x[t] ?? x.ollama,
      {API: a, config: o, llm: n} = s,
      e = a({...o.config, ...r});
    return n(e);
  },
  W = U;
export {W as default, U as startApi};
