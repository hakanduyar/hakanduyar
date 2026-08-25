import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROFILE_COPY } from '../src/config.js';
import { REPO_ROOT } from '../src/emit.js';
import type { Telemetry } from '../src/telemetry.js';

const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}

function profileImage(name: string, alt: string, animated = false, responsive = false): string {
  const base = `../assets/generated/${name}`;
  const staticAttrs = animated
    ? ` data-static="${base}-static-dark.svg"`
    : '';
  const mobileAttrs = responsive
    ? ` data-mobile="${base}-mobile-dark.svg"`
    : '';
  const mobileStaticAttrs = animated && responsive
    ? ` data-mobile-static="${base}-mobile-static-dark.svg"`
    : '';
  return `<img class="profile-visual" data-desktop="${base}-dark.svg"${staticAttrs}${mobileAttrs}${mobileStaticAttrs} src="${base}-dark.svg" alt="${escapeHtml(alt)}">`;
}

const pins = telemetry.featured.map((repo) => `<article class="pin">
  <div><span class="repo-icon">▱</span><a href="${repo.url}">${repo.name}</a><span class="public">Public</span></div>
  <p>${escapeHtml(repo.description ?? 'Public engineering project')}</p>
  <small><i></i>${escapeHtml(repo.language ?? 'Code')}<span>☆ ${repo.stars}</span></small>
</article>`).join('');

const maxWeek = Math.max(...telemetry.activity.weekly, 1);
const activity = telemetry.activity.weekly.map((value) => {
  const level = value === 0 ? 0 : Math.max(1, Math.ceil((value / maxWeek) * 4));
  return `<i class="week l${level}" title="${value} public contributions"></i>`;
}).join('');

const html = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hakan Duyar — V4 GitHub profile preview</title>
<style>
*{box-sizing:border-box}html{color-scheme:light dark;--bg:#fff;--surface:#f6f8fa;--text:#1f2328;--muted:#656d76;--line:#d0d7de;--link:#0969da;--header:#f6f8fa;--green:#1a7f37;--g1:#aceebb;--g2:#4ac26b;--g3:#2da44e;--g4:#116329}html[data-theme=dark]{--bg:#0d1117;--surface:#161b22;--text:#f0f6fc;--muted:#8b949e;--line:#30363d;--link:#58a6ff;--header:#010409;--green:#3fb950;--g1:#0e4429;--g2:#006d32;--g3:#26a641;--g4:#39d353}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}.top{height:64px;background:var(--header);border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 28px;gap:18px}.mark{width:32px;height:32px;border:2px solid var(--text);border-radius:50%;display:grid;place-items:center;font-weight:700}.search{height:34px;width:320px;border:1px solid var(--line);border-radius:6px;color:var(--muted);padding:6px 12px}.top nav{margin-left:auto;display:flex;gap:16px;font-weight:600}.tabs{height:50px;border-bottom:1px solid var(--line);display:flex;justify-content:center;align-items:end;gap:28px}.tabs span{padding:14px 10px 11px}.tabs .active{font-weight:600;border-bottom:2px solid #fd8c73}.controls{position:fixed;z-index:20;right:18px;bottom:18px;display:flex;gap:6px;padding:7px;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 28px #0002}.controls button{border:1px solid var(--line);background:var(--bg);color:var(--text);padding:6px 9px;border-radius:6px;cursor:pointer}.clean .controls{display:none}.shell{max-width:1280px;margin:0 auto;padding:28px 32px;display:grid;grid-template-columns:296px minmax(0,896px);gap:30px}.sidebar{margin-top:-52px}.avatar{width:260px;aspect-ratio:1;border-radius:50%;border:1px solid var(--line);background:radial-gradient(circle at 48% 42%,#58a6ff 0 4%,transparent 5%),radial-gradient(circle,#192f4a 0 30%,#0d1117 31% 46%,#58a6ff 47% 48%,#161b22 49%);display:grid;place-items:center;color:#fff;font-size:40px;font-weight:600;letter-spacing:-3px}.sidebar h1{margin:14px 0 0;font-size:26px;line-height:1.15}.sidebar h2{margin:0;color:var(--muted);font-size:20px;font-weight:300}.bio{font-size:16px}.follow{width:100%;height:32px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-weight:600;border-radius:6px}.meta{list-style:none;padding:0;line-height:1.9;color:var(--muted)}.readme{border:1px solid var(--line);border-radius:6px;overflow:hidden}.readme-head{height:42px;background:var(--surface);border-bottom:1px solid var(--line);padding:10px 16px;font-weight:600}.markdown{padding:32px}.markdown h2{font-size:24px;border-bottom:1px solid var(--line);padding-bottom:8px;margin-top:32px}.markdown p{font-size:16px}.markdown ul{padding-left:22px}.markdown li{margin:7px 0}.markdown em{color:var(--muted);font-size:12px}.profile-visual{display:block;width:100%;height:auto;margin:4px 0 20px}.theme-settings-link{display:block;border-radius:12px}.theme-settings-link:hover{text-decoration:none}.strap{font-weight:600}.fine{font-size:12px!important;color:var(--muted)}.native{margin-top:24px}.native h2{font-size:16px}.pins{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pin{border:1px solid var(--line);border-radius:6px;padding:16px;min-height:112px}.pin div{display:flex;gap:8px;align-items:center;font-weight:600}.pin p{font-size:12px;color:var(--muted);height:36px}.pin small{display:flex;gap:8px;color:var(--muted)}.pin small i{width:12px;height:12px;border-radius:50%;background:#3178c6}.public{border:1px solid var(--line);border-radius:10px;padding:0 7px;color:var(--muted);font-size:11px;margin-left:auto}.activity{border:1px solid var(--line);border-radius:6px;padding:18px;overflow:hidden}.activity-head{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin-bottom:12px}.weeks{display:grid;grid-template-columns:repeat(52,1fr);gap:3px}.week{height:13px;background:var(--surface);border:1px solid var(--line);border-radius:2px}.week.l1{background:var(--g1);border-color:transparent}.week.l2{background:var(--g2);border-color:transparent}.week.l3{background:var(--g3);border-color:transparent}.week.l4{background:var(--g4);border-color:transparent}
html.mobile .top{padding:0 14px;height:56px}.mobile .search,.mobile .top nav{display:none}.mobile .tabs{justify-content:flex-start;overflow:hidden;padding-left:10px;gap:14px;white-space:nowrap}.mobile .shell{display:block;padding:16px;max-width:430px}.mobile .sidebar{margin:0 0 20px}.mobile .avatar{width:78px;float:left;margin-right:16px}.mobile .sidebar h1{padding-top:10px;font-size:22px}.mobile .sidebar h2{font-size:17px}.mobile .bio{clear:both;padding-top:14px}.mobile .readme{border-left:0;border-right:0;border-radius:0}.mobile .readme-head{display:none}.mobile .markdown{padding:20px 0}.mobile .markdown h2{font-size:20px}.mobile .pins{grid-template-columns:1fr}.mobile .controls{right:8px;bottom:8px}.mobile .controls button{font-size:11px;padding:5px}.mobile .weeks{width:720px}.mobile .activity{overflow-x:auto}
</style>
</head>
<body>
<header class="top"><div class="mark">⌁</div><div class="search">Type / to search</div><nav><span>Pull requests</span><span>Issues</span><span>Marketplace</span><span>Explore</span></nav></header>
<div class="tabs"><span class="active">Overview</span><span>Repositories <b>${telemetry.publicRepos}</b></span><span>Projects</span><span>Packages</span><span>Stars</span></div>
<div class="controls"><button data-action="theme">Light / Dark</button><button data-action="viewport">Desktop / Mobile</button><button data-action="motion">Motion / Reduced</button></div>
<main class="shell">
<aside class="sidebar"><div class="avatar" aria-label="Abstract circular signal avatar"></div><h1>Hakan Duyar</h1><h2>hakanduyar</h2><p class="bio">${PROFILE_COPY.strapline}</p><button class="follow">Follow</button><ul class="meta"><li>◉ ${telemetry.followers} followers</li><li>⌖ Turkey</li><li>◫ ${telemetry.publicRepos} public repositories</li></ul></aside>
<section>
<article class="readme"><div class="readme-head">hakanduyar / README.md</div><div class="markdown">
${profileImage('hero', 'Hakan Duyar circular identity field with Flight, Signal, and Spatial modes.', true)}
${profileImage('systems', 'Four selected systems arranged on a connected engineering path.', true, true)}
${profileImage('architecture', 'Interface, state, services, and delivery shown as spatial architecture layers.', true, true)}
${profileImage('signal', 'Measured 52-week public contribution signal and language distribution.', true, true)}
</div></article>
<section class="native"><h2>Pinned</h2><div class="pins">${pins}</div><h2>${telemetry.contributions.total.toLocaleString('en-US')} contributions in the last year</h2><div class="activity"><div class="activity-head"><span>52 complete measured weeks</span><span>${telemetry.activity.start} — ${telemetry.activity.end}</span></div><div class="weeks">${activity}</div></div></section>
</section>
</main>
<script>
const params=new URLSearchParams(location.search);const root=document.documentElement;
let theme=params.get('theme')==='dark'?'dark':'light';let mobile=params.get('mobile')==='1';let reduced=params.get('motion')==='reduce';let clean=params.get('clean')==='1';
function render(){root.dataset.theme=theme;root.classList.toggle('mobile',mobile);document.body.classList.toggle('clean',clean);const compact=mobile||innerWidth<=1080;document.querySelectorAll('.profile-visual').forEach((image)=>{image.src=reduced&&compact&&image.dataset.mobileStatic?image.dataset.mobileStatic:reduced&&image.dataset.static?image.dataset.static:compact&&image.dataset.mobile?image.dataset.mobile:image.dataset.desktop});}
document.querySelector('[data-action=theme]').onclick=()=>{theme=theme==='light'?'dark':'light';render()};
document.querySelector('[data-action=viewport]').onclick=()=>{mobile=!mobile;render()};
document.querySelector('[data-action=motion]').onclick=()=>{reduced=!reduced;render()};addEventListener('resize',render);render();
</script>
</body></html>`;

const out = resolve(REPO_ROOT, 'preview/index.html');
mkdirSync(resolve(REPO_ROOT, 'preview'), { recursive: true });
writeFileSync(out, html, 'utf8');
const heroStage = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;overflow:hidden}body{display:grid;place-items:center;background:#0d1117}img{display:block;width:890px;max-width:100vw;height:auto}</style></head><body><img alt="Hakan Duyar three-mode hero QA stage"><script>const p=new URLSearchParams(location.search);const reduced=p.get('motion')==='reduce';document.querySelector('img').src='../assets/generated/hero'+(reduced?'-static':'')+'-dark.svg';</script></body></html>`;
writeFileSync(resolve(REPO_ROOT, 'preview/hero-stage.html'), heroStage, 'utf8');
const sceneStage = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;overflow:hidden}body{display:grid;place-items:center;background:#0d1117}img{display:block;width:min(890px,100vw);height:auto}body.mobile img{width:min(390px,100vw)}</style></head><body><img alt="V4.2 scene animation QA stage"><script>const p=new URLSearchParams(location.search);const allowed=new Set(['hero','systems','architecture','signal']);const scene=allowed.has(p.get('scene'))?p.get('scene'):'hero';const reduced=p.get('motion')==='reduce';const mobile=p.get('mobile')==='1'&&scene!=='hero';const run=p.get('run');document.body.classList.toggle('mobile',mobile);const parts=[scene];if(mobile)parts.push('mobile');if(reduced)parts.push('static');parts.push('dark');document.querySelector('img').src='../assets/generated/'+parts.join('-')+'.svg'+(run?'?run='+encodeURIComponent(run):'');</script></body></html>`;
writeFileSync(resolve(REPO_ROOT, 'preview/scene-stage.html'), sceneStage, 'utf8');
console.log('[preview] wrote preview/index.html, preview/hero-stage.html, and preview/scene-stage.html');
