import {Ollama as H} from 'ollama';
import j from 'openai';
import {fetch as K, Agent as M} from 'undici';
var U = 300 * 60 * 1e3,
  E = (t, a) => K(t, {...a, dispatcher: new M({headersTimeout: U})}),
  R = E;
var T = {
    config: {apiKey: process.env.LLM_API_KEY || 'ah.yiru@gmail.com', baseURL: process.env.LLM_API_BASEURL || 'http://127.0.0.1:11434/v1', timeout: process.env.LLM_API_TIMEOUT || 108e5, maxRetries: 3},
    params: {model: 'qwen3-vl:latest', temperature: 1, max_tokens: 4096, top_p: 0.95},
    options: {top_k: 20, repeat_penalty: 1.05, thinking: !0},
  },
  P = T;
var b = {
    config: {apiKey: process.env.OLLM_API_KEY || 'ah.yiru@gmail.com', host: process.env.OLLM_API_HOST || 'http://127.0.0.1:11434'},
    params: {model: 'qwen3-vl:latest', keep_alive: -1},
    options: {temperature: 1, num_ctx: 4096, top_k: 20, top_p: 0.95, repeat_penalty: 1.05},
  },
  A = b;
var q = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  I = async (t, a, o) => {
    if (a) {
      let r = '',
        e = '';
      for await (let n of t) {
        let {type: s, delta: i} = n;
        (q.includes(s) && (e += i), s === 'response.output_text.delta' && (r += i), o?.({content: r, reasoning: e}, n));
      }
      return {content: r, reasoning: e};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  C = async (t, a, o) => {
    if (a) {
      let n = '',
        s = '';
      for await (let i of t) {
        let {delta: p} = i.choices?.[0] ?? {},
          {reasoning: l, content: u} = p ?? {};
        (l && (s += l), u && (n += u), o?.({content: n, reasoning: s}, i));
      }
      return {content: n, reasoning: s};
    }
    o?.(t);
    let {message: c} = t.choices?.[0] ?? {},
      {content: r, reasoning: e} = c;
    return {content: r, reasoning: e};
  };
var S = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  O = async (t, a, o) => {
    if (a) {
      let r = '',
        e = '';
      for await (let n of t) {
        let {type: s, delta: i} = n;
        (S.includes(s) && (e += i), s === 'response.output_text.delta' && (r += i), o?.({content: r, reasoning: e}, n));
      }
      return {content: r, reasoning: e};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  k = async (t, a, o) => {
    if (a) {
      let e = '',
        n = '';
      for await (let s of t) {
        let i = s.reasoning ?? s.thinking,
          p = s.content ?? s.response;
        (i && (n += i), p && (e += p), o?.({content: e, reasoning: n}, s));
      }
      return {content: e, reasoning: n};
    }
    o?.(t);
    let c = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: c};
  },
  v = async (t, a, o) => {
    if (a) {
      let n = '',
        s = '';
      for await (let i of t) {
        let {message: p} = i,
          l = p.reasoning ?? p.thinking,
          u = p.content ?? p.response;
        (l && (s += l), u && (n += u), o?.({content: n, reasoning: s}, i));
      }
      return {content: n, reasoning: s};
    }
    let {message: c} = t;
    o?.(t);
    let r = c.reasoning ?? c.thinking;
    return {content: c.content ?? c.response, reasoning: r};
  };
var B = (t, a = {}, o = 'chat') => {
  if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
  if (o === 'chat') {
    let r = Array.isArray(t) ? t : [{role: 'user', content: t}],
      {system: e, ...n} = a;
    return (e && (r = [{role: 'system', content: e}, ...r]), {messages: r, ...n});
  }
  if (o === 'responses') {
    let {instructions: r, system: e, ...n} = a;
    return (r || (n.instructions = e), {input: t, ...n});
  }
  return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...a};
};
var w =
  ({params: t, options: a} = {}, o) =>
  (c, r = {}, e) => {
    let {options: n, ...s} = r,
      i = B(c, {...t, ...s}, e),
      p = {...a, ...n};
    return (o === 'openai' ? (i.extra_body = p) : (i.options = p), i);
  };
var L = {
  openai: (t = {}, a = {}) => {
    let {config: o, params: c, options: r} = P,
      {host: e, baseURL: n, ...s} = t,
      i = new j({fetch: R, ...o, ...s, baseURL: e || n}),
      {options: p, extra_body: l, ...u} = a,
      h = {params: {...c, ...u}, options: {...r, ...l, ...p}},
      x = w(h, 'openai');
    return {
      chat: async (m, f = {}, g) => {
        let y = x(m, f, 'chat'),
          _ = C,
          d = await i.chat.completions.create(y);
        return _(d, y.stream, g);
      },
      responses: async (m, f = {}, g) => {
        let y = x(m, f, 'responses'),
          _ = I,
          d = await i.responses.create(y);
        return _(d, y.stream, g);
      },
    };
  },
  ollama: (t = {}, a = {}) => {
    let {config: o, params: c, options: r} = A,
      e = new H({fetch: R, ...o, ...t}),
      {options: n, extra_body: s, ...i} = a,
      p = {params: {...c, ...i}, options: {...r, ...s, ...n}},
      l = w(p, 'ollama');
    return {
      chat: async (u, h = {}, x) => {
        let m = l(u, h, 'chat'),
          f = v,
          g = await e.chat(m);
        return f(g, m.stream, x);
      },
      generate: async (u, h = {}, x) => {
        let m = l(u, h, 'generate'),
          f = k,
          g = await e.generate(m);
        return f(g, m.stream, x);
      },
      responses: async (u, h = {}, x) => {
        let m = l(u, h, 'responses'),
          f = O,
          g = await e.responses(m);
        return f(g, m.stream, x);
      },
    };
  },
};
var z = (t = 'ollama', a, o) => (L[t] ?? L.ollama)(a, o),
  ot = z;
export {ot as default, z as startApi};
