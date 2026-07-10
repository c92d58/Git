var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var worker_default = {};

async function ping(url) {
  const start = Date.now();
  try {
    const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return { status: r.status, ok: r.ok, ms: Date.now() - start };
  } catch (e) {
    return { status: 523, ok: false, ms: 8000 };
  }
}
__name(ping, "ping");

async function checkAll(env) {
  const results = {};
  const targets = [
    ["api", "https://api.wahsun.org/health"],
    ["blog", "https://blog.wahsun.org/"],
    ["www", "https://www.wahsun.org/"],
    ["threads", "https://threads.wahsun.org/"],
    ["server", "https://server.wahsun.org/"]
  ];
  for (const [name, url] of targets)
    results[name] = url ? await ping(url) : { ok: true, ms: 0 };

  if (env && env.VPS_MONITOR) {
    const now = new Date();
    const ts = Math.floor(Date.now()/60000)*60000;
    const hkey = "h:" + now.toISOString().slice(0,13).replace("T","-");
    const dkey = "d:" + now.toISOString().slice(0,10);
    const mem = {}; 
    for (const [k,v] of Object.entries(results)) mem[k] = v.ok ? 1 : 0;
    mem.time = ts;
    try { await env.VPS_MONITOR.put("m:"+ts, JSON.stringify(mem), {expirationTtl: 259200}); } catch(_){}

    // Aggregate hourly
    try {
      let hexist = await env.VPS_MONITOR.get(hkey);
      let h = hexist ? JSON.parse(hexist) : {};
      for (const [k,v] of Object.entries(results)) {
        if (!h[k]) h[k] = {up:0,total:0};
        h[k].total++; if (v.ok) h[k].up++;
      }
      await env.VPS_MONITOR.put(hkey, JSON.stringify(h), {expirationTtl: 7776000});
    } catch(_){}
  }
  return results;
}
__name(checkAll, "checkAll");

function renderHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WAHSUN Status</title>
<style>
:root{--bg:#0a0a0f;--t:#c0c0d0;--t2:#777;--t3:#444;--card:#111118;--s1:0 1px 2px rgba(0,0,0,.4);--s2:0 2px 8px rgba(0,0,0,.3);--g:#00ff88;--gb:rgba(0,255,136,.08);--r:#ff4444;--rb:rgba(255,68,68,.08);--br:rgba(0,255,136,.06);--a:#00ff88}
*,*:before,*:after{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;position:relative;font-size:14px}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(circle,var(--br) 1px,transparent 1px);background-size:16px 16px}
body:after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px)}
.w{max-width:800px;margin:0 auto;padding:36px 20px 24px;position:relative;z-index:1}
.top{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.top h1{font-family:"JetBrains Mono",monospace;font-size:1.1rem;font-weight:800;letter-spacing:.08em;color:var(--g);text-transform:uppercase}
.top .bag{display:flex;align-items:center;gap:6px;font-size:.75rem;font-weight:600;padding:5px 14px;border-radius:2px;margin-left:auto;transition:all .3s;font-family:"JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.04em}
.top .bag.up{background:var(--gb);color:var(--g)}.top .bag.down{background:var(--rb);color:var(--r)}
.top .bag .bd{width:9px;height:9px;border-radius:50%}.top .bag .bd.up{background:var(--g);animation:br 3s ease-in-out infinite;box-shadow:0 0 6px rgba(0,255,136,.3)}.top .bag .bd.down{background:var(--r);animation:br 3s ease-in-out infinite;box-shadow:0 0 6px rgba(255,68,68,.3)}
@keyframes br{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
.row{background:var(--card);border-radius:4px;padding:14px 18px;margin-bottom:6px;border:1px solid var(--br);transition:all .15s}
.row:hover{transform:translateY(-1px);border-color:var(--g)}
.rhead{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.ind{width:8px;height:8px;border-radius:50%;flex-shrink:0}.ind.up{background:var(--g)}.ind.down{background:var(--r)}
.info{flex:1;min-width:0}.info b{font-size:.82rem;font-weight:600;font-family:"JetBrains Mono",monospace}.info s{font-size:.68rem;color:var(--t3);margin-left:8px;text-decoration:none}
.rstat{text-align:right;font-size:.75rem}.rstat .ms{font-weight:700}.rstat .ms.g{color:var(--g)}.rstat .ms.r{color:var(--r)}
.hm{display:flex;gap:1.5px;flex-wrap:wrap;align-items:end;margin-top:4px}
.hm .b{width:3px;height:18px;border-radius:1px;flex-shrink:0}.hm .b.u{background:var(--g);opacity:.6}.hm .b.d{background:var(--r);opacity:.7}.hm .b.n{background:var(--br);opacity:.3}
.ustats{margin-top:24px;border-radius:4px;background:var(--card);border:1px solid var(--br);overflow:hidden}
.ustats table{width:100%;border-collapse:collapse;font-size:.72rem}
.ustats th,.ustats td{padding:10px 14px;text-align:center}
.ustats th{background:rgba(0,255,136,.03);color:var(--t2);font-weight:600;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;font-family:"JetBrains Mono",monospace}
.ustats td{border-top:1px solid var(--br);color:var(--t2);font-variant-numeric:tabular-nums}
.ustats td:first-child{text-align:left;font-weight:600;color:var(--t);font-size:.75rem;font-family:"JetBrains Mono",monospace}
.ustats td .g{color:var(--g);font-weight:700}
.ustats td .r{color:var(--r);font-weight:700}
.ft{margin-top:20px;text-align:center;font-size:.65rem;color:var(--t3);font-family:"JetBrains Mono",monospace}
.ft a{color:var(--a);cursor:pointer;text-decoration:none}.ft a:hover{opacity:.8}
@media(max-width:640px){.ustats{overflow-x:auto}.ustats th,.ustats td{padding:8px 10px;font-size:.65rem}}
</head>
<body>
<div class="w">
<div class="top"><h1>WAHSUN</h1><div class="bag" id="bag"><span class="bd" id="bdd"></span><span id="btx">Checking</span></div></div>
<div id="list"></div>
<div class="ustats" id="ut"></div>
<div class="ft">Updates every 15s · Cloudflare Workers · <a onclick="U()">Refresh</a></div>
</div>
<script>
var P={},S=[{k:'api',n:'API',u:'api.wahsun.org'},{k:'blog',n:'Blog',u:'blog.wahsun.org'},{k:'www',n:'Web',u:'www.wahsun.org'},{k:'threads',n:'Threads',u:'threads.wahsun.org'},{k:'server',n:'Server',u:'server.wahsun.org'}];
function hm(a){var s='';for(var i=0;i<a.length;i++){var c=a[i]===1?'u':a[i]===-1?'d':'n';s+='<div class="b '+c+'"></div>'}return s}
function U(){
fetch('/api/health').then(r=>r.json()).then(d=>{
var c=document.getElementById('list'),all=!0;
c.innerHTML=S.map(s=>{
var v=d[s.k],ok=v&&v.ok;if(!ok)all=false;var ms=v?v.ms:8000;
if(!P[s.k])P[s.k]=[];P[s.k].push(ok?1:-1);if(P[s.k].length>90)P[s.k].shift();
return'<div class=row><div class=rhead><div class="ind '+(ok?'up':'down')+'"></div><div class=info><b>'+s.n+'</b><s>'+s.u+'</s></div><div class=rstat><span class="ms '+(ok?'g':'r')+'">'+(ok?ms+'ms':'DOWN')+'</span></div></div><div class=hm>'+hm(P[s.k].slice(-90))+'</div></div>'
}).join('');
document.getElementById('bdd').className='bd '+(all?'up':'down');
document.getElementById('btx').textContent=all?'All Systems Operational':'Issue Detected'
})}
fetch('/api/uptime').then(r=>r.json()).then(d=>{
var t=document.getElementById('ut'),u=Object.entries(d||{}),h='<table><thead><tr><th>Service</th><th>24h</th><th>7d</th><th>30d</th><th>90d</th></tr></thead><tbody>';
for(var i=0;i<S.length;i++){var v=u.find(e=>e[0]===S[i].k);var s=v?v[1]:{};var a=s['24h']||{up:0,total:1},b=s['7d']||{up:0,total:1},c2=s['30d']||{up:0,total:1},e=s['90d']||{up:0,total:1};function r(x){var p=(x.up/x.total*100).toFixed(2);return p>99.9?p+'%':p+'%'}
h+='<tr><td>'+S[i].n+'</td><td><span class='+(a.up/a.total>.999?'g':'r')+'>'+r(a)+'</span></td><td><span class='+(b.up/b.total>.999?'g':'r')+'>'+r(b)+'</span></td><td><span class='+(c2.up/c2.total>.999?'g':'r')+'>'+r(c2)+'</span></td><td><span class='+(e.up/e.total>.999?'g':'r')+'>'+r(e)+'</span></td></tr>'}
t.innerHTML=h+'</tbody></table>'})
fetch('/api/minutes').then(r=>r.json()).then(r=>{for(var k in r)if(r[k])P[k]=r[k];U()}).catch(()=>U());
setInterval(U,15000);
<` + `/script>
</body>
</html>`;
}
__name(renderHTML, "renderHTML");

function calcUptime(hourly, now) {
  const thresholds = { "24h": 24 * 3600000, "7d": 7 * 86400000, "30d": 30 * 86400000, "90d": 90 * 86400000 };
  const result = {};
  const services = ["api", "blog", "www", "threads", "server"];
  for (const svc of services) {
    result[svc] = {};
    for (const [period, windowMs] of Object.entries(thresholds)) {
      let up = 0, total = 0;
      for (const [key, data] of Object.entries(hourly)) {
        const ts = new Date(key.slice(2) + ":00:00Z").getTime();
        if (now - ts <= windowMs) {
          const s = data[svc];
          if (s) { up += s.up || 0; total += s.total || 0; }
        }
      }
      result[svc][period] = { up, total: total || 1 };
    }
  }
  return result;
}

worker_default.fetch = async function(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === "/api/health") {
    const data = await checkAll(env);
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  }
  if (url.pathname === "/api/uptime") {
    try {
      const list = await env.VPS_MONITOR.list({ prefix: "h:", limit: 2000 });
      const hourly = {};
      const now = Date.now();
      for (const k of list.keys) {
        try {
          const v = await env.VPS_MONITOR.get(k.name);
          if (v) hourly[k.name] = JSON.parse(v);
        } catch(_){}
      }
      const data = calcUptime(hourly, now);
      return new Response(JSON.stringify(data), {
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    } catch(e) {
      return new Response("{}", { headers: { "content-type": "application/json" } });
    }
  }
  if (url.pathname === "/api/minutes") {
    try {
      const list = await env.VPS_MONITOR.list({ prefix: "m:", limit: 90 });
      const hist = { api: [], blog: [], www: [], threads: [], server: [] };
      const keys = list.keys.map(k => parseInt(k.name.slice(2))).sort((a,b)=>a-b);
      const dataMap = {};
      for (const k of list.keys) {
        try {
          const v = await env.VPS_MONITOR.get(k.name);
          if (v) dataMap[parseInt(k.name.slice(2))] = JSON.parse(v);
        } catch(_){}
      }
      if (keys.length > 0) {
        const start = keys[0], end = keys[keys.length-1];
        for (let ts = start; ts <= end; ts += 60000) {
          const d = dataMap[ts];
          for (const k of Object.keys(hist)) hist[k].push(d ? d[k] : -1);
        }
      }
      return new Response(JSON.stringify(hist), {
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    } catch(e) {
      return new Response("{}", { headers: { "content-type": "application/json" } });
    }
  }
  return new Response(renderHTML(), {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
};

export { worker_default as default };