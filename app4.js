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
  bindColSort();
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
});const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const UP="#d93026", DOWN="#0a8f4e", FLAT="#8a94a6", BLUE="#2b6fd4", BLUED="#1a3a6e", GOLD="#b0812e", AMBER="#e08a1e", PURPLE="#8a6bbf";
let toastTimer;
const CHARTS={};
const AXIS_STYLE={axisLine:{lineStyle:{color:"#c6d0e0"}},axisLabel:{color:"#7a869c",fontSize:11},
  splitLine:{lineStyle:{color:"#eef1f6"}},axisTick:{show:false}};
const TT={trigger:"axis",confine:true,backgroundColor:"#1a2f5a",borderWidth:0,textStyle:{color:"#fff",fontSize:12}};
let R=null;
const state={date:null,review:false,notesDraft:null,page:"home"};
const PAGES=[
  ["home","首页总览","00"],["global","全球宏观","0"],["market","大盘分析","1"],
  ["ladder","涨停梯队","2"],["boards","热门板块","3"],["funds","资金流向","4"],
  ["lhb","龙虎榜","龙"],["riskdown","跌停与风险","5"],["emotion","情绪温度","6"],
  ["review","复盘观点","7"],["mypool","我的股票池","8"]
];
const PAGE_RENDER={home:renderHome,global:renderGlobal,market:renderMarket,ladder:renderLadder,
  boards:renderBoards,funds:renderFunds,lhb:renderLHB,riskdown:renderRiskDown,emotion:renderEmotionPage,
  review:renderReview,mypool:renderMyPool};
let orgSortState={key:"net_abs",desc:true};
const POOL_KEY="my_stock_pool_v2";