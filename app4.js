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
