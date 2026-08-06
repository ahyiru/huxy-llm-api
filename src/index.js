var U = Object.defineProperty;
var F = (t, s) => {
  for (var e in s) U(t, e, {get: s[e], enumerable: !0});
};
import {Ollama as rt} from 'ollama';
import at from 'openai';
import {fetch as M, Agent as T} from 'undici';
var k = 3600 * 1e3,
  z = t => (s, e) => M(s, {...e, dispatcher: new T({headersTimeout: k, ...t})}),
  y = z;
var N = {
    config: {apiKey: process.env.OLLM_API_KEY || 'ollm_key', host: process.env.OLLM_API_HOST},
    params: {},
    options: {},
  },
  w = N;
var S = {
    config: {apiKey: process.env.LLM_API_KEY || 'llm_key', baseURL: process.env.LLM_API_BASEURL},
    params: {},
    options: {},
  },
  _ = S;
var Y = ['temperature', 'seed', 'stop', 'top_p'],
  H = t => {
    let {max_tokens: s, options: e = {}, ...r} = t,
      {num_ctx: a, ...n} = e;
    return (
      (r.max_tokens = s ?? a),
      Object.keys(n).map(o => {
        Y.includes(o) ? (r[o] = n[o]) : (r.extra_body || (r.extra_body = {}), (r.extra_body[o] = n[o]), delete r[o]);
      }),
      r
    );
  },
  V = (t, s = {}, e = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!s.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (e === 'chat') {
      let a = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...o} = s;
      return (n && (a = [{role: 'system', content: n}, ...a]), {messages: a, ...o});
    }
    if (e === 'responses') {
      let {instructions: a, system: n, ...o} = s;
      return (a || (o.instructions = n), {input: t, ...o});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...s};
  };
var R =
  ({params: t, options: s} = {}, e) =>
  (r, a = {}, n) => {
    let {options: o, extra_body: i, ...c} = a,
      p = V(r, {...t, ...c}, n);
    return ((p.options = {...s, ...i, ...o}), e === 'openai' ? H(p) : p);
  };
var W = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  A = async (t, s, e) => {
    if (s) {
      let a = '',
        n = '';
      for await (let o of t) {
        let {type: i, delta: c} = o;
        (W.includes(i) && ((n += c), e?.({content: a, reasoning: n}, o)),
          i === 'response.output_text.delta' && ((a += c), e?.({content: a, reasoning: n}, o)));
      }
      return {content: a, reasoning: n};
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  I = async (t, s, e) => {
    if (s) {
      let o = '',
        i = '';
      for await (let c of t) {
        let {delta: p} = c.choices?.[0] ?? {},
          {reasoning: m, content: f} = p ?? {};
        (m && ((i += m), e?.({content: o, reasoning: i}, c)), f && ((o += f), e?.({content: o, reasoning: i}, c)));
      }
      return {content: o, reasoning: i};
    }
    e?.(t);
    let {message: r} = t.choices?.[0] ?? {},
      {content: a, reasoning: n} = r;
    return {content: a, reasoning: n};
  };
var d = {};
F(d, {chat: () => u, default: () => Q, generate: () => G, image: () => J, responses: () => x});
var D = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  x = async (t, s, e) => {
    if (s) {
      let a = '',
        n = '';
      for await (let o of t) {
        let {type: i, delta: c} = o;
        (D.includes(i) && ((n += c), e?.({content: a, reasoning: n}, o)),
          i === 'response.output_text.delta' && ((a += c), e?.({content: a, reasoning: n}, o)));
      }
      return {content: a, reasoning: n};
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  G = async (t, s, e) => {
    if (s) {
      let n = '',
        o = '';
      for await (let i of t) {
        let c = i.reasoning ?? i.thinking,
          p = i.content ?? i.response;
        (c && (o += c), p && (n += p), e?.({content: n, reasoning: o, flushContent: p}, i));
      }
      return {content: n, reasoning: o};
    }
    e?.(t);
    let r = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: r};
  },
  J = async (t, s, e) => {
    for await (let r of t) e?.(r);
  },
  u = async (t, s, e) => {
    if (s) {
      let o = '',
        i = '';
      for await (let c of t) {
        let {message: p} = c,
          m = p.reasoning ?? p.thinking,
          f = p.content ?? p.response;
        (m && ((i += m), e?.({content: o, reasoning: i}, c)), f && ((o += f), e?.({content: o, reasoning: i}, c)));
      }
      return {content: o, reasoning: i};
    }
    let {message: r} = t;
    e?.(t);
    let a = r.reasoning ?? r.thinking;
    return {content: r.content ?? r.response, reasoning: a};
  },
  Q = u;
import L from 'node:fs/promises';
var g = {
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
  X = t => Object.fromEntries(Object.entries(t).map(([s, e]) => [e, s])),
  C = X(g);
var Z = t => {
    let s = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(s);
    return e ? {ext: C[e[1]] ?? h, data: e[2]} : {ext: h, data: t};
  },
  tt = async (t, s = './images', e) => {
    try {
      await L.mkdir(s, {recursive: !0});
      let {ext: r, data: a} = Z(t),
        n = `${s}/image_${e || Date.now()}${r}`;
      return (await L.writeFile(n, Buffer.from(a, 'base64')), n);
    } catch (r) {
      throw r;
    }
  },
  O = tt;
import {readFile as et} from 'fs/promises';
import {extname as nt} from 'path';
var ot = async (t, s = !1) => {
    try {
      let e = nt(t).toLowerCase();
      if (!g[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let r = await et(t, 'base64');
      return s ? `data:${g[e]};base64,${r}` : r;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  E = ot;
var st = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  P = {
    openai: (t, s) => ({
      chat: async (e, r = {}, a) => {
        let n = s(e, r, 'chat'),
          o = I,
          i = await t.chat.completions.create(n);
        return o(i, n.stream, a);
      },
      responses: async (e, r = {}, a) => {
        let n = s(e, r, 'responses'),
          o = A,
          i = await t.responses.create(n);
        return o(i, n.stream, a);
      },
    }),
    ollama: (t, s) => ({
      chat: async (e, r = {}, a) => {
        let n = s(e, r, 'chat'),
          o = u,
          i = await t.chat(n);
        return o(i, n.stream, a);
      },
      generate: async (e, r = {}, a) => {
        let n = s(e, r, 'generate'),
          o = d[st(n.model)],
          i = await t.generate(n);
        return o(i, n.stream, a);
      },
      responses: async (e, r = {}, a) => {
        let n = s(e, r, 'responses'),
          o = x,
          i = await t.responses(n);
        return o(i, n.stream, a);
      },
      saveImage: O,
      imageToBase64: E,
    }),
  };
var it = {
    ollama: {
      hostKey: 'host',
      envConfig: w,
      API: ({apiKey: t, headers: s, ...e}) =>
        new rt({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...s}, ...e}),
    },
    openai: {hostKey: 'baseURL', envConfig: _, API: t => new at(t)},
  },
  ct = (t = 'ollama', s = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: r, envConfig: a, API: n} = it[t],
      {config: o, params: i, options: c} = a,
      {baseURL: p, host: m, dispatcher: f, ...l} = {...o, ...s};
    if (((l[r] = m || p), !l[r])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let b = n({fetch: y(f), ...l}),
      {options: v, extra_body: K, ...$} = e,
      j = {params: {...i, ...$}, options: {...c, ...K, ...v}},
      B = R(j, t);
    return P[t](b, B);
  },
  jt = ct;
export {jt as default, ct as startApi};
