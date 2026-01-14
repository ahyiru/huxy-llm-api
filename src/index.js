import {Ollama as $} from 'ollama';
import q from 'openai';
import {fetch as v, Agent as b} from 'undici';
var E = 300 * 60 * 1e3,
  k = t => (i, o) => v(i, {...o, dispatcher: new b({headersTimeout: E, ...t})}),
  l = k;
var U = {config: {apiKey: process.env.OLLM_API_KEY || 'ollm_key', host: process.env.OLLM_API_HOST}, params: {}, options: {}},
  g = U;
var M = {config: {apiKey: process.env.LLM_API_KEY || 'llm_key', baseURL: process.env.LLM_API_BASEURL}, params: {}, options: {}},
  h = M;
var B = ['temperature', 'seed', 'stop', 'top_p'],
  F = t => {
    let {max_tokens: i, options: o = {}, ...r} = t,
      {num_ctx: s, ...n} = o;
    return (
      (r.max_tokens = i ?? s),
      Object.keys(n).map(e => {
        B.includes(e) ? (r[e] = n[e]) : (r.extra_body || (r.extra_body = {}), (r.extra_body[e] = n[e]));
      }),
      r
    );
  },
  S = (t, i = {}, o = 'chat') => {
    if (!t) throw Error('\u8BF7\u4F20\u5165\u4F60\u7684 prompt !');
    if (!i.model) throw Error('\u8BF7\u914D\u7F6E\u8981\u4F7F\u7528\u7684\u5927\u6A21\u578B model !');
    if (o === 'chat') {
      let s = Array.isArray(t) ? t : [{role: 'user', content: t}],
        {system: n, ...e} = i;
      return (n && (s = [{role: 'system', content: n}, ...s]), {messages: s, ...e});
    }
    if (o === 'responses') {
      let {instructions: s, system: n, ...e} = i;
      return (s || (e.instructions = n), {input: t, ...e});
    }
    return {prompt: Array.isArray(t) ? t.slice(-1)[0]?.content : t, ...i};
  };
var x =
  ({params: t, options: i} = {}, o) =>
  (r, s = {}, n) => {
    let {options: e, extra_body: a, ...c} = s,
      p = S(r, {...t, ...c}, n);
    return ((p.options = {...i, ...a, ...e}), o === 'openai' ? F(p) : p);
  };
var Y = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  d = async (t, i, o) => {
    if (i) {
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
  y = async (t, i, o) => {
    if (i) {
      let e = '',
        a = '';
      for await (let c of t) {
        let {delta: p} = c.choices?.[0] ?? {},
          {reasoning: u, content: f} = p ?? {};
        (u && (a += u), f && (e += f), o?.({content: e, reasoning: a}, c));
      }
      return {content: e, reasoning: a};
    }
    o?.(t);
    let {message: r} = t.choices?.[0] ?? {},
      {content: s, reasoning: n} = r;
    return {content: s, reasoning: n};
  };
var z = ['response.reasoning_text.delta', 'response.reasoning_summary_text.delta'],
  _ = async (t, i, o) => {
    if (i) {
      let s = '',
        n = '';
      for await (let e of t) {
        let {type: a, delta: c} = e;
        (z.includes(a) && (n += c), a === 'response.output_text.delta' && (s += c), o?.({content: s, reasoning: n}, e));
      }
      return {content: s, reasoning: n};
    }
    return (o?.(t), {reasoning: (t.output?.[0]?.content ?? t.output?.[0]?.summary)?.[0]?.text, content: t.output_text});
  },
  R = async (t, i, o) => {
    if (i) {
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
    let r = t.reasoning ?? t.thinking;
    return {content: t.content ?? t.response, reasoning: r};
  },
  A = async (t, i, o) => {
    if (i) {
      let e = '',
        a = '';
      for await (let c of t) {
        let {message: p} = c,
          u = p.reasoning ?? p.thinking,
          f = p.content ?? p.response;
        (u && (a += u), f && (e += f), o?.({content: e, reasoning: a}, c));
      }
      return {content: e, reasoning: a};
    }
    let {message: r} = t;
    o?.(t);
    let s = r.reasoning ?? r.thinking;
    return {content: r.content ?? r.response, reasoning: s};
  };
var w = {
  openai: (t, i) => ({
    chat: async (o, r = {}, s) => {
      let n = i(o, r, 'chat'),
        e = y,
        a = await t.chat.completions.create(n);
      return e(a, n.stream, s);
    },
    responses: async (o, r = {}, s) => {
      let n = i(o, r, 'responses'),
        e = d,
        a = await t.responses.create(n);
      return e(a, n.stream, s);
    },
  }),
  ollama: (t, i) => ({
    chat: async (o, r = {}, s) => {
      let n = i(o, r, 'chat'),
        e = A,
        a = await t.chat(n);
      return e(a, n.stream, s);
    },
    generate: async (o, r = {}, s) => {
      let n = i(o, r, 'generate'),
        e = R,
        a = await t.generate(n);
      return e(a, n.stream, s);
    },
    responses: async (o, r = {}, s) => {
      let n = i(o, r, 'responses'),
        e = _,
        a = await t.responses(n);
      return e(a, n.stream, s);
    },
  }),
};
var D = {
    ollama: {hostKey: 'host', envConfig: g, API: ({apiKey: t, headers: i, ...o}) => new $({headers: {Authorization: t ? `Bearer ${t}` : void 0, ...i}, ...o})},
    openai: {hostKey: 'baseURL', envConfig: h, API: t => new q(t)},
  },
  G = (t = 'ollama', i = {}, o = {}) => {
    t = ['ollama', 'openai'].includes(t) ? t : 'ollama';
    let {hostKey: r, envConfig: s, API: n} = D[t],
      {config: e, params: a, options: c} = s,
      {baseURL: p, host: u, dispatcher: f, ...m} = {...e, ...i};
    if (((m[r] = u || p), !m[r])) throw Error('\u8BF7\u914D\u7F6E\u5927\u6A21\u578B API \u5730\u5740 host/baseURL !');
    let I = n({fetch: l(f), ...m}),
      {options: P, extra_body: C, ...L} = o,
      O = {params: {...a, ...L}, options: {...c, ...C, ...P}},
      K = x(O, t);
    return w[t](I, K);
  },
  rt = G;
export {rt as default, G as startApi};
