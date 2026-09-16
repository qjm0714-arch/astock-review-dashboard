/* ============================================================
   人工解读·总-分-总 结构化美化（2026-09-08 第四批）
   把带 ①②③ 的人工长文解析为：总论卡 → 编号分述卡 → 综合研判卡；
   dict 关键位→支撑/压力双栏；list 风险/未核实→逐条卡。
   复核模式下仍回退为纯文本 contentEditable，退出复核自动恢复结构化。
   ============================================================ */
const INS_CIRC="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
// 最后一个分述里，遇到这些总结性起句，切到“综合研判”卡
const INS_SUMCUT=/[。；;]\s*(综合|综上|对比|总体|整体看?|结论|总之|因此|确认度|二者|这意味|需要后续|操作上|三方同向|技术面（[^）]*）\s*[+＋])/;

/* ============================================================
   渲染入口 / 页签
   ============================================================ */
const PAGE_RENDER={home:renderHome,global:renderGlobal,market:renderMarket,ladder:renderLadder,
  boards:renderBoards,funds:renderFunds,lhb:renderLHB,riskdown:renderRiskDown,emotion:renderEmotionPage,
  review:renderReview,mypool:renderMyPool};

/* ============================================================
   P2 大盘分析(指数 + 三位一体60分 + 关键位)
   ============================================================ */
/* ============================================================
   指数乖离率监测（MA60/MA233 · 抄底逃顶，2026-09-15 移植并增强）
   数据=R.bias.indices[nm]（calc_bias.py 近5年1464日统计）；只画乖离不画价格
   ============================================================ */
const IB_NMS=["上证指数","创业板指","科创50"];
const IB_COL={"上证指数":"#1663ac","创业板指":"#d93026","科创50":"#7c3aed"};
let orgSortState={key:"net_abs",desc:true};

/* ============================================================
   P10 我的股票池(localStorage 增删改, 自动标注当日状态)
   ============================================================ */
const POOL_KEY="my_stock_pool_v2";
window.addEventListener("DOMContentLoaded",()=>{
  bindUI();
  const h=location.hash.replace("#","").replace("page-","");
  if(PAGES.some(p=>p[0]===h))state.page=h;
  window.addEventListener("hashchange",()=>{const x=location.hash.replace("#","").replace("page-","");if(PAGES.some(p=>p[0]===x))switchPage(x)});
  if(window.LATEST){R=window.LATEST;state.date=R.meta.date;initDateSelect();
    const boot=()=>{if(window.echarts)renderAll();else setTimeout(boot,120)};boot()}
  else{$("#loading").innerHTML='未找到 data/latest.js。<br>请先运行：<code>python update_daily.py</code>；或点击「导入JSON」选择 report_*.json。'}
});