var B = Object.defineProperty;
var U = (t, n) => {
  for (var e in n) B(t, e, {get: n[e], enumerable: !0});
};
import {Ollama as at} from 'ollama';
import it from 'openai';
import {fetch as b, Agent as F} from 'undici';
var S = 18e6,
  z = {bodyTimeout: 0, headersTimeout: 0, keepAliveTimeout: 9e4, connectTimeout: 6e4},
  N = ({timeout: t, ...n} = {}) => ({
    timeout: t || S,
    maxRetries: 0,
    fetch: b,
    fetchOptions: {dispatcher: new F({...z, ...n})},
  }),
  y = N;
var Y = {config: {apiKey: process.env.OLLM_API_KEY, host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  _ = Y;
var q = {config: {apiKey: process.env.LLM_API_KEY, baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  w = q;
var H = t => {
    let {options: n = {}, ...e} = t;
    return (
      Object.keys(n).map(s => {
        e[s] = n[s];
      }),
      e
    );
  },
  V = t => {
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
  W = (t, n = {}, e = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!n.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (e === 'chat') {
      let r = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: o, ...a} = n;
      return (o && (r = [{role: 'system', content: o}, ...r]), {messages: r, ...a});
    }
    if (e === 'responses') {
      let {instructions: r, system: o, ...a} = n,
        i = V(t);
      return ((a.instructions = i.instructions || r || o), {input: i.input, ...a});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...n};
  };
var R =
  ({params: t, options: n} = {}, e) =>
  (s, r = {}, o) => {
    let {options: a, extra_body: i, ...p} = r,
      c = W(s, {...t, ...p}, o);
    return ((c.options = {...n, ...i, ...a}), e === 'openai' ? H(c) : c);
  };
var D = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  A = async (t, n, e) => {
    if (n) {
      let r = '',
        o = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (D.includes(p) && ((o += c), e?.({content: r, reasoning: o}, i)),
          p === 'response.output_text.delta' && ((r += c), e?.({content: r, reasoning: o}, i)));
      }
      let a = {content: r, reasoning: o, done: !0};
      return (e?.(a), a);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  I = async (t, n, e) => {
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
U(h, {chat: () => g, default: () => Z, generate: () => Q, image: () => X, responses: () => x});
var J = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  x = async (t, n, e) => {
    if (n) {
      let r = '',
        o = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (J.includes(p) && ((o += c), e?.({content: r, reasoning: o}, i)),
          p === 'response.output_text.delta' && ((r += c), e?.({content: r, reasoning: o}, i)));
      }
      let a = {content: r, reasoning: o, done: !0};
      return (e?.(a), a);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  Q = async (t, n, e) => {
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
  X = async (t, n, e) => {
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
  Z = g;
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
  d = '.png',
  k = t => Object.fromEntries(Object.entries(t).map(([n, e]) => [e, n])),
  C = k(l);
var tt = t => {
    let n = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(n);
    return e ? {ext: C[e[1]] ?? d, data: e[2]} : {ext: d, data: t};
  },
  et = async (t, n = './images', e) => {
    try {
      await O.mkdir(n, {recursive: !0});
      let {ext: s, data: r} = tt(t),
        o = `${n}/image_${e || Date.now()}${s}`;
      return (await O.writeFile(o, Buffer.from(r, 'base64')), o);
    } catch (s) {
      throw s;
    }
  },
  v = et;
import {readFile as nt} from 'fs/promises';
import {extname as ot} from 'path';
var st = async (t, n = !1) => {
    try {
      let e = ot(t).toLowerCase();
      if (!l[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let s = await nt(t, 'base64');
      return n ? `data:${l[e]};base64,${s}` : s;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  E = st;
var rt = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  L = {
    openai: (t, n) => ({
      chat: async (e, s = {}, r) => {
        let o = n(e, s, 'chat'),
          a = I,
          i = await t.chat.completions.create(o);
        return a(i, o.stream, r);
      },
      responses: async (e, s = {}, r) => {
        let o = n(e, s, 'responses'),
          a = A,
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
          a = h[rt(o.model)],
          i = await t.generate(o);
        return a(i, o.stream, r);
      },
      responses: async (e, s = {}, r) => {
        let o = n(e, s, 'responses'),
          a = x,
          i = await t.responses(o);
        return a(i, o.stream, r);
      },
      saveImage: v,
      imageToBase64: E,
    }),
  };
var ct = {
    ollama: {
      hostKey: 'host',
      envConfig: _,
      API: ({apiKey: t, headers: n, ...e}) =>
        new at({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...n}, ...e}),
    },
    openai: {hostKey: 'baseURL', envConfig: w, API: t => new it(t)},
  },
  pt = (t = 'ollama', n = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: s, envConfig: r, API: o} = ct[t],
      {config: a, params: i, options: p} = r,
      {baseURL: c, host: u, dispatcher: f, ...m} = {...a, ...n};
    if (((m[s] = u || c), !m[s])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let P = o({...y(f), ...m}),
      {options: K, extra_body: T, ...$} = e,
      j = {params: {...i, ...$}, options: {...p, ...T, ...K}},
      M = R(j, t);
    return L[t](P, M);
  },
  Mt = pt;
export {Mt as default, pt as startApi};
