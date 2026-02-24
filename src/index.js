var B = Object.defineProperty;
var U = (t, o) => {
  for (var e in o) B(t, e, {get: o[e], enumerable: !0});
};
import {Ollama as rt} from 'ollama';
import at from 'openai';
import {fetch as F, Agent as M} from 'undici';
var T = 1.5 * 60 * 60 * 1e3,
  z = t => (o, e) => F(o, {...e, dispatcher: new M({headersTimeout: T, ...t})}),
  y = z;
var N = {config: {apiKey: process.env.OLLM_API_KEY || 'ollm_key', host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  w = N;
var S = {config: {apiKey: process.env.LLM_API_KEY || 'llm_key', baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  _ = S;
var Y = ['temperature', 'seed', 'stop', 'top_p'],
  H = t => {
    let {max_tokens: o, options: e = {}, ...s} = t,
      {num_ctx: a, ...n} = e;
    return (
      (s.max_tokens = o ?? a),
      Object.keys(n).map(r => {
        Y.includes(r) ? (s[r] = n[r]) : (s.extra_body || (s.extra_body = {}), (s.extra_body[r] = n[r]));
      }),
      s
    );
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
      let {instructions: a, system: n, ...r} = o;
      return (a || (r.instructions = n), {input: t, ...r});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...o};
  };
var R =
  ({params: t, options: o} = {}, e) =>
  (s, a = {}, n) => {
    let {options: r, extra_body: i, ...c} = a,
      p = V(s, {...t, ...c}, n);
    return ((p.options = {...o, ...i, ...r}), e === 'openai' ? H(p) : p);
  };
var W = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  A = async (t, o, e) => {
    if (o) {
      let a = '',
        n = '';
      for await (let r of t) {
        let {type: i, delta: c} = r;
        (W.includes(i) && (n += c), i === 'response.output_text.delta' && (a += c), e?.({content: a, reasoning: n}, r));
      }
      return {content: a, reasoning: n};
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  b = async (t, o, e) => {
    if (o) {
      let r = '',
        i = '';
      for await (let c of t) {
        let {delta: p} = c.choices?.[0] ?? {},
          {reasoning: m, content: f} = p ?? {};
        (m && (i += m), f && (r += f), e?.({content: r, reasoning: i}, c));
      }
      return {content: r, reasoning: i};
    }
    e?.(t);
    let {message: s} = t.choices?.[0] ?? {},
      {content: a, reasoning: n} = s;
    return {content: a, reasoning: n};
  };
var d = {};
U(d, {chat: () => u, default: () => Q, generate: () => G, image: () => J, responses: () => x});
var D = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  x = async (t, o, e) => {
    if (o) {
      let a = '',
        n = '';
      for await (let r of t) {
        let {type: i, delta: c} = r;
        (D.includes(i) && (n += c), i === 'response.output_text.delta' && (a += c), e?.({content: a, reasoning: n}, r));
      }
      return {content: a, reasoning: n};
    }
    return (e?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  G = async (t, o, e) => {
    if (o) {
      let n = '',
        r = '';
      for await (let i of t) {
        let c = i.reasoning ?? i.thinking,
          p = i.content ?? i.response;
        (c && (r += c), p && (n += p), e?.({content: n, reasoning: r}, i));
      }
      return {content: n, reasoning: r};
    }
    e?.(t);
    let s = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: s};
  },
  J = async (t, o, e) => {
    for await (let s of t) e?.(s);
  },
  u = async (t, o, e) => {
    if (o) {
      let r = '',
        i = '';
      for await (let c of t) {
        let {message: p} = c,
          m = p.reasoning ?? p.thinking,
          f = p.content ?? p.response;
        (m && (i += m), f && (r += f), e?.({content: r, reasoning: i}, c));
      }
      return {content: r, reasoning: i};
    }
    let {message: s} = t;
    e?.(t);
    let a = s.reasoning ?? s.thinking;
    return {content: s.content ?? s.response, reasoning: a};
  },
  Q = u;
import C from 'node:fs/promises';
var g = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.svg': 'image/svg+xml', '.tiff': 'image/tiff'},
  h = '.png',
  X = t => Object.fromEntries(Object.entries(t).map(([o, e]) => [e, o])),
  I = X(g);
var Z = t => {
    let o = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(o);
    return e ? {ext: I[e[1]] ?? h, data: e[2]} : {ext: h, data: t};
  },
  tt = async (t, o = './images', e) => {
    try {
      await C.mkdir(o, {recursive: !0});
      let {ext: s, data: a} = Z(t),
        n = `${o}/image_${e || Date.now()}${s}`;
      return (await C.writeFile(n, Buffer.from(a, 'base64')), n);
    } catch (s) {
      throw (console.error('\u4FDD\u5B58\u56FE\u7247\u5931\u8D25:', s.message), s);
    }
  },
  L = tt;
import {readFile as et} from 'fs/promises';
import {extname as nt} from 'path';
var ot = async (t, o = !1) => {
    try {
      let e = nt(t).toLowerCase();
      if (!g[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let s = await et(t, 'base64');
      return o ? `data:${g[e]};base64,${s}` : s;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  O = ot;
var st = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  E = {
    openai: (t, o) => ({
      chat: async (e, s = {}, a) => {
        let n = o(e, s, 'chat'),
          r = b,
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
          r = u,
          i = await t.chat(n);
        return r(i, n.stream, a);
      },
      generate: async (e, s = {}, a) => {
        let n = o(e, s, 'generate'),
          r = d[st(n.model)],
          i = await t.generate(n);
        return r(i, n.stream, a);
      },
      responses: async (e, s = {}, a) => {
        let n = o(e, s, 'responses'),
          r = x,
          i = await t.responses(n);
        return r(i, n.stream, a);
      },
      saveImage: L,
      imageToBase64: O,
    }),
  };
var it = {
    ollama: {hostKey: 'host', envConfig: w, API: ({apiKey: t, headers: o, ...e}) => new rt({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...o}, ...e})},
    openai: {hostKey: 'baseURL', envConfig: _, API: t => new at(t)},
  },
  ct = (t = 'ollama', o = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: s, envConfig: a, API: n} = it[t],
      {config: r, params: i, options: c} = a,
      {baseURL: p, host: m, dispatcher: f, ...l} = {...r, ...o};
    if (((l[s] = m || p), !l[s])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let P = n({fetch: y(f), ...l}),
      {options: v, extra_body: K, ...$} = e,
      j = {params: {...i, ...$}, options: {...c, ...K, ...v}},
      k = R(j, t);
    return E[t](P, k);
  },
  jt = ct;
export {jt as default, ct as startApi};
