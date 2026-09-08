/* ================= 应用主逻辑 2.0 ================= */
"use strict";
/* ---------- 工具 ---------- */
function f2(v,d="--"){return (v===null||v===undefined||v===""||Number.isNaN(v))?d:(+v).toFixed(2)}
function f1(v,d="--"){return (v===null||v===undefined||v==="")?d:(+v).toFixed(1)}
function f0(v,d="--"){return (v===null||v===undefined||v==="")?d:Math.round(+v).toLocaleString()}
function pct(v,d=1){return v===null||v===undefined?"--":(+v*100).toFixed(d)+"%"}
function signed(v,d=2){if(v===null||v===undefined||v==="")return "--";const x=+v;return (x>0?"+":"")+x.toFixed(d)}
function cls(v){return v>0?"up":v<0?"down":"flat"}
function arrow(v){return v>0?"▲":v<0?"▼":"—"}
function yiWan(v,d=2){return v===null||v===undefined?"--":(+v).toFixed(d)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}
function download(name,text,mime="text/plain;charset=utf-8"){
  const b=new Blob([text],{type:mime}),u=URL.createObjectURL(b),a=document.createElement("a");
  a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}
function copyText(t){navigator.clipboard.writeText(t).then(()=>toast("已复制到剪贴板")).catch(()=>{
  const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("已复制")})}
function badge(text,kind){return `<span class="badge b-${kind}">${esc(text)}</span>`}
function crowdZone(v){if(v==null)return["--","neutral"];if(v>=50)return["极端拥挤","danger"];if(v>=45)return["极度危险","danger"];if(v>=40)return["危险抱团","warn"];if(v>=35)return["偏高","warn"];return["健康","ok"]}
function fgZone(v){if(v==null)return["--","neutral"];if(v<25)return["极度恐惧","danger"];if(v<45)return["恐惧","warn"];if(v<=55)return["中性","neutral"];if(v<=75)return["贪婪","warn"];return["极度贪婪","danger"]}
function emoZone(z){return ({高位:"danger",偏暖:"warn",中性震荡:"neutral",偏冷:"warn",冰点:"danger"})[z]||"neutral"}
function techBadge(g){return ({极强:["极强","danger"],强:["强","info"],中性:["中性","neutral"],弱:["弱","warn"],极弱:["极弱","danger"]})[g]||[g,"neutral"]}
function contTag(t){return ({连续净流入:["连续净流入","ok"],连续净流出:["连续净流出","danger"],流出转流入:["流出转流入","info"],流入转流出:["流入转流出","warn"]})[t]||[t,"neutral"]}

/* ---------- 图表中心 ---------- */
function makeChart(id,option){
  const el=document.getElementById(id);if(!el||!window.echarts)return null;
  let c=CHARTS[id];
  if(!c){c=echarts.init(el);CHARTS[id]=c;
    if(window.ResizeObserver)new ResizeObserver(()=>c.resize()).observe(el)}
  c.setOption(option,true);return c}
function barBySign(v){return v>=0?UP:DOWN}

/* ---------- 数据状态 ---------- */
function loadDateScript(date){
  return new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src=`data/report_${date}.js?t=${Date.now()}`;
    s.onload=()=>{resolve(window.REPORT);s.remove()};
    s.onerror=()=>{s.remove();reject(new Error("missing "+date))};
    document.body.appendChild(s)})}
async function switchDate(date){
  try{const r=await loadDateScript(date);state.date=date;R=r;renderAll()}
  catch(e){toast("该日期数据缺失，请先运行更新脚本")}}

/* ---------- 11 页定义 ---------- */
function secBox(id,no,title,tag,inner){
  return `<section class="section" id="sec-${id}"><div class="sec-head">
  <span class="sec-no">${no}</span><h2>${title}</h2>${tag?`<span class="tag">${tag}</span>`:""}
  </div><div class="sec-body">${inner||""}</div></section>`}
function manualBlock(field,label,hint){
  return `<div class="manual" data-field="${field}"><span class="mlab">人工 · ${label}</span>
  <div class="view-text" data-view="${field}"></div>
  <div class="edit-hint">${hint||"直接编辑，退出复核模式后可导出复核稿保存。"}</div></div>`}

/* ============================================================
   人工解读·总-分-总 结构化美化（2026-09-08 第四批）
   把带 ①②③ 的人工长文解析为：总论卡 → 编号分述卡 → 综合研判卡；
   dict 关键位→支撑/压力双栏；list 风险/未核实→逐条卡。
   复核模式下仍回退为纯文本 contentEditable，退出复核自动恢复结构化。
   ============================================================ */
function insParse(raw){
  let t=String(raw==null?"":raw).replace(/\r/g,"").trim();
  let marks=[];
  for(let i=0;i<t.length;i++){const n=INS_CIRC.indexOf(t[i]);if(n>=0)marks.push({i,n:n+1});}
  let lead="",steps=[],sum="";
  if(marks.length){
    lead=t.slice(0,marks[0].i).replace(/[：:；;\s]+$/,"").trim();
    for(let k=0;k<marks.length;k++){
      const st=marks[k].i+1,en=k+1<marks.length?marks[k+1].i:t.length;
      steps.push({n:marks[k].n,text:t.slice(st,en).replace(/^[\s：:、.）)]+/,"").trim()});
    }
    const last=steps[steps.length-1];
    const m=last.text.match(INS_SUMCUT);
    if(m){const cut=m.index+1;const head=last.text.slice(0,cut).trim();sum=last.text.slice(cut).trim();if(head){last.text=head}else{steps.pop()}}
  }else{lead=t;}
  return {lead,steps,sum};
}
function insightProseHtml(field){
  const raw=getNote(field);
  if(raw==null||String(raw).trim()==="")return "";
  const {lead,steps,sum}=insParse(raw);const p=[];
  if(lead)p.push(`<div class="insight-lead">${esc(lead)}</div>`);
  if(steps.length)p.push(`<ol class="insight-steps">${steps.map(s=>`<li><span class="isn">${s.n}</span>${esc(s.text)}</li>`).join("")}</ol>`);
  if(sum)p.push(`<div class="insight-sum"><span class="islab">综合研判</span>${esc(sum)}</div>`);
  if(!p.length)p.push(`<div class="insight-prose">${esc(raw)}</div>`);
  return `<div class="insight">${p.join("")}</div>`;
}
function levelsHtml(field){
  const o=getNoteRaw(field);
  if(!o||typeof o!=="object")return "";
  const sup=o.support||o["支撑"]||o.sup||[],res=o.resistance||o["压力"]||o.res||[];
  const li=a=>(a||[]).map(x=>`<li>${esc(String(x).replace(/^[-·•\s]+/,""))}</li>`).join("");
  if(!(sup.length||res.length))return "";
  return `<div class="levels-grid">
    <div class="level-col lv-sup"><h4>▲ 关键支撑位</h4><ul>${li(sup)}</ul></div>
    <div class="level-col lv-res"><h4>▼ 关键压力位</h4><ul>${li(res)}</ul></div></div>`;
}
function _noteArr(field){
  const v=getNoteRaw(field);
  const a=Array.isArray(v)?v:(v?String(v).split(/\n/):[]);
  return a.map(x=>String(x).trim()).filter(Boolean);
}
function riskListHtml(field){
  const a=_noteArr(field);if(!a.length)return "";
  return `<div class="insight">${a.map((x,i)=>{
    let s=x,hot=/最高优先|拥挤度|45%|45 %|极度危险/.test(s),tag="";
    const tm=s.match(/^【([^】]+)】\s*/);if(tm){tag=tm[1];s=s.slice(tm[0].length)}
    return `<div class="risk-item ${hot?"hot":""}">${tag?`<span class="ritag">${esc(tag)}</span>`:`<span class="rin">${i+1}</span>`}${esc(s)}</div>`;
  }).join("")}</div>`;
}
function unvListHtml(field){
  const a=_noteArr(field);if(!a.length)return "";
  return `<div class="insight">${a.map((x,i)=>`<div class="unv-item"><span class="uin">${i+1}</span>${esc(x)}</div>`).join("")}</div>`;
}
function insightBlock(field,label,kind){
  return `<div class="manual insight-manual" data-field="${field}"><span class="mlab">人工 · ${label}</span>
  <div class="view-text" data-view="${field}" data-insight="${kind||"prose"}"></div></div>`;
}
function renderInsightView(view,field){
  const kind=view.dataset.insight||"prose";let h="";
  if(kind==="levels")h=levelsHtml(field);
  else if(kind==="risks")h=riskListHtml(field);
  else if(kind==="unverified")h=unvListHtml(field);
  else h=insightProseHtml(field);
  view.innerHTML=h||'<span class="placeholder-empty">待复核：开启右上角「复核模式」后在此填写</span>';
}

/* ============================================================
   渲染入口 / 页签
   ============================================================ */
function renderAll(){
  $("#loading").style.display="none";$("#content").style.display="block";
  $("#tabBar").innerHTML=PAGES.map(([id,t,no])=>
    `<button class="tab-btn2 ${state.page===id?"on":""}" data-page="${id}"><span class="tn">${no}</span>${t}</button>`).join("");
  $("#content").innerHTML=PAGES.map(([id])=>
    `<div class="page ${state.page===id?"active":""}" id="page-${id}"><div class="main">${(PAGE_RENDER[id]||(()=>""))()}</div></div>`).join("");
  drawAllCharts();
  bindManualEditable();
  applyNotesDraft();
  bindPool();
  bindOrgSort();
  refreshLeaderNum();
  fillSourceState();
}
function switchPage(id){
  state.page=id;
  $$(".tab-btn2").forEach(b=>b.classList.toggle("on",b.dataset.page===id));
  $$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+id));
  if(history.replaceState)history.replaceState(null,"","#"+id);
  // 切页时 resize 该页图表(隐藏容器尺寸为0的修正)
  setTimeout(()=>{$$(`#page-${id} .chart`).forEach(el=>{const c=CHARTS[el.id];if(c)c.resize()})},30);
}

/* ============================================================
   P0 首页总览
   ============================================================ */
function renderHome(){
  const ix=Object.fromEntries((R.indices||[]).map(x=>[x.name,x]));
  const sh=ix["上证指数"],kc=ix["科创50"],cy=ix["创业板指"],hs=ix["沪深300"],bj=ix["北证50"],sz50=ix["上证50"];
  const cr=R.crowding||{},tmt=R.tmt||{},fg=R.feargreed||{},bd=R.breadth||{},lm=R.limit||{};
  const [cz,ck]=crowdZone(cr.ratio),[fz,fk]=fgZone(fg.today);
  const emo=R.emotion||{},el=emo.latest||{},style=R.style||{},zp=R.zt_prev||{};
  const bk=(lab,val,sub,c)=>`<div class="bigkpi"><div class="lab">${lab}</div><div class="val ${c||""}">${val}</div><div class="sub">${sub||""}</div></div>`;
  const quad=(style.quadrants||[]).map(q=>`<div class="kpi"><div class="lab">${q.quad} · ${q.index}</div>
    <div class="val ${cls(q.chg)}" style="font-size:19px">${signed(q.chg)}%</div></div>`).join("");
  const bull=(R.notes?.bull||[]),bear=(R.notes?.bear||[]);
  const logicArr=(arr,ph,tone)=>{const a=Array.isArray(arr)?arr:(arr?String(arr).split(/\n/).filter(s=>s.trim()):[]);
    return a.length?`<ol class="logic-list ${tone}">${a.map((x,i)=>`<li data-n="${i+1}">${esc(typeof x==="object"?JSON.stringify(x):x)}</li>`).join("")}</ol>`
    :`<div class="placeholder-empty">${ph}</div>`;};
  return `<div class="section"><div class="sec-body">
    <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div style="flex:1;min-width:280px">
        <div style="font-size:12.5px;color:var(--ink3)">${R.meta.date} 收盘复盘 · 数据生成 ${R.meta.generated_at} · v${R.meta.version}</div>
        <div class="manual" style="margin-top:8px" data-field="headline"><span class="mlab">人工 · 一句话定调</span>
          <div class="view-text" data-view="headline"></div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${badge("拥挤度 "+f2(cr.ratio)+"% "+cz,ck)}${badge("TMT "+f2(tmt.ratio)+"%",tmt.ratio>=40?"warn":"ok")}
        ${badge("恐贪 "+f2(fg.today)+" "+fz,fk)}${badge("涨停"+(lm.zt_count??"--")+"/跌停"+(lm.dt_count??"--"),"info")}
        ${el.zone?badge("情绪 "+f1(el.score)+" "+el.zone,emoZone(el.zone)):""}
      </div>
    </div>
    <div class="home-grid">
      ${bk("上证指数",f2(sh?.close),`${arrow(sh?.chg_pct)} ${signed(sh?.chg_pct)}% · 成交${yiWan(sh?.amount_yi)}亿`,cls(sh?.chg_pct))}
      ${bk("创业板指",f2(cy?.close),`${arrow(cy?.chg_pct)} ${signed(cy?.chg_pct)}%`,cls(cy?.chg_pct))}
      ${bk("科创50",f2(kc?.close),`${arrow(kc?.chg_pct)} ${signed(kc?.chg_pct)}%`,cls(kc?.chg_pct))}
      ${bk("北证50",f2(bj?.close),`${arrow(bj?.chg_pct)} ${signed(bj?.chg_pct)}%`,cls(bj?.chg_pct))}
      ${bk("全市场成交",yiWan(cr.total_yi)+"亿",`沪深 ${yiWan(cr.sh_sz_yi)} + 北交 ${yiWan(cr.bj_yi)}`,"")}
      ${bk("涨/跌/平",`${f0(bd.up)}/${f0(bd.down)}`,`平${f0(bd.flat)} · 涨跌比${f2(bd.ratio)}`,bd.up>=bd.down?"up":"down")}
      ${bk("情绪周期分",el.score?f1(el.score):"--",el.zone?`${el.zone} · 近3日${el.trend}`:"窗口累积中",el.zone?emoZone(el.zone):"")}
      ${bk("昨日涨停今日",zp.money_effect?f2(zp.money_effect.avg)+"%":"--",zp.money_effect?`中位${f2(zp.money_effect.median)}% · 再涨停${pct(zp.money_effect.limit_up_again_rate)}`:"需两日归档",zp.money_effect?cls(zp.money_effect.avg):"")}
    </div>
    <div class="manual" style="margin-top:14px" data-field="core_summary"><span class="mlab">人工 · 核心结论（AI每日复核润色）</span>
      <div class="view-text home-prose" data-view="core_summary"></div></div>
  </div></div>

  <div class="grid g2">
    <div class="section"><div class="sec-body">
      <h3 style="font-size:13px;color:var(--ink);margin-bottom:8px">风格四象限（大盘价值/均衡 vs 小盘成长/硬核科技）</h3>
      <div class="kpi-strip">${quad}</div>
      <div class="kvline" style="margin-top:8px"><span class="k">剪刀差</span><span class="v">科创50 - 上证50 = <b class="${cls(style.scissor_kc_sz50)}">${signed(style.scissor_kc_sz50)} pct</b>
        ${style.strongest?`（最强：${esc(style.strongest.quad)}，最弱：${esc(style.weakest.quad)}）`:""}</span></div>
      <div class="chart sm" id="chart-style" style="height:200px;min-height:200px;margin-top:6px"></div>
    </div></div>
    <div class="section"><div class="sec-body">
      <h3 style="font-size:13px;color:var(--ink);margin-bottom:8px">短线情绪速览</h3>
      ${el.score?`<div class="kvline"><span class="k">情绪定位</span><span class="v">${badge(el.zone,emoZone(el.zone))} ${f1(el.score)}/100，较前日 <b class="${cls(-(el.chg||0))}">${signed(el.chg,1)}</b>，距窗口低点第 ${el.days_from_trough} 天，近3日${el.trend}（斜率${signed(el.slope,1)}）</span></div>`:'<div class="muted">情绪周期窗口累积中（需近10交易日）</div>'}
      <div class="kvline"><span class="k">涨停/跌停</span><span class="v">${lm.zt_count??"--"} / ${lm.dt_count??"--"} · 炸板${lm.zb_count??"--"} · 封板率${f1(lm.seal_rate)}%</span></div>
      ${zp.money_effect?`<div class="kvline"><span class="k">昨日涨停反馈</span><span class="v">${zp.prev_date}涨停${zp.prev_n}只→今日 均<b class="${cls(zp.money_effect.avg)}">${f2(zp.money_effect.avg)}%</b> / 中位${f2(zp.money_effect.median)}% / 翻红${pct(zp.money_effect.positive_rate)} / 再涨停${pct(zp.money_effect.limit_up_again_rate)}</span></div>`:""}
      <div class="manual" style="margin-top:8px" data-field="emotion_stage"><span class="mlab">人工 · 情绪周期定位</span>
        <div class="view-text" data-view="emotion_stage"></div></div>
    </div></div>
  </div>

  <div class="bullbear">
    <div class="side-col bull"><h4 class="up">多头逻辑（复核填写，5-6条）</h4>
      <div class="manual" data-field="bull" style="border:none;background:transparent;padding:0"><div class="view-text" data-view="bull" data-logic="tone-bull">${logicArr(bull,"待复核：开启复核模式，一行一条多头依据")}</div></div></div>
    <div class="side-col bear"><h4 class="down">空头/风险逻辑（复核填写，5-6条）</h4>
      <div class="manual" data-field="bear" style="border:none;background:transparent;padding:0"><div class="view-text" data-view="bear" data-logic="tone-bear">${logicArr(bear,"待复核：开启复核模式，一行一条空头/风险依据")}</div></div></div>
  </div>`}

/* ============================================================
   P1 全球宏观
   ============================================================ */
function renderGlobal(){
  const g=R.global||{},us=g.us_stocks||{},bonds=g.us_bonds||{};
  const usRow=(k)=>{const x=us[k];if(!x)return `<tr><td>${k}</td><td colspan="3" class="muted">未获取</td></tr>`;
    return `<tr><td>${k}</td><td class="r num">${f2(x.close)}</td><td class="r num ${cls(x.chg_pct)}">${signed(x.chg_pct)}%</td><td class="r num ${cls(x.chg)}">${signed(x.chg)}</td></tr>`};
  const m6=[
    ["比特币 BTC",g.btc&&(g.btc.gate??g.btc.sina),"美元",g.btc&&g.btc.gate_chg,"新浪+gate双源"],
    ["美债10Y",bonds.US10Y&&bonds.US10Y.yield,"%",bonds.US10Y&&(bonds.US10Y.bp_chg/100),`bp变动 ${bonds.US10Y?.bp_chg??"--"}；10Y-2Y/30Y-10Y倒挂监测见下`],
    ["COMEX黄金",g.gold&&g.gold.price,"美元/盎司",g.gold&&g.gold.chg_pct,"纽约金连续"],
    ["WTI原油",g.wti&&g.wti.price,"美元/桶",g.wti&&g.wti.chg_pct,`布油 ${f2(g.brent?.price)}`],
    ["美元指数DXY",(g.dxy_sina&&g.dxy_sina.price)??(g.dxy_em&&g.dxy_em.price),"",(g.dxy_sina&&g.dxy_sina.chg_pct)??(g.dxy_em&&g.dxy_em.chg_pct),"新浪/东财双源"],
    ["离岸人民币",g.usdcnh&&g.usdcnh.price,"",g.usdcnh&&g.usdcnh.chg_pct,"USDCNH"]
  ];
  const m6rows=m6.map(([name,v,u,chg,note])=>`<tr><td>${name}</td><td class="r num">${f2(v)} ${u}</td>
    <td class="r num ${cls(chg)}">${chg==null?"--":(chg>0?"+":"")+f2(chg)+"%"}</td><td class="muted" style="white-space:normal">${note}</td></tr>`).join("");
  const bondRow=k=>{const b=bonds[k];return `<tr><td>${k}</td><td class="r num">${b?f2(b.yield)+"%":"--"}</td>
    <td class="r num ${b&&cls(b.bp_chg)}">${b?signed(b.bp_chg,1)+"bp":"--"}</td></tr>`};
  const u2=bonds.US2Y?.yield,u10=bonds.US10Y?.yield,u30=bonds.US30Y?.yield;
  const inv102=(u10!=null&&u2!=null)?(u10-u2):null, inv3010=(u30!=null&&u10!=null)?(u30-u10):null;
  const sparkDefs=[["vix","VIX期货(近月,非现货)"],["us10y","美债10Y收益率%"],["us30y","美债30Y收益率%"],
    ["gold","COMEX黄金"],["lme_cu","LME铜"],["dxy","美元指数"],["dram","DRAM现货(人工)"],["wti","WTI原油(美元/桶)"]];
  const sparks=sparkDefs.map(([k,t])=>`<div class="spark-cell"><div class="t"><span>${t}</span><span class="v" id="sv-${k}"></span></div><div class="chart sm" id="spark-${k}" style="height:120px;min-height:120px"></div></div>`).join("");
  return `<div class="grid g-side">
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="panel"><h3>隔夜美股与AI龙头（新浪行情/东财双源交叉）</h3>
        <div class="tbl-wrap"><table><thead><tr><th>标的</th><th class="r">收盘</th><th class="r">涨跌幅</th><th class="r">涨跌点</th></tr></thead>
        <tbody>${["道琼斯","纳斯达克","标普500","费城半导体ETF(SOXX)","英伟达","AMD","台积电"].map(usRow).join("")}</tbody></table></div>
        <div class="note-src">SOXX为费半核心ETF；东财交叉：${
          Object.entries(g.us_cross_em||{}).map(([k,v])=>`${k} ${f2(v.close)}(${signed(v.chg_pct)}%)`).join(" / ")||"--"}</div>
      </div>
      <div class="panel"><h3>全球大类资产六项（抓取时刻快照，历史日重跑为当时值）</h3>
        <div class="tbl-wrap"><table><thead><tr><th>资产</th><th class="r">最新</th><th class="r">涨跌</th><th>口径/备注</th></tr></thead>
        <tbody>${m6rows}</tbody></table></div>
        <div class="note-src">VIX 为近月期货（现货无稳定免费自动源）；白银 ${f2(g.silver?.price)}。</div>
      </div>
      ${insightBlock("macro_interp","全球流动性综合判断 · 总-分-总","prose")}
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="panel"><h3>美债收益率曲线 + 倒挂监测</h3>
        <div class="tbl-wrap"><table><thead><tr><th>期限</th><th class="r">收益率</th><th class="r">变动</th></tr></thead>
        <tbody>${["US2Y","US5Y","US10Y","US30Y"].map(bondRow).join("")}</tbody></table></div>
        <div class="kvline" style="margin-top:6px"><span class="k">10Y-2Y</span><span class="v num ${cls(inv102)}">${signed(inv102,2)} pct ${inv102!=null&&inv102<0?badge("倒挂","danger"):badge("正常","ok")}</span></div>
        <div class="kvline"><span class="k">30Y-10Y</span><span class="v num ${cls(inv3010)}">${signed(inv3010,2)} pct ${inv3010!=null&&inv3010<0?badge("倒挂","warn"):""}</span></div>
        <div class="chart sm" id="chart-yieldcurve" style="height:180px;min-height:180px;margin-top:8px"></div>
      </div>
      <div class="panel"><h3>宏观指标趋势（每日收盘append）</h3>
        <div class="spark-grid">${sparks}</div>
        <div class="note-src">序列来自本地 macro_history.json，每交易日自动追加。</div>
      </div>
    </div>
  </div>`}

/* ============================================================
   P2 大盘分析(指数 + 三位一体60分 + 关键位)
   ============================================================ */
function renderMarket(){
  const rows=(R.indices||[]).map(x=>`<tr>
    <td>${x.name}</td><td class="r num">${f2(x.close)}</td>
    <td class="r num ${cls(x.chg_pct)}">${arrow(x.chg_pct)} ${signed(x.chg_pct)}</td>
    <td class="r num">${yiWan(x.amount_yi)}</td><td class="r num">${f2(x.turnover)}%</td>
    <td class="r num ${cls(x.amplitude)}">${f2(x.amplitude)}</td>
    <td class="r num">${f2(x.high)}</td><td class="r num">${f2(x.low)}</td></tr>`).join("");
  const uh=(R.hist&&R.hist.updown)||[];const prev=uh.length>=2?uh[uh.length-2]:null;
  const cmp=(a,b,fmt)=>{if(!a||b==null)return "--";const d=a-b;return `<span class="${cls(d)}">${d>0?"+":""}${fmt?fmt(d):d}</span>`};
  const techCards=(R.tech60||[]).map(t=>{
    const [g,k]=techBadge(t.grade);
    return `<div class="panel"><h3>${t.name} · 60分钟 ${badge(g,k)}</h3>
      <div class="kvline"><span class="k">最新/时间</span><span class="v num">${f2(t.price)} · ${esc(t.t)}</span></div>
      <div class="kvline"><span class="k">MA55</span><span class="v num">${f2(t.ma55)}（${t.above?'<span class="up">站上 ▲</span>':'<span class="down">跌破 ▼</span>'}，偏离 ${signed(t.dev)}%）</span></div>
      <div class="kvline"><span class="k">DIF/DEA</span><span class="v num">${f2(t.dif)} / ${f2(t.dea)}（零轴${t.zero_axis}方，柱 ${signed(t.bar)}，前柱 ${signed(t.bar_prev)}）</span></div>
      <div class="kvline"><span class="k">近4根收盘</span><span class="v num">${(t.last4_closes||[]).join(" → ")}</span></div>
      <div class="chart sm" id="kline-${t.name}" style="height:290px;min-height:290px;margin-top:8px"></div>
    </div>`}).join("");
  return `<div class="grid g2">
    <div class="panel"><h3>核心指数总览（东财+新浪60分K双源）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>指数</th><th class="r">收盘</th><th class="r">涨跌幅%</th>
      <th class="r">成交额亿</th><th class="r">换手%</th><th class="r">振幅%</th><th class="r">最高</th><th class="r">最低</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
      <div class="note-src">全市场成交额=上证综指(沪)+深证综指(深)+北交所个股合计，与全部个股求和交叉偏差&thinsp;0.5%内。</div>
    </div>
    <div class="panel"><h3>指数涨跌幅对比（红涨绿跌）</h3><div class="chart" id="chart-idxbar" style="height:300px"></div></div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>近20交易日涨跌家数 / 涨跌停</h3><div class="chart" id="chart-breadth" style="height:300px"></div></div>
    <div class="panel"><h3>沪深300 收盘走势（叠加恐贪）</h3><div class="chart" id="chart-hs300fg" style="height:300px"></div>
      <div class="note-src">柱=恐贪（右轴0-100，&lt;25极度恐惧），线=沪深300。</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>情绪指标环比（vs 前一交易日）</h3>
    <div class="tbl-wrap"><table><thead><tr><th>指标</th><th class="r">今日</th><th class="r">昨日</th><th class="r">变化</th></tr></thead><tbody>
      <tr><td>上涨家数</td><td class="r num">${f0(R.breadth?.up)}</td><td class="r num">${prev?f0(prev.up):"--"}</td><td class="r num">${prev?cmp(R.breadth.up,+prev.up,f0):"--"}</td></tr>
      <tr><td>下跌家数</td><td class="r num">${f0(R.breadth?.down)}</td><td class="r num">${prev?f0(prev.down):"--"}</td><td class="r num">${prev?cmp(R.breadth.down,+prev.down,f0):"--"}</td></tr>
      <tr><td>涨停</td><td class="r num up">${R.limit?.zt_count??"--"}</td><td class="r num">${prev?prev.lu:"--"}</td><td class="r num">${prev?cmp(R.limit.zt_count,+prev.lu,null):"--"}</td></tr>
      <tr><td>跌停</td><td class="r num down">${R.limit?.dt_count??"--"}</td><td class="r num">${prev?prev.ld:"--"}</td><td class="r num">${prev?cmp(R.limit.dt_count,+prev.ld,null):"--"}</td></tr>
    </tbody></table></div></div>

  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">8</span><h2>三位一体 · 60分钟技术分析</h2><span class="tag">MA55 + MACD 五级定档</span></div><div class="sec-body">
    <div class="note-src" style="margin-bottom:10px">MA55=近55根60分K收盘均值；DIF=EMA12-EMA26，DEA=DIF的9日EMA，柱=2×(DIF-DEA)。极强=站上MA55且DIF/DEA双正金叉；强=零轴上方金叉；中性=零轴缠绕；弱=零轴下方金叉收敛；极弱=跌破MA55且零轴下方死叉。</div>
    <div class="grid g3">${techCards}</div>
    <div style="margin-top:12px">${insightBlock("tech_detail","三位一体综合技术解读 · 总-分-总","prose")}</div>
  </div></div>

  <div class="grid g2" style="margin-top:14px">
    ${insightBlock("key_levels","关键支撑 / 压力位（跌破/站上对应动作）","levels")}
    ${insightBlock("triple","三重共振结论（技术面 × 情绪面 × 资金面）","prose")}
  </div>`}

/* ============================================================
   P3 涨停梯队 + 昨日涨停今日反馈
   ============================================================ */
function fmtFbt(v){if(v==null||v==="")return "--";const s=String(v).padStart(6,"0");return `${s.slice(0,2)}:${s.slice(2,4)}`}
