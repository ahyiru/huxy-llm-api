import {Ollama as z} from 'ollama';
import D from 'openai';
import {fetch as v, Agent as b} from 'undici';
var E = 300 * 60 * 1e3,
  k = t => (c, o) => v(c, {...o, dispatcher: new b({headersTimeout: E, ...t})}),
  l = k;
var U = {config: {apiKey: process.env.OLLM_API_KEY || 'ollm_key', host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  g = U;
var M = {config: {apiKey: process.env.LLM_API_KEY || 'llm_key', baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  x = M;
var F = ['temperature', 'seed', 'stop', 'top_p'],
  S = t => {
    let {max_tokens: c, options: o = {}, ...r} = t,
      {num_ctx: s, ...n} = o;
    return (
      (r.max_tokens = c ?? s),
      Object.keys(n).map(e => {
        F.includes(e) ? (r[e] = n[e]) : (r.extra_body || (r.extra_body = {}), (r.extra_body[e] = n[e]));
      }),
      r
    );
  },
  Y = (t, c = {}, o = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!c.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (o === 'chat') {
      let s = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...e} = c;
      return (n && (s = [{role: 'system', content: n}, ...s]), {messages: s, ...e});
    }
    if (o === 'responses') {
      let {instructions: s, system: n, ...e} = c;
      return (s || (e.instructions = n), {input: t, ...e});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...c};
  };
var h =
  ({params: t, options: c} = {}, o) =>
  (r, s = {}, n) => {
    let {options: e, extra_body: a, ...i} = s,
      p = Y(r, {...t, ...i}, n);
    return ((p.options = {...c, ...a, ...e}), o === 'openai' ? S(p) : p);
  };
var j = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  y = async (t, c, o) => {
    if (c) {
      let s = '',
        n = '';
      for await (let e of t) {
        let {type: a, delta: i} = e;
        (j.includes(a) && (n += i), a === 'response.output_text.delta' && (s += i), o?.({content: s, reasoning: n}, e));
      }
      return {content: s, reasoning: n};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  d = async (t, c, o) => {
    if (c) {
      let e = '',
        a = '';
      for await (let i of t) {
        let {delta: p} = i.choices?.[0] ?? {},
          {reasoning: u, content: f} = p ?? {};
        (u && (a += u), f && (e += f), o?.({content: e, reasoning: a}, i));
      }
      return {content: e, reasoning: a};
    }
    o?.(t);
    let {message: r} = t.choices?.[0] ?? {},
      {content: s, reasoning: n} = r;
    return {content: s, reasoning: n};
  };
var H = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  _ = async (t, c, o) => {
    if (c) {
      let s = '',
        n = '';
      for await (let e of t) {
        let {type: a, delta: i} = e;
        (H.includes(a) && (n += i), a === 'response.output_text.delta' && (s += i), o?.({content: s, reasoning: n}, e));
      }
      return {content: s, reasoning: n};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  R = async (t, c, o) => {
    if (c) {
      let n = '',
        e = '';
      for await (let a of t) {
        let i = a.reasoning ?? a.thinking,
          p = a.content ?? a.response;
        (i && (e += i), p && (n += p), o?.({content: n, reasoning: e}, a));
      }
      return {content: n, reasoning: e};
    }
    o?.(t);
    let r = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: r};
  },
  A = async (t, c, o) => {
    if (c) {
      let e = '',
        a = '';
      for await (let i of t) {
        let {message: p} = i,
          u = p.reasoning ?? p.thinking,
          f = p.content ?? p.response;
        (u && (a += u), f && (e += f), o?.({content: e, reasoning: a}, i));
      }
      return {content: e, reasoning: a};
    }
    let {message: r} = t;
    o?.(t);
    let s = r.reasoning ?? r.thinking;
    return {content: r.content ?? r.response, reasoning: s};
  };
var w = {
  openai: (t, c) => ({
    chat: async (o, r = {}, s) => {
      let n = c(o, r, 'chat'),
        e = d,
        a = await t.chat.completions.create(n);
      return e(a, n.stream, s);
    },
    responses: async (o, r = {}, s) => {
      let n = c(o, r, 'responses'),
        e = y,
        a = await t.responses.create(n);
      return e(a, n.stream, s);
    },
  }),
  ollama: (t, c) => ({
    chat: async (o, r = {}, s) => {
      let n = c(o, r, 'chat'),
        e = A,
        a = await t.chat(n);
      return e(a, n.stream, s);
    },
    generate: async (o, r = {}, s) => {
      let n = c(o, r, 'generate'),
        e = R,
        a = await t.generate(n);
      return e(a, n.stream, s);
    },
    responses: async (o, r = {}, s) => {
      let n = c(o, r, 'responses'),
        e = _,
        a = await t.responses(n);
      return e(a, n.stream, s);
    },
  }),
};
var G = {ollama: {hostKey: 'host', envConfig: g, API: z}, openai: {hostKey: 'baseURL', envConfig: x, API: D}},
  J = (t = 'ollama', c = {}, o = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: r, envConfig: s, API: n} = G[t],
      {config: e, params: a, options: i} = s,
      {baseURL: p, host: u, dispatcher: f, ...m} = {...e, ...c};
    if (((m[r] = u || p), !m[r])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let I = new n({fetch: l(f), ...m}),
      {options: P, extra_body: C, ...L} = o,
      O = {params: {...a, ...L}, options: {...i, ...C, ...P}},
      K = h(O, t);
    return w[t](I, K);
  },
  rt = J;
export {rt as default, J as startApi};
