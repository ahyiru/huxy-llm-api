var T = Object.defineProperty;
var M = (t, o) => {
  for (var e in o) T(t, e, {get: o[e], enumerable: !0});
};
import {Ollama as at} from 'ollama';
import it from 'openai';
import {fetch as U, Agent as F, setGlobalDispatcher as z} from 'undici';
var N = t => (o, e) => {
    let s = new F({headersTimeout: 0, bodyTimeout: 0, connectTimeout: 6e4, ...t});
    return (z(s), U(o, e));
  },
  y = N;
var S = {config: {apiKey: process.env.OLLM_API_KEY, host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  w = S;
var Y = {config: {apiKey: process.env.LLM_API_KEY, baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  _ = Y;
var D = ['temperature', 'seed', 'stop', 'top_p'],
  G = t => {
    let {max_tokens: o, options: e = {}, ...s} = t,
      {num_ctx: a, ...n} = e;
    return (
      (s.max_tokens = o ?? a),
      Object.keys(n).map(r => {
        D.includes(r) ? (s[r] = n[r]) : (s.extra_body || (s.extra_body = {}), (s.extra_body[r] = n[r]), delete s[r]);
      }),
      s
    );
  },
  H = t => {
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
  V = (t, o = {}, e = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!o.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (e === 'chat') {
      let a = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...r} = o;
      return (n && (a = [{role: 'system', content: n}, ...a]), {messages: a, ...r});
    }
    if (e === 'responses') {
      let {instructions: a, system: n, ...r} = o,
        i = H(t);
      return ((r.instructions = i.instructions || a || n), {input: i.input, ...r});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...o};
  };
var R =
  ({params: t, options: o} = {}, e) =>
  (s, a = {}, n) => {
    let {options: r, extra_body: i, ...p} = a,
      c = V(s, {...t, ...p}, n);
    return ((c.options = {...o, ...i, ...r}), e === 'openai' ? G(c) : c);
  };
var W = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  A = async (t, o, e) => {
    if (o) {
      let a = '',
        n = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (W.includes(p) && ((n += c), e?.({content: a, reasoning: n}, i)),
          p === 'response.output_text.delta' && ((a += c), e?.({content: a, reasoning: n}, i)));
      }
      let r = {content: a, reasoning: n, done: !0};
      return (e?.(r), r);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  I = async (t, o, e) => {
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
var d = {};
M(d, {chat: () => g, default: () => Z, generate: () => Q, image: () => X, responses: () => l});
var J = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  l = async (t, o, e) => {
    if (o) {
      let a = '',
        n = '';
      for await (let i of t) {
        let {type: p, delta: c} = i;
        (J.includes(p) && ((n += c), e?.({content: a, reasoning: n}, i)),
          p === 'response.output_text.delta' && ((a += c), e?.({content: a, reasoning: n}, i)));
      }
      let r = {content: a, reasoning: n, done: !0};
      return (e?.(r), r);
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  Q = async (t, o, e) => {
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
  X = async (t, o, e) => {
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
  Z = g;
import L from 'node:fs/promises';
var x = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
  },
  h = '.png',
  k = t => Object.fromEntries(Object.entries(t).map(([o, e]) => [e, o])),
  C = k(x);
var tt = t => {
    let o = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(o);
    return e ? {ext: C[e[1]] ?? h, data: e[2]} : {ext: h, data: t};
  },
  et = async (t, o = './images', e) => {
    try {
      await L.mkdir(o, {recursive: !0});
      let {ext: s, data: a} = tt(t),
        n = `${o}/image_${e || Date.now()}${s}`;
      return (await L.writeFile(n, Buffer.from(a, 'base64')), n);
    } catch (s) {
      throw s;
    }
  },
  O = et;
import {readFile as nt} from 'fs/promises';
import {extname as ot} from 'path';
var st = async (t, o = !1) => {
    try {
      let e = ot(t).toLowerCase();
      if (!x[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let s = await nt(t, 'base64');
      return o ? `data:${x[e]};base64,${s}` : s;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  P = st;
var rt = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  v = {
    openai: (t, o) => ({
      chat: async (e, s = {}, a) => {
        let n = o(e, s, 'chat'),
          r = I,
          i = await t.chat.completions.create(n);
        return r(i, n.stream, a);
      },
      responses: async (e, s = {}, a) => {
        let n = o(e, s, 'responses'),
          r = A,
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
          r = d[rt(n.model)],
          i = await t.generate(n);
        return r(i, n.stream, a);
      },
      responses: async (e, s = {}, a) => {
        let n = o(e, s, 'responses'),
          r = l,
          i = await t.responses(n);
        return r(i, n.stream, a);
      },
      saveImage: O,
      imageToBase64: P,
    }),
  };
var ct = {
    ollama: {
      hostKey: 'host',
      envConfig: w,
      API: ({apiKey: t, headers: o, ...e}) =>
        new at({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...o}, ...e}),
    },
    openai: {hostKey: 'baseURL', envConfig: _, API: t => new it(t)},
  },
  pt = (t = 'ollama', o = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: s, envConfig: a, API: n} = ct[t],
      {config: r, params: i, options: p} = a,
      {baseURL: c, host: u, dispatcher: f, ...m} = {...r, ...o};
    if (((m[s] = u || c), !m[s])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let E = n({fetch: y(f), ...m}),
      {options: K, extra_body: b, ...$} = e,
      j = {params: {...i, ...$}, options: {...p, ...b, ...K}},
      B = R(j, t);
    return v[t](E, B);
  },
  Bt = pt;
export {Bt as default, pt as startApi};
