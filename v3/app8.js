function bindOrgSort(){
  $$("[data-orgsort]").forEach(th=>th.onclick=()=>{const k=th.dataset.orgsort;
    if(orgSortState.key===k)orgSortState.desc=!orgSortState.desc;else{orgSortState.key=k;orgSortState.desc=true}
    const tb=$("#orgTbody");if(tb)tb.innerHTML=orgTbodyHtml();
    $$("[data-orgsort]").forEach(h=>{const on=h.dataset.orgsort===orgSortState.key;h.classList.toggle("active",on);
      const a=h.querySelector(".sarr");if(a)a.textContent=on?(orgSortState.desc?"▼":"▲"):"⇅";});
  });
}
function renderLHB(){
  const l=R.lhb||{};
  const ov=(l.ladder_overlap||[]).map(x=>`<span class="lb-stock">${x.lb}板 ${esc(x.name)}
    <span class="ind ${cls(x.net_yi)}">${signed(x.net_yi,2)}亿</span></span>`).join("")||'<span class="muted">无交集</span>';
  return `<div class="kpi-strip">
    <div class="kpi"><div class="lab">去重上榜个股</div><div class="val">${l.n_stocks??"--"}</div><div class="sub">原始条款 ${l.n_records??"--"}（同股多条款合并）</div></div>
    <div class="kpi"><div class="lab">龙虎榜净买额合计</div><div class="val ${cls(l.net_total_yi)}">${signed(l.net_total_yi)}<span style="font-size:13px">亿</span></div><div class="sub">买入席位-卖出席位</div></div>
    <div class="kpi"><div class="lab">净买入为正家数</div><div class="val up">${l.n_positive??"--"}</div><div class="sub">占上榜 ${l.n_stocks?f1(l.n_positive/l.n_stocks*100):"--"}%</div></div>
    <div class="kpi"><div class="lab">机构席位现身</div><div class="val">${(l.org||[]).length}</div><div class="sub">机构专用席位买卖</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>龙虎榜净买/净卖 Top5 对比</h3><div class="chart" id="chart-lhb" style="height:330px"></div></div>
  <div class="panel lhb-wide" style="margin-top:14px"><h3 class="up">▲ 净买入 Top5（全宽展示 · 题材归因列复核填写）</h3>
    <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌%</th><th class="r">净买亿</th><th class="r">买入</th><th class="r">卖出</th><th class="r">席位结构</th><th>上榜原因</th><th>题材归因(人工)</th></tr></thead>
    <tbody>${(l.buy_top5||[]).map(x=>lhbRow(x,"buy")).join("")}</tbody></table></div></div>
  <div class="panel lhb-wide" style="margin-top:14px"><h3 class="down">▼ 净卖出 Top5（信号：涨停出货/跌停出逃/高位滞涨）</h3>
    <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌%</th><th class="r">净卖亿</th><th class="r">买入</th><th class="r">卖出</th><th class="r">席位结构</th><th>上榜原因</th><th>出货信号(人工)</th></tr></thead>
    <tbody>${(l.sell_top5||[]).map(x=>lhbRow(x,"sell")).join("")}</tbody></table></div></div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>机构专用席位明细（点击表头可排序，类Excel）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th>${orgTh("涨跌%","chg")}${orgTh("买次","buy_times")}${orgTh("卖次","sell_times")}${orgTh("机构买亿","buy_yi")}${orgTh("机构卖亿","sell_yi")}${orgTh("净亿","net_abs")}</tr></thead>
      <tbody id="orgTbody">${orgTbodyHtml()}</tbody></table></div>
      <div class="note-src">点击「涨跌%/买次/卖次/机构买亿/机构卖亿/净亿」表头，可在 高→低 / 低→高 间切换；默认按净买卖绝对值排序。</div></div>
    <div class="panel"><h3>龙虎榜 ∩ 连板梯队</h3><div class="lb-stocks" style="margin:6px 0">${ov}</div>
      <div class="manual" data-field="lhb_interp" style="margin-top:10px"><span class="mlab">人工 · 游资进攻vs出货解读</span>
      <div class="view-text" data-view="lhb_interp"></div></div></div>
  </div>`}

/* ============================================================
   P7 跌停与风险 + 自检 + 源 + 免责
   ============================================================ */
/* ============================================================
   9-15 移植：A股避雷针（跌停与风险页顶部：减持/解禁/风险监控/严重异动）
   ============================================================ */
function renderLightning(){
  const lz=R.lightning; if(!lz) return "";
  const reduceRows=(lz.reduce||[]).map(x=>`<tr>
     <td class="num">${esc(x.date)}</td><td class="code">${x.code}</td><td><b>${esc(x.name)}</b></td>
     <td style="white-space:normal;font-size:11.8px;color:var(--ink2)">${esc(x.holder)}</td>
     <td class="r num" data-v="${x.shares_wan??''}">${f1(x.shares_wan)}</td>
     <td class="r num" data-v="${x.after_rate??''}">${x.after_rate==null?'--':f2(x.after_rate)+'%'}</td></tr>`).join("");
  const unlockRows=(lz.unlock||[]).map(x=>`<tr>
     <td class="code">${x.code}</td><td><b>${esc(x.name)}</b></td><td class="num">${esc(x.date)}</td>
     <td class="r num ${x.pct>=5?'lz-red':''}" data-v="${x.pct??''}">${f2(x.pct)}%</td>
     <td class="r num" data-v="${x.qty_wan??''}">${f1(x.qty_wan)}</td></tr>`).join("");
  const rn=lz.risk_news||{};
  const comp=(rn.company||[]).map(x=>`<li><b>${esc(x.name)}</b>：${esc(x.point)}</li>`).join("");
  const macro=(rn.macro||[]).map(x=>`<li>${esc(typeof x==='string'?x:(x.text||x.title||''))}</li>`).join("");
  const abn=(lz.abnormal||[]).map(x=>`<div class="abn"><b>${esc(x.name)}</b><span class="code">${x.code}</span><div style="color:var(--ink2);margin-top:3px">${esc(x.text)}</div></div>`).join("");
  return `<div class="section" style="margin-bottom:14px"><div class="sec-head"><span class="sec-no" style="background:#b91c1c">避</span><h2>A股避雷针（减持 / 解禁 / 风险监控 / 严重异动）</h2><span class="tag">${esc(lz.date||'')}</span></div><div class="sec-body">
   <div class="lz-grid">
    <div class="lz-card"><div class="lz-t"><span class="lz-ic">▼</span>股东减持 · 近3日（时间倒序）</div><div class="lz-b">
      ${reduceRows?`<div class="tbl-wrap"><table><thead><tr><th class="sort-th">公告日<span class="sarr">⇅</span></th><th>代码</th><th>名称</th><th>减持股东</th><th class="r sort-th">万股<span class="sarr">⇅</span></th><th class="r sort-th">减持后%<span class="sarr">⇅</span></th></tr></thead><tbody>${reduceRows}</tbody></table></div>`:'<div class="muted">近3日无重要减持公告</div>'}</div></div>
    <div class="lz-card"><div class="lz-t"><span class="lz-ic">■</span>限售解禁 · 当天及未来5交易日（占总股本≥5%标红，表头可排序）</div><div class="lz-b">
      <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="sort-th">解禁日<span class="sarr">⇅</span></th><th class="r sort-th">占总股本%<span class="sarr">⇅</span></th><th class="r sort-th">万股<span class="sarr">⇅</span></th></tr></thead><tbody>${unlockRows}</tbody></table></div></div></div>
    <div class="lz-card full"><div class="lz-t"><span class="lz-ic">!</span>${esc(rn.title||'风险监控 · 财联社投资避雷针')}</div><div class="lz-b">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div><div class="muted" style="margin-bottom:6px">公司层面利空（${(rn.company||[]).length}）</div><ul class="lz-news">${comp||'<li class="muted">无</li>'}</ul></div>
        <div><div class="muted" style="margin-bottom:6px">宏观 / 行业层面（${(rn.macro||[]).length}）</div><ul class="lz-news macro">${macro||'<li class="muted">无</li>'}</ul></div>
      </div>${rn.url?`<div class="note-src">来源：财联社「投资避雷针」 <a href="${esc(rn.url)}" target="_blank" rel="noopener">${esc(rn.url)}</a>（通达信 wenda_news_query 聚合）</div>`:''}</div></div>
    <div class="lz-card full"><div class="lz-t"><span class="lz-ic">⚠</span>严重异动（异常波动 / 监管关注 / 停牌核查 / 龙虎榜异动）</div><div class="lz-b"><div class="lz-abn">${abn||'<div class="muted">无</div>'}</div>
      <div class="note-src">判定口径：上交所连续3日收盘涨幅偏离累计&gt;20%为异常；深交所连续3日累计30%异常、连续10日累计100%为严重异常；北交所按其监控细则。来源：通达信异动公告聚合。</div></div></div>
   </div></div></div>`;
}