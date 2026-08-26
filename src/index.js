var B = Object.defineProperty;
var U = (t, o) => {
  for (var e in o) B(t, e, {get: o[e], enumerable: !0});
};
import {Ollama as it} from 'ollama';
import ct from 'openai';
import {fetch as F, Agent as S} from 'undici';
var x = 72e5,
  z = {
    bodyTimeout: 0,
    headersTimeout: 0,
    connectTimeout: 6e4,
    keepAliveTimeout: x,
    keepAliveMaxTimeout: x,
    connections: 100,
    pipelining: 1,
  },
  N = t => ({timeout: x, maxRetries: 3, fetch: F, fetchOptions: {dispatcher: new S({...z, ...t})}}),
  _ = N;
var Y = {config: {apiKey: process.env.OLLM_API_KEY, host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  w = Y;
var H = {config: {apiKey: process.env.LLM_API_KEY, baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  R = H;
var V = ['temperature', 'seed', 'stop', 'top_p'],
  W = t => {
    let {max_tokens: o, options: e = {}, ...s} = t,
      {num_ctx: a, ...n} = e;
    return (
      (s.max_tokens = o ?? a),
      Object.keys(n).map(r => {
        V.includes(r) ? (s[r] = n[r]) : (s.extra_body || (s.extra_body = {}), (s.extra_body[r] = n[r]), delete s[r]);
      }),
      s
    );
  },
  q = t => {
    if (typeof t == 'string') return {input: t};
    let o = [],
      e;
    for (let s of t) {
      let {role: a, content: n} = s;
      if (n) {
        if (a === 'system') {
          e = n;
          continue;
        }
        if (s.type) {
          o.push(s);
          continue;
        }
        if (a === 'user') {
          o.push({type: 'message', role: 'user', content: [{type: 'input_text', text: n}]});
          continue;
        }
        if (a === 'assistant') {
          o.push({type: 'message', role: 'assistant', content: [{type: 'output_text', text: n}]});
          continue;
        }
      }
    }
    return {input: o, instructions: e};
  },
  D = (t, o = {}, e = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!o.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (e === 'chat') {
      let a = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...r} = o;
      return (n && (a = [{role: 'system', content: n}, ...a]), {messages: a, ...r});
    }
    if (e === 'responses') {
      let {instructions: a, system: n, ...r} = o,
        i = q(t);
      return ((r.instructions = i.instructions || a || n), {input: i.input, ...r});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...o};
  };
var A =
  ({params: t, options: o} = {}, e) =>
  (s, a = {}, n) => {
    let {options: r, extra_body: i, ...p} = a,
      c = D(s, {...t, ...p}, n);
    return ((c.options = {...o, ...i, ...r}), e === 'openai' ? W(c) : c);
  };
var G = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  I = async (t, o, e) => {
    if (o) {
      let a = '',
        n = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (G.includes(p) && ((n += c), e?.({content: a, reasoning: n}, i)),
          p === 'response.output_text.delta' && ((a += c), e?.({content: a, reasoning: n}, i)));
      }
      let r = {content: a, reasoning: n, done: !0};
      return (e?.(r), r);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  O = async (t, o, e) => {
    if (o) {
      let r = '',
        i = '';
      for await (let c of t) {
        let {delta: u} = c.choices?.[0] ?? {},
          {reasoning: f, content: m} = u ?? {};
        (f && ((i += f), e?.({content: r, reasoning: i}, c)), m && ((r += m), e?.({content: r, reasoning: i}, c)));
      }
      let p = {content: r, reasoning: i, done: !0};
      return (e?.(p), p);
    }
    e?.(t);
    let {message: s} = t.choices?.[0] ?? {},
      {content: a, reasoning: n} = s;
    return {content: a, reasoning: n};
  };
var h = {};
U(h, {chat: () => g, default: () => k, generate: () => X, image: () => Z, responses: () => d});
var Q = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  d = async (t, o, e) => {
    if (o) {
      let a = '',
        n = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (Q.includes(p) && ((n += c), e?.({content: a, reasoning: n}, i)),
          p === 'response.output_text.delta' && ((a += c), e?.({content: a, reasoning: n}, i)));
      }
      let r = {content: a, reasoning: n, done: !0};
      return (e?.(r), r);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  X = async (t, o, e) => {
    if (o) {
      let n = '',
        r = '';
      for await (let p of t) {
        let c = p.reasoning ?? p.thinking,
          u = p.content ?? p.response;
        (c && (r += c), u && (n += u), e?.({content: n, reasoning: r, flushContent: u}, p));
      }
      let i = {content: n, reasoning: r, done: !0};
      return (e?.(i), i);
    }
    e?.(t);
    let s = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: s};
  },
  Z = async (t, o, e) => {
    for await (let s of t) e?.(s);
  },
  g = async (t, o, e) => {
    if (o) {
      let r = '',
        i = '';
      for await (let c of t) {
        let {message: u} = c,
          f = u.reasoning ?? u.thinking,
          m = u.content ?? u.response;
        (f && ((i += f), e?.({content: r, reasoning: i}, c)), m && ((r += m), e?.({content: r, reasoning: i}, c)));
      }
      let p = {content: r, reasoning: i, done: !0};
      return (e?.(p), p);
    }
    let {message: s} = t;
    e?.(t);
    let a = s.reasoning ?? s.thinking;
    return {content: s.content ?? s.response, reasoning: a};
  },
  k = g;
import C from 'node:fs/promises';
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
  tt = t => Object.fromEntries(Object.entries(t).map(([o, e]) => [e, o])),
  v = tt(l);
var et = t => {
    let o = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(o);
    return e ? {ext: v[e[1]] ?? y, data: e[2]} : {ext: y, data: t};
  },
  nt = async (t, o = './images', e) => {
    try {
      await C.mkdir(o, {recursive: !0});
      let {ext: s, data: a} = et(t),
        n = `${o}/image_${e || Date.now()}${s}`;
      return (await C.writeFile(n, Buffer.from(a, 'base64')), n);
    } catch (s) {
      throw s;
    }
  },
  E = nt;
import {readFile as ot} from 'fs/promises';
import {extname as st} from 'path';
var rt = async (t, o = !1) => {
    try {
      let e = st(t).toLowerCase();
      if (!l[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let s = await ot(t, 'base64');
      return o ? `data:${l[e]};base64,${s}` : s;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  L = rt;
var at = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  P = {
    openai: (t, o) => ({
      chat: async (e, s = {}, a) => {
        let n = o(e, s, 'chat'),
          r = O,
          i = await t.chat.completions.create(n);
        return r(i, n.stream, a);
      },
      responses: async (e, s = {}, a) => {
        let n = o(e, s, 'responses'),
          r = I,
          i = await t.responses.create(n);
        return r(i, n.stream, a);
      },
    }),
    ollama: (t, o) => ({
      chat: async (e, s = {}, a) => {
        let n = o(e, s, 'chat'),
          r = g,
          i = await t.chat(n);
        return r(i, n.stream, a);
      },
      generate: async (e, s = {}, a) => {
        let n = o(e, s, 'generate'),
          r = h[at(n.model)],
          i = await t.generate(n);
        return r(i, n.stream, a);
      },
      responses: async (e, s = {}, a) => {
        let n = o(e, s, 'responses'),
          r = d,
          i = await t.responses(n);
        return r(i, n.stream, a);
      },
      saveImage: E,
      imageToBase64: L,
    }),
  };
var pt = {
    ollama: {
      hostKey: 'host',
      envConfig: w,
      API: ({apiKey: t, headers: o, ...e}) =>
        new it({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...o}, ...e}),
    },
    openai: {hostKey: 'baseURL', envConfig: R, API: t => new ct(t)},
  },
  ut = (t = 'ollama', o = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: s, envConfig: a, API: n} = pt[t],
      {config: r, params: i, options: p} = a,
      {baseURL: c, host: u, dispatcher: f, ...m} = {...r, ...o};
    if (((m[s] = u || c), !m[s])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let K = n({..._(f), ...m}),
      {options: T, extra_body: $, ...b} = e,
      M = {params: {...i, ...b}, options: {...p, ...$, ...T}},
      j = A(M, t);
    return P[t](K, j);
  },
  jt = ut;
export {jt as default, ut as startApi};
