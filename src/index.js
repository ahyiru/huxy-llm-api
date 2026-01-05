import {Ollama as B} from 'ollama';
import H from 'openai';
import {fetch as K, Agent as M} from 'undici';
var U = 300 * 60 * 1e3,
  E = (t, r) => K(t, {...r, dispatcher: new M({headersTimeout: U})}),
  w = E;
var T = {
    config: {apiKey: process.env.LLM_API_KEY || 'ah.yiru@gmail.com', baseURL: process.env.LLM_API_BASEURL || 'http://127.0.0.1:11434/v1', timeout: process.env.LLM_API_TIMEOUT || 108e5, maxRetries: 3},
    params: {model: 'qwen3-vl:latest', temperature: 1, max_tokens: 4096, top_p: 0.95},
    options: {top_k: 20, repeat_penalty: 1.05, thinking: !0},
  },
  A = T;
var q = {
    config: {apiKey: process.env.OLLM_API_KEY || 'ah.yiru@gmail.com', host: process.env.OLLM_API_HOST || 'http://127.0.0.1:11434'},
    params: {model: 'qwen3-vl:latest', keep_alive: -1},
    options: {temperature: 1, num_ctx: 4096, top_k: 20, top_p: 0.95, repeat_penalty: 1.05},
  },
  I = q;
var F = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  C = async (t, r, o) => {
    if (r) {
      let s = '',
        n = '';
      for await (let e of t) {
        let {type: a, delta: c} = e;
        (F.includes(a) && (n += c), a === 'response.output_text.delta' && (s += c), o?.({content: s, reasoning: n}, e));
      }
      return {content: s, reasoning: n};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  P = async (t, r, o) => {
    if (r) {
      let e = '',
        a = '';
      for await (let c of t) {
        let {delta: p} = c.choices?.[0] ?? {},
          {reasoning: u, content: m} = p ?? {};
        (u && (a += u), m && (e += m), o?.({content: e, reasoning: a}, c));
      }
      return {content: e, reasoning: a};
    }
    o?.(t);
    let {message: i} = t.choices?.[0] ?? {},
      {content: s, reasoning: n} = i;
    return {content: s, reasoning: n};
  };
var Y = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  k = async (t, r, o) => {
    if (r) {
      let s = '',
        n = '';
      for await (let e of t) {
        let {type: a, delta: c} = e;
        (Y.includes(a) && (n += c), a === 'response.output_text.delta' && (s += c), o?.({content: s, reasoning: n}, e));
      }
      return {content: s, reasoning: n};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  v = async (t, r, o) => {
    if (r) {
      let n = '',
        e = '';
      for await (let a of t) {
        let c = a.reasoning ?? a.thinking,
          p = a.content ?? a.response;
        (c && (e += c), p && (n += p), o?.({content: n, reasoning: e}, a));
      }
      return {content: n, reasoning: e};
    }
    o?.(t);
    let i = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: i};
  },
  O = async (t, r, o) => {
    if (r) {
      let e = '',
        a = '';
      for await (let c of t) {
        let {message: p} = c,
          u = p.reasoning ?? p.thinking,
          m = p.content ?? p.response;
        (u && (a += u), m && (e += m), o?.({content: e, reasoning: a}, c));
      }
      return {content: e, reasoning: a};
    }
    let {message: i} = t;
    o?.(t);
    let s = i.reasoning ?? i.thinking;
    return {content: i.content ?? i.response, reasoning: s};
  };
var x = (t, r = {}, o = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (o === 'chat') {
      let s = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...e} = r;
      return (n && (s = [{role: 'system', content: n}, ...s]), {messages: s, ...e});
    }
    if (o === 'responses') {
      let {instructions: s, system: n, ...e} = r;
      return (s || (e.instructions = n), {input: t, ...e});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...r};
  },
  y = ({options: t, extra_body: r, ...o}, i = {}, s) => {
    let n = {...i.params, ...o},
      e = {...i.options, ...t};
    return (s === 'openai' ? (n.extra_body = {...e, ...r}) : (n.options = e), n);
  };
var L = {
  openai: (t, r) => {
    let {config: o, params: i, options: s} = A,
      {host: n, baseURL: e, ...a} = t,
      c = new H({fetch: w, ...o, ...a, baseURL: n || e}),
      {options: p, extra_body: u, ...m} = r,
      h = {...i, ...m, options: {...s, ...p, ...u}};
    return {
      chat: async (f, l = {}, g) => {
        let d = P,
          _ = x(f, l, 'chat'),
          R = await c.chat.completions.create(y(_, h, 'openai'));
        return d(R, _.stream, g);
      },
      responses: async (f, l = {}, g) => {
        let d = C,
          _ = x(f, l, 'responses'),
          R = await c.responses.create(y(_, h, 'openai'));
        return d(R, _.stream, g);
      },
    };
  },
  ollama: (t, r) => {
    let {config: o, params: i, options: s} = I,
      n = new B({fetch: w, ...o, ...t}),
      {options: e, extra_body: a, ...c} = r,
      p = {...i, ...c, options: {...s, ...e, ...a}};
    return {
      chat: async (u, m = {}, h) => {
        let f = O,
          l = x(u, m, 'chat'),
          g = await n.chat(y(l, p, 'ollama'));
        return f(g, l.stream, h);
      },
      generate: async (u, m = {}, h) => {
        let f = v,
          l = x(u, m, 'generate'),
          g = await n.generate(y(l, p, 'ollama'));
        return f(g, l.stream, h);
      },
      responses: async (u, m = {}, h) => {
        let f = k,
          l = x(u, m, 'responses'),
          g = await n.responses(y(l, p, 'ollama'));
        return f(g, l.stream, h);
      },
    };
  },
};
var j = (t = 'ollama', r, o) => (L[t] ?? L.ollama)(r, o),
  et = j;
export {et as default, j as startApi};
