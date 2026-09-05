var B = Object.defineProperty;
var U = (t, n) => {
  for (var e in n) B(t, e, {get: n[e], enumerable: !0});
};
import {Ollama as it} from 'ollama';
import ct from 'openai';
import {fetch as F, Agent as S} from 'undici';
var x = 72e5,
  z = {
    bodyTimeout: 0,
    headersTimeout: 0,
    keepAliveTimeout: x,
    keepAliveMaxTimeout: x,
    connectTimeout: 6e4,
    connections: 100,
    pipelining: 1,
  },
  N = t => ({timeout: x, maxRetries: 3, fetch: F, fetchOptions: {dispatcher: new S({...z, ...t})}}),
  _ = N;
var Y = {config: {apiKey: process.env.OLLM_API_KEY, host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  w = Y;
var q = {config: {apiKey: process.env.LLM_API_KEY, baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  R = q;
var H = ['temperature', 'seed', 'stop', 'top_p', 'max_tokens', 'frequency_penalty', 'presence_penalty'],
  V = t => {
    let {options: n = {}, ...e} = t;
    return (
      Object.keys(n).map(s => {
        H.includes(s) ? (e[s] = n[s]) : (e.extra_body || (e.extra_body = {}), (e.extra_body[s] = n[s]), delete e[s]);
      }),
      e
    );
  },
  W = t => {
    if (typeof t == 'string') return {input: t};
    let n = [],
      e;
    for (let s of t) {
      let {role: r, content: o} = s;
      if (o) {
        if (r === 'system') {
          e = o;
          continue;
        }
        if (s.type) {
          n.push(s);
          continue;
        }
        if (r === 'user') {
          n.push({type: 'message', role: 'user', content: [{type: 'input_text', text: o}]});
          continue;
        }
        if (r === 'assistant') {
          n.push({type: 'message', role: 'assistant', content: [{type: 'output_text', text: o}]});
          continue;
        }
      }
    }
    return {input: n, instructions: e};
  },
  D = (t, n = {}, e = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!n.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (e === 'chat') {
      let r = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: o, ...a} = n;
      return (o && (r = [{role: 'system', content: o}, ...r]), {messages: r, ...a});
    }
    if (e === 'responses') {
      let {instructions: r, system: o, ...a} = n,
        i = W(t);
      return ((a.instructions = i.instructions || r || o), {input: i.input, ...a});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...n};
  };
var A =
  ({params: t, options: n} = {}, e) =>
  (s, r = {}, o) => {
    let {options: a, extra_body: i, ...p} = r,
      c = D(s, {...t, ...p}, o);
    return ((c.options = {...n, ...i, ...a}), e === 'openai' ? V(c) : c);
  };
var G = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  I = async (t, n, e) => {
    if (n) {
      let r = '',
        o = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (G.includes(p) && ((o += c), e?.({content: r, reasoning: o}, i)),
          p === 'response.output_text.delta' && ((r += c), e?.({content: r, reasoning: o}, i)));
      }
      let a = {content: r, reasoning: o, done: !0};
      return (e?.(a), a);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  v = async (t, n, e) => {
    if (n) {
      let a = '',
        i = '';
      for await (let c of t) {
        let {delta: u} = c.choices?.[0] ?? {},
          {reasoning: f, content: m} = u ?? {};
        (f && ((i += f), e?.({content: a, reasoning: i}, c)), m && ((a += m), e?.({content: a, reasoning: i}, c)));
      }
      let p = {content: a, reasoning: i, done: !0};
      return (e?.(p), p);
    }
    e?.(t);
    let {message: s} = t.choices?.[0] ?? {},
      {content: r, reasoning: o} = s;
    return {content: r, reasoning: o};
  };
var h = {};
U(h, {chat: () => g, default: () => k, generate: () => X, image: () => Z, responses: () => d});
var Q = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  d = async (t, n, e) => {
    if (n) {
      let r = '',
        o = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (Q.includes(p) && ((o += c), e?.({content: r, reasoning: o}, i)),
          p === 'response.output_text.delta' && ((r += c), e?.({content: r, reasoning: o}, i)));
      }
      let a = {content: r, reasoning: o, done: !0};
      return (e?.(a), a);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  X = async (t, n, e) => {
    if (n) {
      let o = '',
        a = '';
      for await (let p of t) {
        let c = p.reasoning ?? p.thinking,
          u = p.content ?? p.response;
        (c && (a += c), u && (o += u), e?.({content: o, reasoning: a, flushContent: u}, p));
      }
      let i = {content: o, reasoning: a, done: !0};
      return (e?.(i), i);
    }
    e?.(t);
    let s = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: s};
  },
  Z = async (t, n, e) => {
    for await (let s of t) e?.(s);
  },
  g = async (t, n, e) => {
    if (n) {
      let a = '',
        i = '';
      for await (let c of t) {
        let {message: u} = c,
          f = u.reasoning ?? u.thinking,
          m = u.content ?? u.response;
        (f && ((i += f), e?.({content: a, reasoning: i}, c)), m && ((a += m), e?.({content: a, reasoning: i}, c)));
      }
      let p = {content: a, reasoning: i, done: !0};
      return (e?.(p), p);
    }
    let {message: s} = t;
    e?.(t);
    let r = s.reasoning ?? s.thinking;
    return {content: s.content ?? s.response, reasoning: r};
  },
  k = g;
import O from 'node:fs/promises';
var l = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
  },
  y = '.png',
  tt = t => Object.fromEntries(Object.entries(t).map(([n, e]) => [e, n])),
  C = tt(l);
var et = t => {
    let n = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(n);
    return e ? {ext: C[e[1]] ?? y, data: e[2]} : {ext: y, data: t};
  },
  nt = async (t, n = './images', e) => {
    try {
      await O.mkdir(n, {recursive: !0});
      let {ext: s, data: r} = et(t),
        o = `${n}/image_${e || Date.now()}${s}`;
      return (await O.writeFile(o, Buffer.from(r, 'base64')), o);
    } catch (s) {
      throw s;
    }
  },
  E = nt;
import {readFile as ot} from 'fs/promises';
import {extname as st} from 'path';
var rt = async (t, n = !1) => {
    try {
      let e = st(t).toLowerCase();
      if (!l[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let s = await ot(t, 'base64');
      return n ? `data:${l[e]};base64,${s}` : s;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  L = rt;
var at = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  P = {
    openai: (t, n) => ({
      chat: async (e, s = {}, r) => {
        let o = n(e, s, 'chat'),
          a = v,
          i = await t.chat.completions.create(o);
        return a(i, o.stream, r);
      },
      responses: async (e, s = {}, r) => {
        let o = n(e, s, 'responses'),
          a = I,
          i = await t.responses.create(o);
        return a(i, o.stream, r);
      },
    }),
    ollama: (t, n) => ({
      chat: async (e, s = {}, r) => {
        let o = n(e, s, 'chat'),
          a = g,
          i = await t.chat(o);
        return a(i, o.stream, r);
      },
      generate: async (e, s = {}, r) => {
        let o = n(e, s, 'generate'),
          a = h[at(o.model)],
          i = await t.generate(o);
        return a(i, o.stream, r);
      },
      responses: async (e, s = {}, r) => {
        let o = n(e, s, 'responses'),
          a = d,
          i = await t.responses(o);
        return a(i, o.stream, r);
      },
      saveImage: E,
      imageToBase64: L,
    }),
  };
var pt = {
    ollama: {
      hostKey: 'host',
      envConfig: w,
      API: ({apiKey: t, headers: n, ...e}) =>
        new it({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...n}, ...e}),
    },
    openai: {hostKey: 'baseURL', envConfig: R, API: t => new ct(t)},
  },
  ut = (t = 'ollama', n = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: s, envConfig: r, API: o} = pt[t],
      {config: a, params: i, options: p} = r,
      {baseURL: c, host: u, dispatcher: f, ...m} = {...a, ...n};
    if (((m[s] = u || c), !m[s])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let K = o({..._(f), ...m}),
      {options: T, extra_body: $, ...b} = e,
      M = {params: {...i, ...b}, options: {...p, ...$, ...T}},
      j = A(M, t);
    return P[t](K, j);
  },
  jt = ut;
export {jt as default, ut as startApi};
