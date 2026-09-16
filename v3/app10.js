/* ============================================================
   P9 复盘观点(人工/AI复核结构化观点块)
   ============================================================ */
function renderEventCard(e){
  const tone=String(e.tone||"中性");
  const tc=/利[多好]|正面|偏多|回暖|上行/.test(tone)?"good":/利[空]|负面|偏空|承压|下行/.test(tone)?"bad":"mid";
  const seg=(lab,txt,c)=>txt?`<div class="ev-seg"><span class="ev-lab ${c}">${lab}</span><div class="ev-txt">${esc(String(txt))}</div></div>`:"";
  return `<div class="ev-card ev-${tc}">
    <div class="ev-head">${e.date?`<span class="ev-date">${esc(e.date)}</span>`:""}<span class="ev-tone tone-${tc}">${esc(tone)}</span><span class="ev-title">${esc(e.title||"")}</span></div>
    ${seg("事件数据",e.data,"d")}${seg("市场反应",e.reaction,"r")}${seg("评估",e.assess,"a")}
  </div>`;
}
function eventCardsBlock(){
  const cs=R.notes?.events_cards;
  if(Array.isArray(cs)&&cs.length)
    return `<div class="panel"><h3>当日核心事件 · 事件驱动卡片（利好/利空 · 事件数据 → 市场反应 → 评估）</h3><div class="ev-grid">${cs.map(renderEventCard).join("")}</div></div>`;
  return manualBlock("events","事件六要素（政策/产业/公司/海外/资金/监管，含来源与传导链）","结构化 events_cards（date/tone/title/data/reaction/assess）将自动渲染为统一卡片");
}
/* ---- 复盘观点3.0 结构化读取助手（数据来自 notes，空则回退人工块） ---- */
function rvArr(field){const v=getNoteRaw(field);if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean);if(typeof v==="string"&&v.trim())return v.split(/\n/).map(s=>s.trim()).filter(Boolean);return []}
function rvTxt(field){const v=getNoteRaw(field);return Array.isArray(v)?v.join("\n"):(v==null?"":String(v))}
function rvCard(no,title,sub,inner,cls){return `<section class="rv-card ${cls||""}"><div class="rv-head"><span class="rv-no">${no}</span><h3>${title}</h3>${sub?`<span class="rv-sub">${sub}</span>`:""}</div><div class="rv-body">${inner}</div></section>`}
function rvTextField(field,no,title,sub,cls){const t=rvTxt(field).trim();return rvCard(no,title,sub,t?`<div class="rv-prose ${cls||""}">${esc(t)}</div>`:manualBlock(field,title,""),cls)}
/* ② 论点论据（偏多/偏空） */
function rvArgs(){
  const bull=rvArr("bull"),bear=rvArr("bear");
  if(!bull.length&&!bear.length)return `<div class="grid g2">${manualBlock("bull","偏多因素（一行一条）","")}${manualBlock("bear","偏空因素（一行一条）","")}</div>`;
  const li=a=>a.map(x=>`<li>${esc(x.replace(/^[\s\-·•\d.、）)]+/,""))}</li>`).join("");
  return `<div class="rv-args">
    <div class="rv-side rv-bull"><h4>▲ 偏多论据（${bull.length}条）</h4><ul>${li(bull)}</ul></div>
    <div class="rv-side rv-bear"><h4>▼ 偏空论据（${bear.length}条）</h4><ul>${li(bear)}</ul></div></div>`;
}
/* ③ 核心驱动事件：点击标题折叠/展开 */
function rvEvents(){
  const cs=getNoteRaw("events_cards");
  if(!Array.isArray(cs)||!cs.length)return eventCardsBlock();
  const tc=t=>/利[多好]|正面|偏多|回暖|上行/.test(t)?"good":/利[空]|负面|偏空|承压|下行/.test(t)?"bad":"mid";
  return cs.map((e,i)=>{
    const c=tc(String(e.tone||"中性"));
    const seg=(lab,txt,k)=>txt?`<div class="rv-dseg"><span class="rv-dlab ${k}">${lab}</span><div class="rv-dtxt">${esc(String(txt))}</div></div>`:"";
    return `<details class="rv-seat" ${i===0?"open":""}>
      <summary><span class="ev-tone tone-${c}">${esc(e.tone||"中性")}</span><span class="rv-stitle">${i+1}. ${esc(e.title||"")}</span><span class="rv-arrow"></span></summary>
      <div class="rv-drv">${seg("事件数据",e.data,"d")}${seg("市场反应",e.reaction,"r")}${seg("评估",e.assess,"a")}</div></details>`;
  }).join("");
}
/* ④ 三情景：解析"基准（概率50%）：区间，描述"为表 */
function rvScenarios(){
  const arr=rvArr("scenarios");
  if(!arr.length)return `<div class="grid g2">${manualBlock("scenarios","次日三情景（基准/乐观/谨慎：概率+区间+应对）","")}${manualBlock("falsify","证伪信号（出现即推翻判断+对应仓位动作）","")}</div>`;
  const rows=arr.map(s=>{
    let m=s.match(/^(基准|乐观|谨慎|悲观|中性)[^（(：:]*[（(]?\s*概率?\s*(\d+\s*%)?\s*[)）]?\s*[:：]\s*([\s\S]*)$/);
    let name,prob,rest;if(m){name=m[1];prob=m[2]||"--";rest=m[3].trim()}else{name="情景";prob="--";rest=s}
    let rng="--",desc=rest;const rm=rest.match(/^([^，。；;]+)[，。；;]([\s\S]*)$/);
    if(rm){rng=rm[1];desc=rm[2]}
    return `<tr><td class="rv-scname">${esc(name)}</td><td class="rv-scprob">${esc(prob)}</td><td style="white-space:normal">${esc(rng)}</td><td style="white-space:normal">${esc(desc)}</td></tr>`;
  }).join("");
  const fal=rvArr("falsify");
  const falBox=fal.length?`<div class="rv-cal" style="margin-top:0"><h4>⚑ 量化证伪信号（出现即降权/减仓）</h4><ul class="rv-blist">${fal.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:manualBlock("falsify","证伪信号","");
  return `<div class="tbl-wrap"><table><thead><tr><th>情景</th><th>概率</th><th>指数区间/条件</th><th>推演与应对要点</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div style="margin-top:13px">${falBox}</div>`;
}
/* ⑥ 昨日候选池回溯（闭环） */
function rvPoolReview(){
  const cr=rvTxt("candidate_review").trim(),pr=rvTxt("pool_review").trim();
  const t=cr||pr;if(!t)return manualBlock("pool_review","昨日候选池回溯（昨日点名个股今日实际表现，对错复盘）","");
  return `<div class="rv-prose">${esc(t)}</div>${pr&&pr!==cr?`<div class="rv-prose" style="margin-top:10px">${esc(pr)}</div>`:""}`;
}
/* ⑦ 风险排除 */
function rvExclude(){
  const a=rvArr("pool_exclude");if(!a.length)return manualBlock("pool_exclude","今日风险排除（剔除/回避标的及原因，一行一条）","");
  return `<div class="rv-risk">${a.map(x=>`<div class="rv-rk">${esc(x.replace(/^[-·•\s]+/,""))}</div>`).join("")}</div>`;
}
/* ⑧ 次日入池：解析"名称 代码｜理由｜计划"为表（含入选理由+交易计划） */
function rvPoolNew(){
  const a=rvArr("pool_new");if(!a.length)return manualBlock("pool_new","次日入池观察（每项：名称 代码｜入选理由｜交易计划）","仅研究观察，不构成买卖建议、不承诺收益");
  const rows=a.map(s=>{
    const parts=s.split(/[｜|]/).map(x=>x.trim()).filter(Boolean);
    const code=(s.match(/\d{6}/)||[""])[0],isSec=!code;
    let first=parts[0]||s;let name=first.replace(/\d{6}/g,"").replace(/[（()）]/g,"").replace(/^[-·•\s]+/,"").trim()||first;
    let mid=parts.slice(1),plan="";
    if(mid.length){const last=mid[mid.length-1];if(/观察|不追|回踩|止损|止盈|逢低|轻仓|等|破|分散|配套|不超|上限/.test(last)){plan=last;mid=mid.slice(0,-1)}}
    let reason=mid.join("；")||(isSec?s:"");
    return `<tr><td class="rv-code">${esc(code||"板块")}</td><td class="rv-pn">${esc(name)}</td><td style="white-space:normal">${esc(reason)}</td><td style="white-space:normal">${esc(plan||"回踩/分歧日再评估，不追高")}</td></tr>`;
  }).join("");
  return `<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>标的</th><th>入选理由</th><th>交易计划</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="note-src" style="margin-top:8px">仅为研究观察标的，不构成买卖建议、不承诺收益；仓位遵循「逢低轻仓/回踩观察、禁止大阳线追高」纪律。</div>`;
}
/* ⑩ 近期事件 + 未核实诚实披露 */
function rvCalUnver(){
  const cal=rvArr("events_calendar"),uv=rvArr("unverified");
  const calBox=cal.length?`<ul class="rv-blist">${cal.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:'<span class="muted">待复核补充未来1-2周催化日历</span>';
  const uvBox=uv.length?`<ul class="rv-blist">${uv.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:'<span class="muted">无未核实项（全部数据已双源核实）</span>';
  return `<div class="grid g2">
    <div class="rv-cal"><h4>📅 近期关键事件关注</h4>${calBox}</div>
    <div class="rv-unverified"><h4>⚐ 未核实 / 口径差异诚实披露</h4>${uvBox}</div></div>`;
}
function renderReview(){
  const nature=rvTxt("nature").trim();
  return `<div class="rv-wrap">
    ${rvCard("①","市场定性 · 总论","结论先行（总）",nature?`<div class="rv-nature">${esc(nature)}</div>`:manualBlock("nature","市场定性（当前处于什么市场/阶段/总体仓位取向）",""))}
    ${rvCard("②","论点论据 · 偏多 vs 偏空","多空因素逐条对照（分）",rvArgs())}
    ${rvCard("③","核心驱动事件","点击标题展开 / 收起 · 事件数据 → 市场反应 → 评估",rvEvents())}
    ${rvCard("④","次日三情景推演 + 量化证伪信号","基准/乐观/谨慎概率与区间",rvScenarios())}
    ${rvCard("⑤","三重共振选股结论","技术面 × 情绪面 × 资金面",(()=>{const t=rvTxt("triple").trim();return t?`<div class="rv-triple">${esc(t)}</div>`:manualBlock("triple","三重共振结论","")})())}
    ${rvCard("⑥","昨日候选池回溯（闭环）","验证昨日关注、迭代选股",rvPoolReview())}
    ${rvCard("⑦","今日风险排除项","剔除/回避方向及原因",rvExclude())}
    ${rvCard("⑧","次日入池观察 · 入选理由与交易计划","可荐股口径 · 仅研究观察",rvPoolNew())}
    ${rvTextField("position","⑨","仓位与风控节奏","总仓位/单线上限/止损纪律","")}
    ${rvCalUnver()}
  </div>`}
function loadPool(){try{return JSON.parse(localStorage.getItem(POOL_KEY)||"[]")}catch(e){return []}}
function savePool(p){try{localStorage.setItem(POOL_KEY,JSON.stringify(p));toast("股票池已保存到本机浏览器")}catch(e){toast("保存失败")}}
function poolMark(code){
  const marks=[];
  const zt=(R.limit?.zt_items||[]).find(x=>x.code===code);
  if(zt)marks.push(`<span class="tagchip chip-up">${zt.lb}板涨停</span>`);
  const lhb=[...(R.lhb?.buy_top5||[]),...(R.lhb?.sell_top5||[])].find(x=>x.code===code);
  if(lhb)marks.push(`<span class="tagchip chip-gold">龙虎榜 ${signed(lhb.net_yi,2)}亿</span>`);
  const f10=[...(R.funds?.in_top10||[]),...(R.funds?.out_top10||[])].find(x=>x.code===code);
  if(f10)marks.push(`<span class="tagchip chip-blue">主力${signed(f10.main_yi)}亿</span>`);
  return marks.join(" ");
}
function pickRow(s){
  s=String(s);
  let m=s.match(/^(.*?)[（(](\d{6})[)）]\s*[:：]?\s*(.*)$/);
  if(m&&m[3]!==undefined)return `<div class="pick-row"><span class="pick-nm">${esc(m[1].trim())}<span class="code">${m[2]}</span></span><span class="pick-rs">${esc(m[3].trim())}</span></div>`;
  m=s.match(/^([^:：]{2,14})[:：](.*)$/);
  if(m)return `<div class="pick-row"><span class="pick-nm">${esc(m[1].trim())}</span><span class="pick-rs">${esc(m[2].trim())}</span></div>`;
  return `<div class="pick-row"><span class="pick-rs">${esc(s)}</span></div>`;
}
function pickPanel(title,arr,kind,hint){
  arr=Array.isArray(arr)?arr:[];
  if(!arr.length)return "";
  return `<div class="panel pick-panel pick-${kind}" style="margin-bottom:12px"><h3>${title}（${arr.length}）${hint?`<span style="font-weight:400;font-size:11px;color:var(--ink3)">${hint}</span>`:""}</h3>${arr.map(pickRow).join("")}</div>`;
}