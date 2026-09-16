function switchFundTab(tab){
  const list=tab==="in"?(R.funds?.in_top10||[]):(R.funds?.out_top10||[]);
  const tb=$("#fundTbody");if(!tb)return;
  tb.innerHTML=list.map(fundRow).join("");
  $$("[data-fundtab]").forEach(b=>b.classList.toggle("on",b.dataset.fundtab===tab))
}/* ============================================================
   图表绘制
   ============================================================ */
const mh=()=>R.macro_hist||{};
