/* ================= 应用主逻辑 2.0 ================= */
"use strict";
/* ---------- 工具 ---------- */
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const UP="#d93026", DOWN="#0a8f4e", FLAT="#8a94a6", BLUE="#2b6fd4", BLUED="#1a3a6e", GOLD="#b0812e", AMBER="#e08a1e", PURPLE="#8a6bbf";
function f2(v,d="--"){return (v===null||v===undefined||v===""||Number.isNaN(v))?d:(+v).toFixed(2)}
function f1(v,d="--"){return (v===null||v===undefined||v==="")?d:(+v).toFixed(1)}
function f0(v,d="--"){return (v===null||v===undefined||v==="")?d:Math.round(+v).toLocaleString()}
function pct(v,d=1){return v===null||v===undefined?"--":(+v*100).toFixed(d)+"%"}
function signed(v,d=2){if(v===null||v===undefined||v==="")return "--";const x=+v;return (x>0?"+":"")+x.toFixed(d)}
function cls(v){return v>0?"up":v<0?"down":"flat"}
function arrow(v){return v>0?"▲":v<0?"▼":"—"}
function yiWan(v,d=2){return v===null||v===undefined?"--":(+v).toFixed(d)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
let toastTimer;
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
const CHARTS={};
function makeChart(id,option){
  const el=document.getElementById(id);if(!el||!window.echarts)return null;
  let c=CHARTS[id];
  if(!c){c=echarts.init(el);CHARTS[id]=c;
    if(window.ResizeObserver)new ResizeObserver(()=>c.resize()).observe(el)}
  c.setOption(option,true);return c}
const AXIS_STYLE={axisLine:{lineStyle:{color:"#c6d0e0"}},axisLabel:{color:"#7a869c",fontSize:11},
  splitLine:{lineStyle:{color:"#eef1f6"}},axisTick:{show:false}};
const TT={trigger:"axis",confine:true,backgroundColor:"#1a2f5a",borderWidth:0,textStyle:{color:"#fff",fontSize:12}};
function barBySign(v){return v>=0?UP:DOWN}

/* ---------- 数据状态 ---------- */
let R=null;
const state={date:null,review:false,notesDraft:null,page:"home"};
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
const PAGES=[
  ["home","首页总览","00"],["global","全球宏观","0"],["market","大盘分析","1"],
  ["ladder","涨停梯队","2"],["boards","热门板块","3"],["funds","资金流向","4"],
  ["lhb","龙虎榜","龙"],["riskdown","跌停与风险","5"],["emotion","情绪温度","6"],
  ["review","复盘观点","7"],["mypool","我的股票池","8"]
];
function secBox(id,no,title,tag,inner){
  return `<section class="section" id="sec-${id}"><div class="sec-head">
  <span class="sec-no">${no}</span><h2>${title}</h2>${tag?`<span class="tag">${tag}</span>`:""}
  </div><div class="sec-body">${inner||""}</div></section>`}
function manualBlock(field,label,hint){
  return `<div class="manual" data-field="${field}"><span class="mlab">人工 · ${label}</span>
  <div class="view-text" data-view="${field}"></div>
  <div class="edit-hint">${hint||"直接编辑，退出复核模式后可导出复核稿保存。"}</div></div>`}

/* ============================================================
   渲染入口 / 页签
   ============================================================ */
const PAGE_RENDER={home:renderHome,global:renderGlobal,market:renderMarket,ladder:renderLadder,
  boards:renderBoards,funds:renderFunds,lhb:renderLHB,riskdown:renderRiskDown,emotion:renderEmotionPage,
  review:renderReview,mypool:renderMyPool};
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
  const listArr=(arr,ph)=>arr.length?`<ul>${arr.map(x=>`<li>${esc(typeof x==="object"?JSON.stringify(x):x)}</li>`).join("")}</ul>`
    :`<div class="placeholder-empty">${ph}</div>`;
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
      <div class="view-text" data-view="core_summary"></div></div>
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
      <div class="manual" data-field="bull" style="border:none;background:transparent;padding:0"><div class="view-text" data-view="bull">${listArr(bull,"待复核：开启复核模式，一行一条多头依据")}</div></div></div>
    <div class="side-col bear"><h4 class="down">空头/风险逻辑（复核填写，5-6条）</h4>
      <div class="manual" data-field="bear" style="border:none;background:transparent;padding:0"><div class="view-text" data-view="bear">${listArr(bear,"待复核：开启复核模式，一行一条空头/风险依据")}</div></div></div>
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
    ["gold","COMEX黄金"],["lme_cu","LME铜"],["dxy","美元指数"],["dram","DRAM现货(人工)"]];
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
      <div class="manual" data-field="macro_interp"><span class="mlab">人工 · 全球流动性综合判断（1-2句）</span>
        <div class="view-text" data-view="macro_interp"></div></div>
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
    <div class="manual" style="margin-top:12px" data-field="tech_detail"><span class="mlab">人工 · 三位一体综合技术解读</span>
      <div class="view-text" data-view="tech_detail"></div></div>
  </div></div>

  <div class="grid g2" style="margin-top:14px">
    ${manualBlock("key_levels","关键支撑/压力位 + 证伪绑定动作（支撑位、压力位各一行，跌破/站上对应动作）","")}
    ${manualBlock("triple","三重共振结论（技术面+情绪面+资金面是否共振及方向）","")}
  </div>`}

/* ============================================================
   P3 涨停梯队 + 昨日涨停今日反馈
   ============================================================ */
function fmtFbt(v){if(v==null||v==="")return "--";const s=String(v).padStart(6,"0");return `${s.slice(0,2)}:${s.slice(2,4)}`}
function ladderStockTable(items){
  return `<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">连板</th><th class="r">涨幅%</th>
    <th class="r">收盘</th><th class="r">首次封板</th><th class="r">封单亿</th><th class="r">炸板次数</th><th class="r">成交亿</th><th class="r">换手%</th><th>行业</th></tr></thead><tbody>
    ${items.map(it=>`<tr><td class="code">${it.code}</td><td><b>${esc(it.name)}</b></td><td class="r num up">${it.lb}板</td>
    <td class="r num ${cls(it.chg)}">${signed(it.chg)}</td><td class="r num">${f2(it.price)}</td>
    <td class="r num">${fmtFbt(it.first_seal)}</td><td class="r num">${yiWan(it.seal_yi)}</td>
    <td class="r num ${(it.open_times||0)>0?"down":""}">${it.open_times||0}</td><td class="r num">${yiWan(it.amount_yi)}</td>
    <td class="r num">${f2(it.turnover)}</td><td style="white-space:normal;color:var(--ink3);font-size:11.5px">${esc(it.industry||"")}</td></tr>`).join("")}
  </tbody></table></div>`}
function renderLadder(){
  const lm=R.limit||{},zp=R.zt_prev||{};
  const all=(lm.ladder||[]);
  const high=all.filter(r=>r.lb>=3).flatMap(r=>r.items);
  const two=all.filter(r=>r.lb===2).flatMap(r=>r.items);
  const one=all.filter(r=>r.lb===1).flatMap(r=>r.items);
  const me=zp.money_effect,pr=zp.promotion,cp=zp.consec_premium,ld=zp.ladder||{};
  const promoCell=(p,lab)=>p?`<div class="kpi"><div class="lab">${lab}</div><div class="val" style="font-size:20px">${p.rate==null?"--":pct(p.rate)}</div><div class="sub">${p.k}/${p.n} 再封板</div></div>`:"";
  const moveRow=(x)=>`<tr><td class="code">${x.code}</td><td>${esc(x.name)}</td><td class="r num">${x.pb}板进</td>
    <td class="r num ${cls(x.ret)}"><b>${signed(x.ret)}%</b></td><td>${x.again?'<span class="tagchip chip-up">再涨停</span>':'<span class="tagchip chip-gray">未封</span>'}</td><td style="white-space:normal;color:var(--ink3);font-size:11.5px">${esc(x.industry||"")}</td></tr>`;
  return `<div class="kpi-strip">
    <div class="kpi"><div class="lab">涨停</div><div class="val up">${lm.zt_count??"--"}</div><div class="sub">收盘封死口径(东财)</div></div>
    <div class="kpi"><div class="lab">跌停</div><div class="val down">${lm.dt_count??"--"}</div><div class="sub">收盘跌停</div></div>
    <div class="kpi"><div class="lab">炸板</div><div class="val">${lm.zb_count??"--"}</div><div class="sub">封板率 ${f1(lm.seal_rate)}%</div></div>
    <div class="kpi"><div class="lab">最高板</div><div class="val">${all[0]?.lb??0}<span style="font-size:13px">板</span></div><div class="sub">${all[0]?.items.map(i=>i.name).join("、")||"--"}</div></div>
  </div>

  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">2A</span><h2>连板梯队分表（高度板 / 二连板 / 首板）</h2><span class="tag">封单·炸板次数·首封时间</span></div><div class="sec-body">
    <div class="panel" style="margin-bottom:12px"><h3 class="up">高度板（≥3板，市场总龙头所在）</h3>${high.length?ladderStockTable(high):'<div class="muted">无高度板</div>'}</div>
    <div class="panel" style="margin-bottom:12px"><h3>二连板（1进2成功，次日晋级候选）</h3>${two.length?ladderStockTable(two):'<div class="muted">无二连板</div>'}</div>
    <div class="panel"><h3>首板（${one.length}只，按封单额排序）</h3>${one.length?ladderStockTable(one):'<div class="muted">无首板</div>'}</div>
  </div></div>

  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">2B</span><h2>昨日涨停股 · 今日反馈（zt_prev 短线赚钱效应）</h2><span class="tag">${zp.prev_date?zp.prev_date+" → "+zp.date:"需连续两日归档"}</span></div><div class="sec-body">
    ${me?`<div class="kpi-strip">
      <div class="kpi"><div class="lab">平均涨幅</div><div class="val ${cls(me.avg)}">${signed(me.avg)}%</div><div class="sub">${zp.n}只样本(覆盖${pct(zp.coverage)})</div></div>
      <div class="kpi"><div class="lab">中位数涨幅</div><div class="val ${cls(me.median)}">${signed(me.median)}%</div><div class="sub">均值/中位背离以中位为准</div></div>
      <div class="kpi"><div class="lab">翻红率</div><div class="val">${pct(me.positive_rate)}</div><div class="sub">今日收红占比</div></div>
      <div class="kpi"><div class="lab">再涨停率</div><div class="val up">${pct(me.limit_up_again_rate)}</div><div class="sub">${me.n_again}只今日仍封板</div></div>
    </div>
    <div class="kpi-strip" style="margin-top:10px">
      ${promoCell(pr["1to2"],"1进2 晋级率")}${promoCell(pr["2to3"],"2进3 晋级率")}${promoCell(pr["3plus"],"3板+ 晋级率")}
      ${cp?`<div class="kpi"><div class="lab">连板溢价(昨日≥2板)</div><div class="val ${cls(cp.avg)}">${signed(cp.avg)}%</div><div class="sub">中位${signed(cp.median)}% · 翻红${pct(cp.positive_rate)} · n=${cp.n}</div></div>`:""}
    </div>
    <div class="kvline" style="margin-top:10px"><span class="k">梯队断层</span><span class="v">今日最高${ld.max_board}板，板位分布 ${esc(JSON.stringify(ld.counts))}；${ld.gaps&&ld.gaps.length?`缺 <b class="down">${ld.gaps.join("、")}档</b>（最高标悬空，接力需谨慎）`:"无断层，梯队完整"}；交叉校验 ${esc(zp.cross_check?.again_vs_lbc2||"--")}</span></div>
    <div class="grid g2" style="margin-top:10px">
      <div class="panel"><h3 class="up">反馈最强 Top5</h3><div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">板位</th><th class="r">今日涨幅</th><th class="r">状态</th><th>行业</th></tr></thead><tbody>${(zp.top_moves||[]).map(moveRow).join("")}</tbody></table></div></div>
      <div class="panel"><h3 class="down">反馈最弱 Top5</h3><div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">板位</th><th class="r">今日涨幅</th><th class="r">状态</th><th>行业</th></tr></thead><tbody>${(zp.bot_moves||[]).map(moveRow).join("")}</tbody></table></div></div>
    </div>
    <div class="note-src">${esc(zp.note||"")} 交叉校验：再涨停集合==今日连板(lbc≥2)集合。</div>`
    :'<div class="muted">昨日涨停反馈需连续两个交易日归档（明日自动生效）；当前为首个运行日。</div>'}
    <div class="manual" style="margin-top:12px" data-field="money_effect"><span class="mlab">人工 · 赚钱/亏钱效应（各3-5条，一行一条）</span>
      <div class="view-text" data-view="money_effect"></div></div>
  </div></div>`}

/* ============================================================
   P4 热门板块
   ============================================================ */
function indRow(x){return `<tr><td>${esc(x.name)}</td><td class="r num ${cls(x.avg_chg)}">${signed(x.avg_chg)}</td>
  <td class="r num up">${x.up}</td><td class="r num down">${x.down}</td><td class="r num">${x.flat}</td>
  <td class="r num">${yiWan(x.amount_yi)}</td><td class="r num ${cls(x.main_net_yi)}">${signed(x.main_net_yi)}</td></tr>`}
function conceptRow(x){return `<tr><td>${esc(x.name)}</td><td class="r num ${cls(x.chg)}">${signed(x.chg)}%</td>
  <td class="r num">${yiWan(x.amount_yi)}</td><td class="r num up">${x.up}</td><td class="r num down">${x.down}</td>
  <td class="r num">${f1(x.up_ratio)}%</td><td style="white-space:normal;color:var(--ink3)">${esc(x.leader||"")}</td></tr>`}
function renderBoards(){
  const inds=R.industries||{},con=R.concepts||{},cr=R.crowding||{};
  const top10=(cr.top10||[]).map((x,i)=>`<tr><td class="muted">${i+1}</td><td class="code">${x.code}</td><td>${esc(x.name)}</td>
    <td style="white-space:normal;color:var(--ink3);font-size:11.5px">${esc(x.industry||"")}</td>
    <td class="r num ${cls(x.chg)}">${signed(x.chg)}</td><td class="r num">${yiWan(x.amount_yi)}</td>
    <td class="r num ${cls(x.main_yi)}">${signed(x.main_yi)}</td></tr>`).join("");
  return `<div class="grid g2">
    <div class="panel"><h3>东财细分行业 · 涨幅前5（等权平均涨跌幅）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>行业</th><th class="r">均涨幅%</th><th class="r">涨</th><th class="r">跌</th><th class="r">平</th><th class="r">成交亿</th><th class="r">主力净亿</th></tr></thead>
      <tbody>${(inds.top5||[]).map(indRow).join("")}</tbody></table></div></div>
    <div class="panel"><h3>东财细分行业 · 跌幅前5</h3>
      <div class="tbl-wrap"><table><thead><tr><th>行业</th><th class="r">均涨幅%</th><th class="r">涨</th><th class="r">跌</th><th class="r">平</th><th class="r">成交亿</th><th class="r">主力净亿</th></tr></thead>
      <tbody>${(inds.bottom5||[]).map(indRow).join("")}</tbody></table></div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>行业涨跌幅条形（前5/后5）</h3><div class="chart" id="chart-indbar" style="height:330px"></div></div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>概念板块 · 红榜（上涨家数占比，已剔统计/泛题材，成分≥10）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>概念</th><th class="r">涨幅%</th><th class="r">成交亿</th><th class="r">涨</th><th class="r">跌</th><th class="r">上涨占比</th><th>领涨</th></tr></thead>
      <tbody>${(con.red5||[]).map(conceptRow).join("")}</tbody></table></div>
      <div class="note-src">红绿榜按板块内上涨家数占比排序，反映题材内部一致性。</div></div>
    <div class="panel"><h3>概念板块 · 绿榜</h3>
      <div class="tbl-wrap"><table><thead><tr><th>概念</th><th class="r">涨幅%</th><th class="r">成交亿</th><th class="r">涨</th><th class="r">跌</th><th class="r">上涨占比</th><th>领涨</th></tr></thead>
      <tbody>${(con.green5||[]).map(conceptRow).join("")}</tbody></table></div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>全市场成交额 Top10 个股（拥挤度前5%构成）</h3>
    <div class="tbl-wrap"><table><thead><tr><th>#</th><th>代码</th><th>名称</th><th>行业</th><th class="r">涨跌幅%</th><th class="r">成交额亿</th><th class="r">主力净亿</th></tr></thead>
    <tbody>${top10}</tbody></table></div></div>
  <div class="manual" style="margin-top:14px" data-field="industry_rotation"><span class="mlab">人工 · 板块轮动与题材归因</span>
    <div class="view-text" data-view="industry_rotation"></div></div>`}

/* ============================================================
   P5 资金流向
   ============================================================ */
function fundRow(x){return `<tr><td class="code">${x.code}</td><td>${esc(x.name)}</td>
  <td style="color:var(--ink3);white-space:normal;font-size:11.5px">${esc(x.industry||"")}</td>
  <td class="r num ${cls(x.chg)}">${signed(x.chg)}</td><td class="r num">${yiWan(x.amount_yi)}</td>
  <td class="r num ${cls(x.main_yi)}"><b>${signed(x.main_yi)}</b></td><td class="r num ${cls(x.big_yi)}">${signed(x.big_yi)}</td>
  <td class="r num ${cls(x.mid_yi)}">${signed(x.mid_yi)}</td><td class="r num ${cls(x.small_yi)}">${signed(x.small_yi)}</td></tr>`}
function renderFunds(){
  const cr=R.crowding||{},tmt=R.tmt||{},f=R.funds||{},mg=R.margin,nb=R.northbound||{};
  const [cz,ck]=crowdZone(cr.ratio),tp=tmt.parts||{};
  const cont=R.continuity||{rows:[]};
  const contRows=cont.rows.map(x=>{const[t,k]=contTag(x.tag);return `<tr><td>${esc(x.name)}</td>
    <td class="r num ${cls(x.prev_yi)}">${signed(x.prev_yi)}</td><td class="r num ${cls(x.today_yi)}"><b>${signed(x.today_yi)}</b></td>
    <td class="r num ${cls(x.chg_yi)}">${signed(x.chg_yi)}</td><td>${badge(t,k)}</td></tr>`}).join("");
  const fh=R.fund_hist||[];
  return `<div class="kpi-strip">
    <div class="kpi"><div class="lab">全市场拥挤度（前5%成交占比）</div><div class="val">${f2(cr.ratio)}%</div><div class="sub">${badge(cz,ck)} 前${cr.topn}/${cr.total_n}只 · ${yiWan(cr.top5_yi)}/${yiWan(cr.total_yi)}亿</div></div>
    <div class="kpi"><div class="lab">TMT 成交额占比</div><div class="val">${f2(tmt.ratio)}%</div><div class="sub">${yiWan(tmt.amount_yi)}亿（电子+通信+计算机+传媒）</div></div>
    <div class="kpi"><div class="lab">全市场成交额</div><div class="val">${yiWan(cr.total_yi)}<span style="font-size:13px">亿</span></div><div class="sub">沪深${yiWan(cr.sh_sz_yi)}+北交${yiWan(cr.bj_yi)}</div></div>
    <div class="kpi"><div class="lab">主力资金净额合计</div><div class="val ${cls(f.main_total_yi)}">${signed(f.main_total_yi)}<span style="font-size:13px">亿</span></div><div class="sub">超大单+大单（东财）</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>拥挤度 / TMT 走势（35偏高·40危险抱团·45极度·50极端）</h3>
    <div class="chart" id="chart-crowd" style="height:320px"></div>
    <div class="legend-inline"><span>电子 ${yiWan(tp["电子"])} · 通信 ${yiWan(tp["通信"])} · 计算机 ${yiWan(tp["计算机"])} · 传媒 ${yiWan(tp["传媒"])} 亿</span></div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>行业主力净流入 Top6</h3><div class="tbl-wrap"><table><thead><tr><th>行业</th><th class="r">均涨幅%</th><th class="r">成交亿</th><th class="r">主力净亿</th></tr></thead>
      <tbody>${(R.industries.in_top||[]).slice(0,6).map(x=>`<tr><td>${esc(x.name)}</td><td class="r num ${cls(x.avg_chg)}">${signed(x.avg_chg)}</td><td class="r num">${yiWan(x.amount_yi)}</td><td class="r num up">+${yiWan(x.main_net_yi)}</td></tr>`).join("")}</tbody></table></div></div>
    <div class="panel"><h3>行业主力净流出 Top6</h3><div class="tbl-wrap"><table><thead><tr><th>行业</th><th class="r">均涨幅%</th><th class="r">成交亿</th><th class="r">主力净亿</th></tr></thead>
      <tbody>${(R.industries.out_top||[]).slice(0,6).map(x=>`<tr><td>${esc(x.name)}</td><td class="r num ${cls(x.avg_chg)}">${signed(x.avg_chg)}</td><td class="r num">${yiWan(x.amount_yi)}</td><td class="r num down">${yiWan(x.main_net_yi)}</td></tr>`).join("")}</tbody></table></div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>行业资金两日连续性（vs ${esc(cont.prev_date||"前一交易日")}，识别持续流入/流出与切换）</h3>
    ${contRows?`<div class="tbl-wrap"><table><thead><tr><th>行业</th><th class="r">前日主力净亿</th><th class="r">今日主力净亿</th><th class="r">变化</th><th class="r">连续性</th></tr></thead><tbody>${contRows}</tbody></table></div>`
      :'<div class="muted">连续性需连续两个交易日完整归档，明日自动生效。</div>'}
    <div class="note-src">按今日主力净额绝对值前12行业与前一交易日对比：连续净流入=两日皆正，流出转流入=今日转正（潜在新主线），反之为切换信号。</div></div>
  <div class="panel" style="margin-top:14px"><h3>全市场主力资金净额序列（每日append，红正绿负）</h3>
    ${fh.length>=2?`<div class="chart sm" id="chart-fundhist" style="height:240px;min-height:240px"></div>`:'<div class="muted">序列累积中（需≥2个交易日）</div>'}</div>
  <div class="panel" style="margin-top:14px">
    <div style="display:flex;gap:8px;margin-bottom:10px"><h3 style="margin:0">个股主力资金 Top10</h3>
      <button class="tab-btn on" data-fundtab="in" style="margin-left:auto">净流入</button>
      <button class="tab-btn" data-fundtab="out">净流出</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th>行业</th><th class="r">涨跌%</th><th class="r">成交亿</th>
      <th class="r">主力净</th><th class="r">大单</th><th class="r">中单</th><th class="r">小单</th></tr></thead>
      <tbody id="fundTbody"></tbody></table></div></div>
  <div class="grid g3" style="margin-top:14px">
    <div class="panel"><h3>两融余额（T-1）</h3>
      ${mg?`<div class="kvline"><span class="k">数据日期</span><span class="v num">${mg.date}</span></div>
      <div class="kvline"><span class="k">融资余额</span><span class="v num">${yiWan(mg.rzye_yi)} 亿</span></div>
      <div class="kvline"><span class="k">融券余额</span><span class="v num">${yiWan(mg.rqye_yi)} 亿</span></div>
      <div class="kvline"><span class="k">两融合计</span><span class="v num"><b>${yiWan(mg.total_yi)} 亿</b></span></div>
      <div class="kvline"><span class="k">当日融资买入</span><span class="v num">${yiWan(mg.rzmre_yi)} 亿</span></div>`:'<div class="muted">未获取</div>'}</div>
    <div class="panel"><h3>北向资金</h3>
      <div class="kvline"><span class="k">状态</span><span class="v">${badge("净买入已停披露","neutral")}</span></div>
      <p class="muted" style="font-size:12.5px;margin-top:6px">${esc(nb.note||"自2024年8月起交易所停披露北向净买入，仅成交额口径，不代表资金方向。")}</p></div>
    <div class="manual" data-field="omo"><span class="mlab">人工 · 央行OMO/中间价</span><div class="view-text" data-view="omo" style="margin-top:6px"></div></div>
  </div>`}

/* ============================================================
   P6 龙虎榜
   ============================================================ */
function seatCell(x){
  const p=[];
  if(x.buy_inst||x.sell_inst)p.push(`机构买${x.buy_inst||0}/卖${x.sell_inst||0}`);
  if(x.buy_north||x.sell_north)p.push(`北向买${x.buy_north||0}/卖${x.sell_north||0}`);
  const txt=p.length?p.join(" "):`普通席位买${x.buy_n||0}/卖${x.sell_n||0}`;
  return `<td class="r num" title="${esc(x.seat_text||"")}" style="font-size:11px;white-space:normal;min-width:96px">${txt}</td>`}
function lhbRow(x,side){const themeField=side==="buy"?"lhb_theme":"lhb_signal";
  return `<tr><td class="code">${x.code}</td><td><b>${esc(x.name)}</b></td>
  <td class="r num ${cls(x.chg)}">${signed(x.chg)}</td><td class="r num ${cls(x.net_yi)}"><b>${signed(x.net_yi,3)}</b></td>
  <td class="r num">${yiWan(x.buy_yi,2)}</td><td class="r num">${yiWan(x.sell_yi,2)}</td>${seatCell(x)}
  <td style="white-space:normal;min-width:180px;font-size:11.5px;color:var(--ink2)">${esc(x.reason||"")}</td>
  <td class="manual-cell" data-field="${themeField}" data-code="${x.code}" style="white-space:normal;min-width:120px"></td></tr>`}
function renderLHB(){
  const l=R.lhb||{};
  const orgRows=(l.org||[]).map(x=>`<tr><td class="code">${x.code}</td><td>${esc(x.name)}</td>
    <td class="r num ${cls(x.chg)}">${signed(x.chg)}</td><td class="r num">${x.buy_times}</td><td class="r num">${x.sell_times}</td>
    <td class="r num up">${yiWan(x.buy_yi)}</td><td class="r num down">${yiWan(x.sell_yi)}</td>
    <td class="r num ${cls(x.net_yi)}"><b>${signed(x.net_yi,3)}</b></td></tr>`).join("");
  const ov=(l.ladder_overlap||[]).map(x=>`<span class="lb-stock">${x.lb}板 ${esc(x.name)}
    <span class="ind ${cls(x.net_yi)}">${signed(x.net_yi,2)}亿</span></span>`).join("")||'<span class="muted">无交集</span>';
  return `<div class="kpi-strip">
    <div class="kpi"><div class="lab">去重上榜个股</div><div class="val">${l.n_stocks??"--"}</div><div class="sub">原始条款 ${l.n_records??"--"}（同股多条款合并）</div></div>
    <div class="kpi"><div class="lab">龙虎榜净买额合计</div><div class="val ${cls(l.net_total_yi)}">${signed(l.net_total_yi)}<span style="font-size:13px">亿</span></div><div class="sub">买入席位-卖出席位</div></div>
    <div class="kpi"><div class="lab">净买入为正家数</div><div class="val up">${l.n_positive??"--"}</div><div class="sub">占上榜 ${l.n_stocks?f1(l.n_positive/l.n_stocks*100):"--"}%</div></div>
    <div class="kpi"><div class="lab">机构席位现身</div><div class="val">${(l.org||[]).length}</div><div class="sub">机构专用席位买卖</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>龙虎榜净买/净卖 Top5 对比</h3><div class="chart" id="chart-lhb" style="height:330px"></div></div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3 class="up">净买入 Top5（题材归因列复核填写）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌%</th><th class="r">净买亿</th><th class="r">买入</th><th class="r">卖出</th><th class="r">席位结构</th><th>上榜原因</th><th>题材归因(人工)</th></tr></thead>
      <tbody>${(l.buy_top5||[]).map(x=>lhbRow(x,"buy")).join("")}</tbody></table></div></div>
    <div class="panel"><h3 class="down">净卖出 Top5（信号：涨停出货/跌停出逃/高位滞涨）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌%</th><th class="r">净卖亿</th><th class="r">买入</th><th class="r">卖出</th><th class="r">席位结构</th><th>上榜原因</th><th>出货信号(人工)</th></tr></thead>
      <tbody>${(l.sell_top5||[]).map(x=>lhbRow(x,"sell")).join("")}</tbody></table></div></div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>机构专用席位明细（按净买卖绝对值排序）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌%</th><th class="r">买次</th><th class="r">卖次</th><th class="r">机构买亿</th><th class="r">机构卖亿</th><th class="r">净亿</th></tr></thead>
      <tbody>${orgRows}</tbody></table></div></div>
    <div class="panel"><h3>龙虎榜 ∩ 连板梯队</h3><div class="lb-stocks" style="margin:6px 0">${ov}</div>
      <div class="manual" data-field="lhb_interp" style="margin-top:10px"><span class="mlab">人工 · 游资进攻vs出货解读</span>
      <div class="view-text" data-view="lhb_interp"></div></div></div>
  </div>`}

/* ============================================================
   P7 跌停与风险 + 自检 + 源 + 免责
   ============================================================ */
function renderRiskDown(){
  const lm=R.limit||{};
  const dtRows=(lm.dt_items||[]).map(x=>`<tr><td class="code">${x.code}</td><td><b>${esc(x.name)}</b></td>
    <td class="r num ${cls(x.chg)}">${signed(x.chg)}%</td><td class="r num">${f2(x.price)}</td>
    <td class="r num">${yiWan(x.amount_yi)}</td><td class="r num">${f2(x.turnover)}%</td>
    <td style="white-space:normal;color:var(--ink3);font-size:11.5px">${esc(x.industry||"")}</td></tr>`).join("");
  const sc=R.selfcheck||{items:[],n_pass:0,n_total:0},warn=R.meta.warnings||[],src=R.meta.sources||{};
  const items=sc.items.map(c=>`<li>${c.pass?'<span class="badge b-ok">通过</span>':'<span class="badge b-danger">未过</span>'}
    <span>${esc(c.item)}</span><span class="muted num">${esc(Object.entries(c).filter(([k])=>!["item","pass"].includes(k)).map(([k,v])=>`${k}=${v}`).join("  "))}</span></li>`).join("");
  const srcRows=Object.entries(src).map(([k,v])=>`<li><b>${k}</b>：${esc(v)}</li>`).join("");
  return `<div class="section"><div class="sec-head"><span class="sec-no">5A</span><h2>跌停股全表（风险释放方向）</h2><span class="tag">收盘跌停 ${lm.dt_count??0} 只 · 炸板 ${lm.zb_count??0} 只</span></div><div class="sec-body">
    ${dtRows?`<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌幅</th><th class="r">收盘</th><th class="r">成交亿</th><th class="r">换手%</th><th>行业</th></tr></thead><tbody>${dtRows}</tbody></table></div>`
      :'<div class="muted">今日无跌停股</div>'}
  </div></div>
  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">5B</span><h2>风险提示（人工复核）</h2></div><div class="sec-body">
    ${manualBlock("risks","风险提示（外生冲击/流动性/情绪/交易拥挤/事件落空，一行一条）","")}
    ${manualBlock("unverified","未核实清单（传闻/单一信源/待确认数据，明确标注）","")}
  </div></div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>数据交叉验证自检（自动硬门禁）</h3>
      <div style="margin:6px 0">${badge(`通过 ${sc.n_pass}/${sc.n_total}`,sc.all_pass?"ok":"warn")}</div>
      <ul class="selfcheck">${items}</ul>
      ${warn.length?`<div style="margin-top:8px"><div class="muted">运行警告：</div><ul class="bul">${warn.map(w=>`<li>${esc(w.module)}: ${esc(w.msg)}</li>`).join("")}</ul></div>`:""}
    </div>
    <div class="panel"><h3>信息源清单（口径可追溯）</h3><ul class="bul">${srcRows}</ul>
      <div class="note-src">主源东方财富（push2ex涨停池/datacenter数据中心，收盘终值）；交叉源新浪财经（60分K/外盘/美股）、gate.io（BTC）；恐贪韭圈儿funddb加密接口；zt_prev/emotion由自有历史池本地实算。全部可在 update_daily.py 复算。</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>免责声明</h3>
  <p class="muted" style="font-size:12.5px;line-height:1.9">本工作台由本地程序自动抓取公开行情数据并聚合计算，主观结论为人工/AI复核的研究笔记。数据虽经双源交叉与自检门禁，仍可能因供应商口径、快照时点、接口调整产生偏差（已知口径差异：涨停家数东财收盘封死 vs 数据宝盘中触板；全市场成交额为交易所综合指数合成口径；VIX为近月期货非现货；情绪周期分为窗口内minmax相对值，跨日全量重算）。内容仅供个人投研学习，不构成投资建议、不写买入价位与仓位指令，不承诺收益，据此交易风险自担。市场有风险，投资需谨慎。</p></div>`}

/* ============================================================
   P8 情绪温度(恐贪 + 情绪周期 + 五维温度计 + 六阶段)
   ============================================================ */
function thermometerScores(){
  const lm=R.limit||{},bd=R.breadth||{};
  const maxLB=Math.max(0,...(lm.ladder||[]).map(x=>x.lb));
  const s1=Math.min(20,Math.round((lm.zt_count||0)/50*20));
  const s2=Math.min(20,Math.round(maxLB/7*20));
  const s3=Math.round((lm.seal_rate||0)/100*20);
  const s4=bd.total?Math.round(bd.up/bd.total*20):0;
  return {vals:[s1,s2,s3,s4],maxLB,totalAuto:s1+s2+s3+s4}}
function renderEmotionPage(){
  const fg=R.feargreed||{},[fz,fk]=fgZone(fg.today),th=thermometerScores();
  const emo=R.emotion||{},el=emo.latest||{},ser=emo.series||[];
  return `<div class="grid g2">
    <div class="panel"><h3>恐贪指数（韭圈儿官方 · 沪深300）</h3>
      <div class="kpi-strip">
        <div class="kpi"><div class="lab">今日恐贪</div><div class="val">${f2(fg.today)}</div><div class="sub">${badge(fz,fk)}</div></div>
        <div class="kpi"><div class="lab">昨日/环比</div><div class="val ${cls(fg.mom)}">${signed(fg.mom)}</div><div class="sub">沪深300 ${f2(fg.hs300)}</div></div>
      </div>
      <div class="chart sm" id="chart-fg" style="height:180px;min-height:180px;margin-top:8px"></div>
      <div class="note-src">0-25极度恐惧 / 25-45恐惧 / 45-55中性 / 55-75贪婪 / 75-100极度贪婪。</div>
    </div>
    <div class="panel"><h3>情绪周期曲线（近${emo.window||10}交易日三因子合成，0-100）</h3>
      ${el.score?`<div class="kvline"><span class="k">最新</span><span class="v">${badge(el.zone,emoZone(el.zone))} <b class="num">${f1(el.score)}</b>，较前日${signed(el.chg,1)}，近3日${el.trend}（斜率${signed(el.slope,1)}），距窗口低点(${el.trough_date} ${f1(el.trough_score)})第${el.days_from_trough}天</span></div>`
        :'<div class="muted">窗口累积中</div>'}
      <div class="chart sm" id="chart-emotion" style="height:258px;min-height:258px;margin-top:6px"></div>
      <div class="note-src">${esc(emo.note||"")}</div>
    </div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>五维情绪温度计（前四维自动，龙头健康度人工）</h3>
      <div class="chart sm" id="chart-thermo" style="height:270px;min-height:270px"></div>
      <div class="tbl-wrap"><table><thead><tr><th>维度</th><th class="r">得分</th><th>依据</th></tr></thead><tbody>
        <tr><td>涨停数量</td><td class="r num">${th.vals[0]}/20</td><td class="muted">涨停${R.limit?.zt_count}只，50只满分</td></tr>
        <tr><td>连板高度</td><td class="r num">${th.vals[1]}/20</td><td class="muted">最高${th.maxLB}板，7板满分</td></tr>
        <tr><td>封板率</td><td class="r num">${th.vals[2]}/20</td><td class="muted">封板率${f1(R.limit?.seal_rate)}%</td></tr>
        <tr><td>上涨占比</td><td class="r num">${th.vals[3]}/20</td><td class="muted">${f1(R.breadth?.up/(R.breadth?.total||1)*100)}%个股上涨</td></tr>
        <tr><td>龙头健康度（人工）</td><td class="r num manual-cell" data-field="leader_score" data-plain="1"></td><td class="muted">复核模式填0-20分及依据</td></tr>
      </tbody></table></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
      <div class="panel"><h3>情绪周期六阶段要素（对照定位）</h3>
        <div class="tbl-wrap"><table><thead><tr><th>阶段</th><th>典型特征</th></tr></thead><tbody>
          <tr><td><span class="tagchip chip-blue">启动</span></td><td style="white-space:normal">冰点后首板增多、炸板率回落、情绪分触底回升</td></tr>
          <tr><td><span class="tagchip chip-up">发酵</span></td><td style="white-space:normal">1进2晋级率走高、连板梯队成形、赚钱效应扩散</td></tr>
          <tr><td><span class="tagchip chip-up">高潮</span></td><td style="white-space:normal">最高板拔高、涨停数峰值、情绪分≥70高位，警惕一致</td></tr>
          <tr><td><span class="tagchip chip-gold">分歧</span></td><td style="white-space:normal">炸板率抬升、高位股震荡、晋级率分化、斜率走平转负</td></tr>
          <tr><td><span class="tagchip chip-gray">退潮</span></td><td style="white-space:normal">连板溢价转负、高标断层、再涨停率下台阶</td></tr>
          <tr><td><span class="tagchip chip-down">冰点</span></td><td style="white-space:normal">情绪分&lt;30、炸板率高企、涨停数低位，等待回暖信号</td></tr>
        </tbody></table></div>
        ${el.score?`<div class="note-src">自动定位：${esc(emo.position_text||"")}</div>`:""}
      </div>
      ${manualBlock("emotion_stage","人工 · 情绪周期最终定位（结合自动分与盘面，给出阶段+依据+次日观察）","")}
    </div>
  </div>`}

/* ============================================================
   P9 复盘观点(人工/AI复核结构化观点块)
   ============================================================ */
function renderReview(){
  return `<div class="grid g2">
    <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
      ${manualBlock("nature","市场定性（一句话：当前处于什么市场/什么阶段/总体仓位取向）","")}
      ${manualBlock("style_note","风格判断（价值/成长、大盘/小盘、科技/红利，结合风格四象限与剪刀差）","")}
      ${manualBlock("drivers","核心驱动 4-6个（三段式：事件/数据 → 市场反应 → 评估与持续性，一行一个）","")}
      ${manualBlock("events","事件六要素（政策/产业/公司/海外/资金/监管，含来源与传导链）","格式：事件 | 类别 | 利多/利空方向 | 传导链 | 来源 | 待验证点")}
      ${manualBlock("industry_logic","题材深度归因（为什么涨/能不能持续/验证信号）","")}
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
      ${manualBlock("scenarios","次日三情景（基准/乐观/悲观：概率+指数区间+应对要点，不写买卖价位）","")}
      ${manualBlock("falsify","证伪信号（什么信号出现就推翻当前判断，并绑定对应仓位动作）","")}
      ${manualBlock("position","仓位与风控（总仓位区间/单线上限/止损纪律，不构成投资建议）","")}
      ${manualBlock("pool_review","昨日候选池回溯（闭环验证：昨日点名个股今日实际表现，对错复盘）","")}
      ${manualBlock("pool_new","次日入池（必须带真实代码：名称 代码 逻辑 催化 风险，一行一只）","")}
      ${manualBlock("pool_exclude","风险排除（剔除/回避标的及原因）","")}
    </div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    ${manualBlock("events_calendar","未来1-2周催化日历（事件/日期/相关方向）","")}
    ${manualBlock("dram_note","DRAM/存储现货与小金属（自动源缺失，人工补价格与解读）","")}
  </div>
  <div class="verdict" style="margin-top:14px"><h3>三重共振结论</h3>
    <div class="manual" data-field="triple" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.3)"><div class="view-text" data-view="triple"></div></div>
    <p style="margin-top:8px">技术面（三位一体60分）× 情绪面（情绪周期/涨停反馈）× 资金面（主力/龙虎榜/拥挤度）三方同向为共振，分歧时降权。仅研究观察，不构成买卖建议。</p></div>`}

/* ============================================================
   P10 我的股票池(localStorage 增删改, 自动标注当日状态)
   ============================================================ */
const POOL_KEY="my_stock_pool_v2";
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
function renderMyPool(){
  const pool=loadPool();
  const groups=["核心观察","弹性","回避"];
  const preset=(R.notes?.pool_new||[]);
  const groupBlock=g=>{
    const items=pool.filter(x=>x.group===g);
    return `<div class="panel" style="margin-bottom:12px"><h3>${g}（${items.length}）</h3>
      ${items.length?`<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th>当日状态(自动匹配涨停/龙虎榜/主力)</th><th>逻辑/备注</th><th class="r">操作</th></tr></thead><tbody>
      ${items.map((x,i)=>`<tr><td class="code">${esc(x.code)}</td><td><b>${esc(x.name)}</b></td>
        <td style="white-space:normal">${poolMark(x.code)||'<span class="muted">--</span>'}</td>
        <td style="white-space:normal;min-width:220px">${esc(x.note||"")}</td>
        <td class="r"><button class="mini-btn del" data-pool-del="${pool.indexOf(x)}">删除</button></td></tr>`).join("")}
      </tbody></table></div>`:'<div class="muted">暂无</div>'}</div>`};
  return `<div class="section"><div class="sec-body">
    <div class="pool-add">
      <input id="poolCode" placeholder="代码 如000001" style="width:130px">
      <input id="poolName" placeholder="名称" style="width:120px">
      <select id="poolGroup">${groups.map(g=>`<option>${g}</option>`).join("")}</select>
      <input id="poolNote" placeholder="逻辑/催化/风险（可选）" style="flex:1;min-width:200px">
      <button class="mini-btn" id="poolAddBtn">＋ 加入股票池</button>
      <button class="mini-btn" id="poolPresetBtn" title="把复盘观点页 pool_new 里带代码的标的一键导入">导入次日入池(pool_new)</button>
      <button class="mini-btn del" id="poolClearBtn">清空</button>
    </div>
    <div class="note-src">股票池仅保存在本机浏览器（localStorage），不上传、不联网；切换交易日会自动匹配当日涨停梯队/龙虎榜/主力Top10做状态标注。预置来自复盘观点页「次日入池」。</div>
    ${preset.length?`<div class="manual" style="margin:10px 0"><span class="mlab">今日次日入池(人工)</span><div class="view-text" style="margin-top:4px">${esc(Array.isArray(preset)?preset.join("\n"):preset)}</div></div>`:""}
  </div></div>
  <div style="margin-top:14px">${groups.map(groupBlock).join("")}</div>`}
function bindPool(){
  const add=$("#poolAddBtn");if(!add)return;
  add.onclick=()=>{
    const code=$("#poolCode").value.trim(),name=$("#poolName").value.trim();
    if(!code){toast("请填写代码");return}
    const pool=loadPool();if(pool.some(x=>x.code===code)){toast("该代码已在池中");return}
    pool.push({code,name:name||code,group:$("#poolGroup").value,note:$("#poolNote").value.trim(),added:R.meta.date});
    savePool(pool);renderAll();switchPage("mypool")};
  const pc=$("#poolClearBtn");pc.onclick=()=>{if(confirm("确认清空整个股票池？")){savePool([]);renderAll();switchPage("mypool")}};
  const pp=$("#poolPresetBtn");pp.onclick=()=>{
    const raw=R.notes?.pool_new;if(!raw||(Array.isArray(raw)&&!raw.length)){toast("复盘观点页尚未填写次日入池");return}
    const text=Array.isArray(raw)?raw.join("\n"):String(raw);
    const pool=loadPool();let n=0;
    text.split(/\n/).forEach(line=>{const m=line.match(/(?:[（(]?)(\d{6})(?:[)）]?)/);
      if(m&&!pool.some(x=>x.code===m[1])){const nm=(line.replace(m[1],"").replace(/[（()）]/g,"").trim().split(/\s+/)[0])||m[1];
        pool.push({code:m[1],name:nm,group:"核心观察",note:line.trim(),added:R.meta.date});n++}});
    savePool(pool);toast(`已导入${n}只`);renderAll();switchPage("mypool")};
  $$("[data-pool-del]").forEach(b=>b.onclick=()=>{const pool=loadPool();pool.splice(+b.dataset.poolDel,1);savePool(pool);renderAll();switchPage("mypool")});
}

/* ============================================================
   人工复核字段
   ============================================================ */
function notes(){if(!state.notesDraft){state.notesDraft=JSON.parse(JSON.stringify(R.notes||{}))}return state.notesDraft}
function noteText(v){
  if(v==null)return "";
  if(typeof v==="string")return v;
  if(typeof v==="number")return String(v);
  if(Array.isArray(v))return v.map(x=>typeof x==="object"?JSON.stringify(x):String(x)).join("\n");
  const labels={win:"【赚钱效应】",lose:"【亏钱效应】",core:"【核心观察】",flex:"【弹性】",avoid:"【回避】"};
  return Object.entries(v).map(([k,a])=>{const t=noteText(a);return t?((labels[k]||("【"+k+"】"))+"\n"+t):null}).filter(Boolean).join("\n")
}
function getNote(field,code){const n=notes();let v=n[field];if(code)v=(v&&v[code])||"";return noteText(v)}
function setNote(field,val,code){const n=notes();if(code){n[field]=n[field]||{};n[field][code]=val||""}else n[field]=val}
function bindManualEditable(){
  $$(".manual").forEach(box=>{
    const field=box.dataset.field,view=box.querySelector("[data-view]");
    if(!view)return;
    view.style.whiteSpace="pre-wrap";
    const v=getNote(field);
    if(view.dataset.bound)return; // 保留 renderHome 预置的占位
    view.innerHTML=v?esc(v):'<span class="placeholder-empty">待复核：开启右上角「复核模式」后在此填写</span>';
  });
  $$(".manual-cell").forEach(td=>{
    const {field,code}=td.dataset;const v=getNote(field,code);
    td.innerHTML=v?esc(v):'<span class="placeholder-empty">待填</span>';td.style.whiteSpace="pre-wrap";
  });
  $$("[contenteditable]").forEach(el=>el.remove());
  if(state.review){
    $$(".manual .view-text").forEach(view=>{
      const box=view.closest(".manual"),field=box.dataset.field;
      view.contentEditable="true";
      const v=getNote(field);view.textContent=v||"";
      view.addEventListener("input",()=>{setNote(field,view.textContent);persistDraft()})
    });
    $$(".manual-cell").forEach(td=>{
      td.contentEditable="true";const v=getNote(td.dataset.field,td.dataset.code);td.textContent=v||"";
      td.addEventListener("input",()=>{setNote(td.dataset.field,td.textContent,td.dataset.code);persistDraft()})
    })
  }
}
function persistDraft(){try{localStorage.setItem("review_"+state.date,JSON.stringify(notes()))}catch(e){}}
function applyNotesDraft(){
  const saved=localStorage.getItem("review_"+state.date);
  if(saved){try{state.notesDraft=JSON.parse(saved)}catch(e){}}
  bindManualEditable();
  if(window.echarts){const c=CHARTS["chart-thermo"];if(c)drawAllCharts()}
}
function exportNotes(){
  const n=notes();download(`notes_${state.date}.json`,JSON.stringify(n,null,2),"application/json;charset=utf-8");
  toast("复核稿已下载，请放入 data/ 目录，下次更新自动合并")}

/* ============================================================
   导出
   ============================================================ */
function idxMap(){return Object.fromEntries((R.indices||[]).map(x=>[x.name,x]))}
function mdTable(head,rows){return `| ${head.join(" | ")} |\n|${head.map(()=>"---").join("|")}|\n`+
  rows.map(r=>`| ${r.join(" | ")} |`).join("\n")}
function buildMarkdown(){
  const im=idxMap(),cr=R.crowding,tmt=R.tmt,fg=R.feargreed,lm=R.limit,L=[];
  const n=notes();const NT=(k,f)=>noteText(n[k])||(f||"（待复核补充）");
  L.push(`# A股每日复盘 ${R.meta.date}`,"",n.headline||">（待填一句话定调）","");
  // 风格与情绪速览
  const st=R.style,emo=R.emotion?.latest,zp=R.zt_prev;
  if(st)L.push(`风格四象限：上证50 ${signed(st.quadrants?.find(q=>q.index==="上证50")?.chg)}% / 沪深300 ${signed(st.quadrants?.find(q=>q.index==="沪深300")?.chg)}% / 创业板 ${signed(st.quadrants?.find(q=>q.index==="创业板指")?.chg)}% / 科创50 ${signed(st.quadrants?.find(q=>q.index==="科创50")?.chg)}%；科创50-上证50剪刀差 ${signed(st.scissor_kc_sz50)} pct。`,"");
  if(emo)L.push(`情绪周期：${emo.zone} ${f1(emo.score)}/100，环比${signed(emo.chg,1)}，近3日${emo.trend}，距窗口低点第${emo.days_from_trough}天。`,"");
  if(zp?.money_effect)L.push(`昨日涨停反馈：${zp.prev_date}涨停${zp.prev_n}只→今日均${signed(zp.money_effect.avg)}%/中位${signed(zp.money_effect.median)}%/翻红${pct(zp.money_effect.positive_rate)}/再涨停${pct(zp.money_effect.limit_up_again_rate)}；1进2 ${pct(zp.promotion["1to2"].rate)}、2进3 ${pct(zp.promotion["2to3"].rate)}、3板+ ${pct(zp.promotion["3plus"].rate)}。`,"");
  L.push("## 〇、全球宏观流动性");
  const g=R.global||{};
  L.push("### 隔夜美股",mdTable(["标的","收盘","涨跌幅%"],Object.entries(g.us_stocks||{}).map(([k,v])=>[k,f2(v.close),signed(v.chg_pct)])));
  L.push("",mdTable(["资产","最新","涨跌"],[
    ["BTC",f2(g.btc?.gate??g.btc?.sina),f2(g.btc?.gate_chg)],
    ["美债10Y",f2(g.us_bonds?.US10Y?.yield)+"%",signed(g.us_bonds?.US10Y?.bp_chg,1)+"bp"],
    ["COMEX黄金",f2(g.gold?.price),signed(g.gold?.chg_pct)+"%"],
    ["WTI原油",f2(g.wti?.price),signed(g.wti?.chg_pct)+"%"],
    ["美元指数",f2(g.dxy_sina?.price??g.dxy_em?.price),signed(g.dxy_sina?.chg_pct??g.dxy_em?.chg_pct)+"%"],
    ["离岸人民币",f2(g.usdcnh?.price),signed(g.usdcnh?.chg_pct)+"%"]]),"");
  L.push(n.macro_interp||"（待填全球流动性判断）","");
  L.push("## 一、核心指数表现",mdTable(["指数","收盘","涨跌幅%","成交额亿","换手%"],
    (R.indices||[]).filter(x=>x.name!=="深证综指").map(x=>[x.name,f2(x.close),signed(x.chg_pct),yiWan(x.amount_yi),f2(x.turnover)])));
  L.push(`\n涨${R.breadth.up}/跌${R.breadth.down}/平${R.breadth.flat}；涨停${lm.zt_count}/跌停${lm.dt_count}；全市场成交${yiWan(cr.total_yi)}亿（沪深${yiWan(cr.sh_sz_yi)}+北交${yiWan(cr.bj_yi)}）。`,"");
  L.push("## 二、板块与题材");
  L.push("行业涨幅前5："+(R.industries.top5||[]).map(x=>`${x.name}${signed(x.avg_chg)}%`).join("、"));
  L.push("行业跌幅前5："+(R.industries.bottom5||[]).map(x=>`${x.name}${signed(x.avg_chg)}%`).join("、"));
  L.push("概念红榜："+(R.concepts.red5||[]).map(x=>`${x.name}(${f1(x.up_ratio)}%)`).join("、"));
  L.push("概念绿榜："+(R.concepts.green5||[]).map(x=>`${x.name}(${f1(x.up_ratio)}%)`).join("、"),"");
  L.push(n.industry_rotation||"（待填板块轮动归因）","");
  L.push("## 三、拥挤度与资金结构");
  L.push(`- 全市场拥挤度 **${f2(cr.ratio)}%**（前${cr.topn}只${yiWan(cr.top5_yi)}/${yiWan(cr.total_yi)}亿，${crowdZone(cr.ratio)[0]}）`);
  L.push(`- TMT占比 **${f2(tmt.ratio)}%**（电子${yiWan(tmt.parts["电子"])}、通信${yiWan(tmt.parts["通信"])}、计算机${yiWan(tmt.parts["计算机"])}、传媒${yiWan(tmt.parts["传媒"])}亿）`);
  if(R.margin)L.push(`- 两融(${R.margin.date})合计${yiWan(R.margin.total_yi)}亿，融资余额${yiWan(R.margin.rzye_yi)}亿`);
  L.push("- 北向净买入2024年8月起停披露，仅成交额口径",n.omo?("- 央行OMO："+n.omo):"","");
  L.push("## 龙虎榜专区");
  const l=R.lhb;
  L.push(`去重上榜${l.n_stocks}只（条款${l.n_records}），净买合计${signed(l.net_total_yi)}亿，净买为正${l.n_positive}只。`);
  L.push(mdTable(["净买Top5","涨跌%","净买亿","题材归因(人工)"],(l.buy_top5||[]).map(x=>[x.name,signed(x.chg),signed(x.net_yi,3),(n.lhb_theme||{})[x.code]||""])));
  L.push(mdTable(["净卖Top5","涨跌%","净卖亿","信号(人工)"],(l.sell_top5||[]).map(x=>[x.name,signed(x.chg),signed(x.net_yi,3),(n.lhb_signal||{})[x.code]||""])));
  L.push("龙虎榜∩连板："+(l.ladder_overlap||[]).map(x=>`${x.lb}板${x.name}(${signed(x.net_yi)}亿)`).join("、"));
  L.push(n.lhb_interp||"（待填游资解读）","");
  L.push("## 四、情绪与连板梯队");
  L.push(`恐贪${f2(fg.today)}（${fgZone(fg.today)[0]}，环比${signed(fg.mom)}）；最高${thermometerScores().maxLB}板；封板率${f1(lm.seal_rate)}%。`);
  (lm.ladder||[]).forEach(r=>L.push(`- ${r.lb}板×${r.count}：${r.items.map(i=>i.name).join("、")}`));
  L.push("",NT("emotion_stage","（待填情绪周期）"),"",NT("money_effect","（待填赚钱/亏钱效应）"),"");
  L.push("## 八、三位一体60分钟");
  (R.tech60||[]).forEach(t=>L.push(`- ${t.name}：**${t.grade}**，收${f2(t.price)}，MA55=${f2(t.ma55)}（${t.above?"站上":"跌破"}），DIF=${f2(t.dif)}、DEA=${f2(t.dea)}、柱${signed(t.bar)}`));
  L.push("",NT("tech_detail"),"");
  L.push("## 五/七、事件与观点",NT("nature"),"",NT("drivers"),"",NT("events"),"",NT("events_calendar","（无催化日历）"),NT("dram_note",""),NT("unverified","（无未核实项）"),"");
  L.push("## 九、次日策略与候选池",NT("scenarios"),"",NT("falsify","（无）"),"",NT("position"),"",NT("pool_review","（无候选池回溯）"),NT("pool_new","（无次日入池）"),"");
  L.push("## 十、风险提示",NT("risks","（待填）"),"","---",
    `数据自检：${R.selfcheck.n_pass}/${R.selfcheck.n_total} 通过。本报告仅为研究观察，不构成投资建议。市场有风险，投资需谨慎。`);
  return L.join("\n")
}
function buildPlainText(){return buildMarkdown().replace(/[#*`>|]/g,"").replace(/\n{3,}/g,"\n\n").replace(/^---$/gm,"")}
function exportHtmlSnapshot(){
  const clone=document.documentElement.cloneNode(true);
  document.querySelectorAll(".chart").forEach(el=>{
    const id=el.id,c=CHARTS[id],srcEl=clone.querySelector("#"+id);
    if(c&&srcEl){const img=document.createElement("img");img.src=c.getDataURL({pixelRatio:2,backgroundColor:"#fff"});
      img.style.width="100%";srcEl.innerHTML="";srcEl.appendChild(img)}});
  clone.querySelectorAll("script").forEach(s=>s.remove());
  clone.querySelectorAll(".top-controls,.tabbar,.toast,.modal-mask,.pool-add").forEach(s=>s.remove());
  clone.querySelectorAll(".page").forEach(p=>p.classList.add("active"));
  clone.querySelectorAll("[contenteditable]").forEach(s=>s.removeAttribute("contenteditable"));
  download(`复盘快照_${state.date}.html`,'<!DOCTYPE html>\n'+clone.outerHTML,"text/html;charset=utf-8");toast("精美HTML快照已导出")
}

/* ============================================================
   源状态 / 初始化
   ============================================================ */
function fillSourceState(){
  const w=R.meta.warnings||[],sc=R.selfcheck||{};const el=$("#srcState");
  if(w.length)el.innerHTML=`<span class="dot a"></span>${w.length}条警告 · 自检${sc.n_pass}/${sc.n_total}`;
  else if(sc.all_pass)el.innerHTML=`<span class="dot g"></span>数据源正常 · 自检全通过`;
  else el.innerHTML=`<span class="dot a"></span>自检${sc.n_pass}/${sc.n_total}`
}
function initDateSelect(){
  const sel=$("#dateSelect"),dates=(window.DATES||[]).slice().sort().reverse();
  sel.innerHTML=dates.map(d=>`<option ${d===state.date?"selected":""}>${d}</option>`).join("");
  sel.onchange=()=>switchDate(sel.value)
}
function bindUI(){
  // 页签切换(事件委托)
  $("#tabBar").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)switchPage(b.dataset.page)});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-fundtab]");if(b)switchFundTab(b.dataset.fundtab)});
  $("#reviewBtn").onclick=()=>{
    state.review=!state.review;document.body.classList.toggle("review",state.review);
    $("#reviewBtn").classList.toggle("on",state.review);
    $("#reviewBtn").textContent=state.review?"退出复核":"复核模式";
    if(state.review){if(!$("#saveNotesBtn")){const b=document.createElement("button");b.className="btn btn-gold";b.id="saveNotesBtn";b.textContent="保存复核稿";b.onclick=exportNotes;$("#reviewBtn").after(b)}}
    else{const b=$("#saveNotesBtn");if(b)b.remove();persistDraft()}
    bindManualEditable();toast(state.review?"复核模式：可编辑所有琥珀色区域":"已退出复核，编辑已暂存本地")
  };
  $("#exportMdBtn").onclick=()=>{const t=buildMarkdown();download(`复盘_${state.date}.md`,t,"text/markdown;charset=utf-8");$("#modalText").value=t;};
  $("#exportTxtBtn").onclick=()=>{const t=buildPlainText();copyText(t);download(`复盘公众号_${state.date}.txt`,t)};
  $("#exportHtmlBtn").onclick=exportHtmlSnapshot;
  $("#loadFileBtn").onclick=()=>$("#fileInput").click();
  $("#fileInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{try{R=JSON.parse(rd.result);state.date=R.meta.date;renderAll();toast("已载入 "+state.date)}catch(err){toast("JSON解析失败")}};rd.readText(f)};
  $("#modalClose").onclick=()=>$("#modalMask").classList.remove("show");
  $("#modalCopy").onclick=()=>copyText($("#modalText").value);
}
window.addEventListener("DOMContentLoaded",()=>{
  bindUI();
  const h=location.hash.replace("#","").replace("page-","");
  if(PAGES.some(p=>p[0]===h))state.page=h;
  window.addEventListener("hashchange",()=>{const x=location.hash.replace("#","").replace("page-","");if(PAGES.some(p=>p[0]===x))switchPage(x)});
  if(window.LATEST){R=window.LATEST;state.date=R.meta.date;initDateSelect();
    const boot=()=>{if(window.echarts)renderAll();else setTimeout(boot,120)};boot()}
  else{$("#loading").innerHTML='未找到 data/latest.js。<br>请先运行：<code>python update_daily.py</code>；或点击「导入JSON」选择 report_*.json。'}
});
