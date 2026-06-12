var B = Object.defineProperty;
var U = (t, r) => {
  for (var e in r) B(t, e, {get: r[e], enumerable: !0});
};
import {Ollama as at} from 'ollama';
import it from 'openai';
import {fetch as z, Agent as M} from 'undici';
var T = 3600 * 1e3,
  N = t => (r, e) => z(r, {...e, dispatcher: new M({headersTimeout: T, ...t})}),
  y = N;
var S = {config: {apiKey: process.env.OLLM_API_KEY || 'ollm_key', host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  w = S;
var Y = {config: {apiKey: process.env.LLM_API_KEY || 'llm_key', baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  v = Y;
var H = ['temperature', 'seed', 'stop', 'top_p'],
  V = t => {
    let {max_tokens: r, options: e = {}, ...o} = t,
      {num_ctx: a, ...n} = e;
    return (
      (o.max_tokens = r ?? a),
      Object.keys(n).map(s => {
        H.includes(s) ? (o[s] = n[s]) : (o.extra_body || (o.extra_body = {}), (o.extra_body[s] = n[s]));
      }),
      o
    );
  },
  W = (t, r = {}, e = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!r.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (e === 'chat') {
      let a = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...s} = r;
      return (n && (a = [{role: 'system', content: n}, ...a]), {messages: a, ...s});
    }
    if (e === 'responses') {
      let {instructions: a, system: n, ...s} = r;
      return (a || (s.instructions = n), {input: t, ...s});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...r};
  };
var R =
  ({params: t, options: r} = {}, e) =>
  (o, a = {}, n) => {
    let {options: s, extra_body: i, ...c} = a,
      p = W(o, {...t, ...c}, n);
    return ((p.options = {...r, ...i, ...s}), e === 'openai' ? V(p) : p);
  };
var q = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  A = async (t, r, e) => {
    if (r) {
      let s = '',
        i = '';
      for await (let c of t) {
        let {type: p, delta: m} = c;
        (q.includes(p) && (i += m), p === 'response.output_text.delta' && (s += m), e?.({content: s, reasoning: i}, c));
      }
      return {content: s, reasoning: i};
    }
    let a = (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text,
      n = t.output_text;
    return (e?.({content: n, reasoning: a}, t), {content: n, reasoning: a});
  },
  $ = async (t, r, e) => {
    if (r) {
      let s = '',
        i = '';
      for await (let c of t) {
        let {delta: p} = c.choices?.[0] ?? {},
          {reasoning: m, content: u} = p ?? {};
        (m && (i += m), u && (s += u), e?.({content: s, reasoning: i}, c));
      }
      return {content: s, reasoning: i};
    }
    let {message: o} = t.choices?.[0] ?? {},
      {content: a, reasoning: n} = o;
    return (e?.({content: a, reasoning: n}, t), {content: a, reasoning: n});
  };
var _ = {};
U(_, {chat: () => g, default: () => X, generate: () => J, image: () => Q, responses: () => x});
var G = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  f = t => {
    let {total_duration: r, load_duration: e, prompt_eval_count: o, prompt_eval_duration: a, eval_count: n, eval_duration: s} = t;
    t.analyze = `total duration:        ${(r / 1e9).toFixed(2)} s
load duration:         ${(e / 1e6).toFixed(2)} ms
prompt eval count:     ${o} token(s)
prompt eval duration:  ${(a / 1e6).toFixed(2)} ms
prompt eval rate:      ${(o / (a / 1e9)).toFixed(2)} tokens/s
eval count:            ${n} token(s)
eval duration:         ${(s / 1e9).toFixed(2)} s
eval rate:             ${(n / (s / 1e9)).toFixed(2)} tokens/s`;
  },
  x = async (t, r, e) => {
    if (r) {
      let s = '',
        i = '';
      for await (let c of t) {
        let {type: p, delta: m} = c;
        (G.includes(p) && (i += m), p === 'response.output_text.delta' && (s += m), c.done && f(c), e?.({content: s, reasoning: i}, c));
      }
      return {content: s, reasoning: i};
    }
    let a = (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text,
      n = t.output_text;
    return (f(t), e?.({content: n, reasoning: a}, t), {content: n, reasoning: a});
  },
  J = async (t, r, e) => {
    if (r) {
      let n = '',
        s = '';
      for await (let i of t) {
        let c = i.reasoning ?? i.thinking,
          p = i.content ?? i.response;
        (c && (s += c), p && (n += p), i.done && f(i), e?.({content: n, reasoning: s}, i));
      }
      return {content: n, reasoning: s};
    }
    let o = t.reasoning ?? t.thinking,
      a = t.content ?? t.response;
    return (f(t), e?.({content: a, reasoning: o}, t), {content: a, reasoning: o});
  },
  Q = async (t, r, e) => {
    for await (let o of t) e?.(o);
  },
  g = async (t, r, e) => {
    if (r) {
      let s = '',
        i = '';
      for await (let c of t) {
        let {message: p} = c,
          m = p.reasoning ?? p.thinking,
          u = p.content ?? p.response;
        (m && (i += m), u && (s += u), c.done && f(c), e?.({content: s, reasoning: i}, c));
      }
      return {content: s, reasoning: i};
    }
    let {message: o} = t,
      a = o.reasoning ?? o.thinking,
      n = o.content ?? o.response;
    return (f(t), e?.({content: n, reasoning: a}, t), {content: n, reasoning: a});
  },
  X = g;
import I from 'node:fs/promises';
var l = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.svg': 'image/svg+xml', '.tiff': 'image/tiff'},
  h = '.png',
  Z = t => Object.fromEntries(Object.entries(t).map(([r, e]) => [e, r])),
  b = Z(l);
var tt = t => {
    let r = /^data:(image\/[a-z]+);base64,(.+)$/i,
      e = t.match(r);
    return e ? {ext: b[e[1]] ?? h, data: e[2]} : {ext: h, data: t};
  },
  et = async (t, r = './images', e) => {
    try {
      await I.mkdir(r, {recursive: !0});
      let {ext: o, data: a} = tt(t),
        n = `${r}/image_${e || Date.now()}${o}`;
      return (await I.writeFile(n, Buffer.from(a, 'base64')), n);
    } catch (o) {
      throw (console.error('\u4FDD\u5B58\u56FE\u7247\u5931\u8D25:', o.message), o);
    }
  },
  C = et;
import {readFile as nt} from 'fs/promises';
import {extname as ot} from 'path';
var st = async (t, r = !1) => {
    try {
      let e = ot(t).toLowerCase();
      if (!l[e]) throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F: ${e}`);
      let o = await nt(t, 'base64');
      return r ? `data:${l[e]};base64,${o}` : o;
    } catch (e) {
      throw e.code === 'ENOENT' ? new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`) : e;
    }
  },
  L = st;
var rt = t => (t?.startsWith('x/') ? 'image' : 'generate'),
  O = {
    openai: (t, r) => ({
      chat: async (e, o = {}, a) => {
        let n = r(e, o, 'chat'),
          s = $,
          i = await t.chat.completions.create(n);
        return s(i, n.stream, a);
      },
      responses: async (e, o = {}, a) => {
        let n = r(e, o, 'responses'),
          s = A,
          i = await t.responses.create(n);
        return s(i, n.stream, a);
      },
    }),
    ollama: (t, r) => ({
      chat: async (e, o = {}, a) => {
        let n = r(e, o, 'chat'),
          s = g,
          i = await t.chat(n);
        return s(i, n.stream, a);
      },
      generate: async (e, o = {}, a) => {
        let n = r(e, o, 'generate'),
          s = _[rt(n.model)],
          i = await t.generate(n);
        return s(i, n.stream, a);
      },
      responses: async (e, o = {}, a) => {
        let n = r(e, o, 'responses'),
          s = x,
          i = await t.responses(n);
        return s(i, n.stream, a);
      },
      saveImage: C,
      imageToBase64: L,
    }),
  };
var ct = {
    ollama: {hostKey: 'host', envConfig: w, API: ({apiKey: t, headers: r, ...e}) => new at({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...r}, ...e})},
    openai: {hostKey: 'baseURL', envConfig: v, API: t => new it(t)},
  },
  pt = (t = 'ollama', r = {}, e = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: o, envConfig: a, API: n} = ct[t],
      {config: s, params: i, options: c} = a,
      {baseURL: p, host: m, dispatcher: u, ...d} = {...s, ...r};
    if (((d[o] = m || p), !d[o])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let E = n({fetch: y(u), ...d}),
      {options: P, extra_body: k, ...F} = e,
      K = {params: {...i, ...F}, options: {...c, ...k, ...P}},
      j = R(K, t);
    return O[t](E, j);
  },
  Kt = pt;
export {Kt as default, pt as startApi};
