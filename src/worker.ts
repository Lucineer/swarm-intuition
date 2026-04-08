interface Env { INTUITION_KV: KVNamespace; DEEPSEEK_API_KEY?: string; }

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*; frame-ancestors 'none';";

function json(data: unknown, s = 200) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json', ...CSP } }); }

async function callLLM(key: string, system: string, user: string, model = 'deepseek-chat', max = 1200): Promise<string> {
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: max, temperature: 0.5 })
  });
  return (await resp.json()).choices?.[0]?.message?.content || '';
}

interface Signal { cause: string; effect: string; confidence: number; frequency: number; vessels: string[]; ts: string; }
interface Prediction { query: string; prediction: string; confidence: number; basedOn: number; }

function getLanding(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Swarm Intuition — Cocapn</title><style>
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e0e0e0;margin:0;min-height:100vh}
.container{max-width:800px;margin:0 auto;padding:40px 20px}
h1{color:#f59e0b;font-size:2.2em}a{color:#f59e0b;text-decoration:none}
.sub{color:#8A93B4;margin-bottom:2em}
.card{background:#16161e;border:1px solid #2a2a3a;border-radius:12px;padding:24px;margin:20px 0}
.card h3{color:#f59e0b;margin:0 0 12px 0}
.btn{background:#f59e0b;color:#0a0a0f;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold}
.btn:hover{background:#d97706}
textarea,input{background:#0a0a0f;color:#e0e0e0;border:1px solid #2a2a3a;border-radius:8px;padding:10px}
textarea{width:100%;box-sizing:border-box;font-family:monospace}
.signal{padding:12px;background:#1a1a0a;border-left:3px solid #f59e0b;margin:8px 0;border-radius:0 8px 8px 0}
.signal .conf{color:#22c55e;font-weight:bold}
.prediction{padding:16px;background:#0a1a1a;border-left:3px solid #22c55e;margin:12px 0;border-radius:0 8px 8px 0}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}
.stat{text-align:center;padding:16px;background:#16161e;border-radius:8px;border:1px solid #2a2a3a}
.stat .num{font-size:2em;color:#f59e0b;font-weight:bold}.stat .label{color:#8A93B4;font-size:.8em}
</style></head><body><div class="container">
<h1>🔮 Swarm Intuition</h1><p class="sub">Fleet learns from its own loops. Anticipate bottlenecks before they happen.</p>
<div class="stats"><div class="stat"><div class="num" id="signals">0</div><div class="label">Signals Learned</div></div>
<div class="stat"><div class="num" id="predictions">0</div><div class="label">Predictions Made</div></div>
<div class="stat"><div class="num" id="accuracy">—</div><div class="label">Accuracy</div></div></div>
<div class="card"><h3>Log a Causal Signal</h3>
<textarea id="cause" rows="2" placeholder="What happened? (cause)"></textarea>
<textarea id="effect" rows="2" placeholder="What resulted? (effect)" style="margin-top:8px"></textarea>
<div style="margin-top:12px;display:flex;gap:8px">
<input id="vessel" placeholder="Vessel involved" style="flex:1">
<button class="btn" onclick="logSignal()">Log Signal</button></div></div>
<div class="card"><h3>Predict Outcome</h3>
<textarea id="query" rows="2" placeholder="Describe a planned action and ask: what will happen?"></textarea>
<div style="margin-top:12px"><button class="btn" onclick="predict()">Predict</button></div></div>
<div id="results" class="card" style="display:none"><h3>Prediction</h3><div id="predOut"></div></div>
<div id="signalsList" class="card"><h3>Learned Signals</h3><p style="color:#8A93B4">Loading...</p></div>
<script>
async function load(){try{const r=await fetch('/api/stats');const s=await r.json();
document.getElementById('signals').textContent=s.signals||0;
document.getElementById('predictions').textContent=s.predictions||0;
document.getElementById('accuracy').textContent=s.accuracy||'—';
const r2=await fetch('/api/signals');const sig=await r2.json();
const el=document.getElementById('signalsList');
if(!sig.length){el.innerHTML='<h3>Learned Signals</h3><p style="color:#8A93B4">No signals yet.</p>';return;}
el.innerHTML='<h3>Learned Signals</h3>'+sig.slice(0,10).map(x=>'<div class="signal"><strong>'+x.cause.substring(0,80)+'</strong> → <span style="color:#8A93B4">'+x.effect.substring(0,80)+'</span><br><span class="conf">'+(x.confidence*100).toFixed(0)+'% confidence</span> · '+x.frequency+'x observed</div>').join('');}catch(e){}}
async function logSignal(){const c=document.getElementById('cause').value.trim(),e=document.getElementById('effect').value.trim(),v=document.getElementById('vessel').value.trim();
if(!c||!e)return;
await fetch('/api/signal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cause:c,effect:e,vessel:v})});
document.getElementById('cause').value='';document.getElementById('effect').value='';load();}
async function predict(){const q=document.getElementById('query').value.trim();if(!q)return;
const r=await fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});
const p=await r.json();
document.getElementById('results').style.display='block';
document.getElementById('predOut').innerHTML=p.error?'<p style="color:#ef4444">'+p.error+'</p>':
'<div class="prediction"><strong>'+(p.confidence*100).toFixed(0)+'% confidence</strong><br>'+p.prediction+'<br><span style="color:#8A93B4;font-size:.85em">Based on '+p.basedOn+' signals</span></div>';}
load();</script>
<div style="text-align:center;padding:24px;color:#475569;font-size:.75rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> · <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>
</div></body></html>`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return json({ status: 'ok', vessel: 'swarm-intuition' });
    if (url.pathname === '/vessel.json') return json({ name: 'swarm-intuition', type: 'cocapn-vessel', version: '1.0.0', description: 'Fleet learns from loop-closure data — anticipate bottlenecks before they happen', fleet: 'https://the-fleet.casey-digennaro.workers.dev', capabilities: ['causal-signals', 'prediction', 'fleet-learning'] });

    if (url.pathname === '/api/stats') {
      const signals = await env.INTUITION_KV.get('signals', 'json') as Signal[] || [];
      const predictions = await env.INTUITION_KV.get('prediction-count', 'json') as number || 0;
      const accuracy = await env.INTUITION_KV.get('accuracy', 'json') as number || 0;
      return json({ signals: signals.length, predictions, accuracy: accuracy > 0 ? `${(accuracy * 100).toFixed(0)}%` : '—' });
    }

    if (url.pathname === '/api/signals') return json((await env.INTUITION_KV.get('signals', 'json') as Signal[] || []).slice(0, 20));
    if (url.pathname === '/api/predictions') return json((await env.INTUITION_KV.get('predictions', 'json') as Prediction[] || []).slice(0, 20));

    if (url.pathname === '/api/signal' && req.method === 'POST') {
      const { cause, effect, vessel } = await req.json() as { cause: string; effect: string; vessel: string };
      const signals = await env.INTUITION_KV.get('signals', 'json') as Signal[] || [];
      const normalized = cause.toLowerCase().trim().substring(0, 100);
      const existing = signals.find((s: Signal) => s.cause.toLowerCase() === normalized);
      if (existing) {
        existing.frequency++;
        existing.confidence = Math.min(0.99, existing.confidence + 0.05);
        if (vessel && !existing.vessels.includes(vessel)) existing.vessels.push(vessel);
      } else {
        signals.unshift({ cause: cause.substring(0, 200), effect: effect.substring(0, 200), confidence: 0.5, frequency: 1, vessels: vessel ? [vessel] : [], ts: new Date().toISOString() });
      }
      if (signals.length > 100) signals.length = 100;
      await env.INTUITION_KV.put('signals', JSON.stringify(signals));
      return json({ logged: true });
    }

    if (url.pathname === '/api/predict' && req.method === 'POST') {
      const { query } = await req.json() as { query: string };
      if (!query) return json({ error: 'query required' }, 400);

      const signals = await env.INTUITION_KV.get('signals', 'json') as Signal[] || [];
      if (signals.length < 3) {
        if (env.DEEPSEEK_API_KEY) {
          const raw = await callLLM(env.DEEPSEEK_API_KEY,
            'Predict the likely outcome of a fleet action. Be specific. 2-3 sentences.',
            `Action: ${query}`, 'deepseek-chat', 500);
          const count = (await env.INTUITION_KV.get('prediction-count', 'json') as number || 0) + 1;
          await env.INTUITION_KV.put('prediction-count', JSON.stringify(count));
          return json({ prediction: raw.trim(), confidence: 0.3, basedOn: 0 });
        }
        return json({ error: 'not enough signals yet (need 3+)' }, 400);
      }

      // Find matching signals by keyword overlap
      const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const matches = signals
        .map(s => {
          const effectWords = new Set(s.effect.toLowerCase().split(/\s+/));
          const causeWords = new Set(s.cause.toLowerCase().split(/\s+/));
          const overlap = [...queryWords].filter(w => effectWords.has(w) || causeWords.has(w)).length;
          return { ...s, relevance: overlap / Math.max(queryWords.size, 1) };
        })
        .filter(s => s.relevance > 0.1)
        .sort((a, b) => (b.confidence * b.relevance + b.frequency * 0.02) - (a.confidence * a.relevance + a.frequency * 0.02))
        .slice(0, 5);

      if (matches.length === 0) {
        return json({ prediction: 'No matching signals found. Log more causal observations.', confidence: 0, basedOn: 0 });
      }

      const topMatches = matches.slice(0, 3);
      if (env.DEEPSEEK_API_KEY) {
        const context = topMatches.map(m => `When ${m.cause}, then ${m.effect} (${m.frequency}x, ${Math.round(m.confidence * 100)}% confidence)`).join('\n');
        const raw = await callLLM(env.DEEPSEEK_API_KEY,
          'Based on these fleet causal signals, predict the outcome of the planned action. Be specific. 2-3 sentences.',
          `Planned action: ${query}\n\nKnown signals:\n${context}`, 'deepseek-chat', 500);
        const count = (await env.INTUITION_KV.get('prediction-count', 'json') as number || 0) + 1;
        await env.INTUITION_KV.put('prediction-count', JSON.stringify(count));
        const prediction: Prediction = { query: query.substring(0, 200), prediction: raw.trim(), confidence: topMatches[0].confidence, basedOn: topMatches.length };
        const predictions = await env.INTUITION_KV.get('predictions', 'json') as Prediction[] || [];
        predictions.unshift(prediction);
        if (predictions.length > 50) predictions.length = 50;
        await env.INTUITION_KV.put('predictions', JSON.stringify(predictions));
        return json(prediction);
      }

      return json({ prediction: topMatches[0].effect, confidence: topMatches[0].confidence, basedOn: topMatches.length });
    }

    return new Response(getLanding(), { headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Content-Security-Policy': CSP } });
    'X-Frame-Options': 'DENY',
  }
};
