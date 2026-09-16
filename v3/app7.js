function renderFunds(){
  const cr=R.crowding||{},tmt=R.tmt||{},f=R.funds||{},mg=R.margin,nb=R.northbound||{};
  const [cz,ck]=crowdZone(cr.ratio),tp=tmt.parts||{};
  const cont=R.continuity||{rows:[]};
  const contRows=cont.rows.slice().sort((a,b)=>(b.today_yi??0)-(a.today_yi??0)).map(x=>{const[t,k]=contTag(x.tag);return `<tr><td>${esc(x.name)}</td>
    <td class="r num ${cls(x.prev_yi)}">${signed(x.prev_yi)}</td><td class="r num ${cls(x.today_yi)}"><b>${signed(x.today_yi)}</b></td>
    <td class="r num ${cls(x.chg_yi)}">${signed(x.chg_yi)}</td><td>${badge(t,k)}</td></tr>`}).join("");
  const fh=(R.fund_hist||[]).slice(-10);
  // 两融近20交易日滚动（末值为最新T-1）；主要指数成交额环比表（替代长期不更新的北向卡，2026-09-10邱总）
  const mgh=(R.margin_hist||[]).slice(-20), mgl=mgh[mgh.length-1];
  const mgTitle=(mgl&&mg)?`两融余额（近20交易日滚动）· ${mgl.date}(T-1) ${yiWan(mgl.total_yi)}亿`
      +(mgl.mom_pct!=null?` · 环比 <b class="${cls(mgl.mom_pct)}">${arrow(mgl.mom_pct)}${signed(mgl.mom_pct)}%（${signed(mgl.mom_yi)}亿）</b>`:"")
      :(mg?`两融余额（T-1 ${mg.date}）${yiWan(mg.total_yi)}亿`:"两融余额（近20交易日滚动）");
  const iaRows=(R.index_amount||[]).map(x=>`<tr><td>${esc(x.name)}</td>
      <td class="r num">${yiWan(x.amount_yi)}</td>
      <td class="r num ${cls(x.amount_mom_pct)}">${x.amount_mom_pct==null?"--":arrow(x.amount_mom_pct)+signed(x.amount_mom_pct)+"%"}</td>
      <td class="r num ${cls(x.chg_pct)}">${signed(x.chg_pct)}%</td></tr>`).join("");
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
  <div class="panel" style="margin-top:14px"><h3>全市场主力资金净额序列（近10个交易日·滚动，红正绿负；每日append并剔除最旧一日）</h3>
    ${fh.length>=2?`<div class="chart sm" id="chart-fundhist" style="height:240px;min-height:240px"></div>`:'<div class="muted">序列累积中（需≥2个交易日）</div>'}
    <div class="note-src">口径：当日为全A个股主力净额(超大单+大单,含北证)自算；历史日为东财沪深指数级主力净流入合计(与自算差&lt;0.6%)，滚动只保留最近10个交易日。</div></div>
  <div class="panel" style="margin-top:14px">
    <div style="display:flex;gap:8px;margin-bottom:10px"><h3 style="margin:0">个股主力资金 Top10</h3>
      <button class="tab-btn on" data-fundtab="in" style="margin-left:auto">净流入</button>
      <button class="tab-btn" data-fundtab="out">净流出</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th>行业</th><th class="r">涨跌%</th><th class="r">成交亿</th>
      <th class="r">主力净</th><th class="r">大单</th><th class="r">中单</th><th class="r">小单</th></tr></thead>
      <tbody id="fundTbody"></tbody></table></div></div>
  <div class="grid g3" style="margin-top:14px">
    <div class="panel"><h3>${mgTitle}</h3>
      ${mgh.length>=2?`<div class="chart sm" id="chart-margin" style="height:212px;min-height:212px"></div>`:'<div class="muted">两融历史累积中（需≥2个交易日）</div>'}
      ${mg?`<div class="kvline" style="margin-top:6px"><span class="k">融资/融券/融资买入</span><span class="v num">${yiWan(mg.rzye_yi)} / ${yiWan(mg.rqye_yi)} / ${yiWan(mg.rzmre_yi)} 亿</span></div>
      <div class="note-src">交易所T-1披露口径，折线为两融合计（融资+融券）近20个交易日滚动。</div>`:""}</div>
    <div class="panel"><h3>主要指数成交额（环比昨日 · 今日涨跌幅）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>指数</th><th class="r">今日成交亿</th><th class="r">较昨日</th><th class="r">今日涨跌</th></tr></thead>
      <tbody>${iaRows||'<tr><td colspan=4 class=muted>需连续两日归档</td></tr>'}</tbody></table></div>
      <div class="note-src">北向净买入自2024年8月起交易所永久停披露、本机亦无稳定成交额口径，故以主要指数成交额环比表替代，反映各市场量能缩放；不代表资金方向。</div></div>
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
// 通用类Excel列排序：点击 th.sort-th 即对所在表按该列排序（数值优先 td[data-v]，否则解析文本；首次降序，再点升序）
function bindColSort(){
  document.addEventListener("click",function(e){
    const th=e.target.closest("th.sort-th");if(!th)return;
    const table=th.closest("table");if(!table||!table.tBodies.length)return;
    const ci=Array.prototype.indexOf.call(th.parentNode.children,th);
    const desc=th.dataset.dir!=="desc";
    Array.prototype.forEach.call(th.parentNode.children,x=>{if(x!==th){delete x.dataset.dir;x.classList.remove("active");
      const a=x.querySelector(".sarr");if(a)a.textContent="⇅";}});
    th.dataset.dir=desc?"desc":"asc";th.classList.add("active");
    const tb=table.tBodies[0];
    const numval=td=>{if(!td)return NaN;if(td.dataset.v!=null&&td.dataset.v!==""){const n=parseFloat(td.dataset.v);if(!isNaN(n))return n;}
      const n=parseFloat((td.textContent||"").replace(/[+,%\s板只]/g,""));return isNaN(n)?NaN:n;};
    const rows=Array.prototype.slice.call(tb.rows);
    rows.sort((a,b)=>{const va=numval(a.cells[ci]),vb=numval(b.cells[ci]);
      if(isNaN(va)||isNaN(vb)){const sa=a.cells[ci]?a.cells[ci].textContent:"",sb=b.cells[ci]?b.cells[ci].textContent:"";
        return desc?sb.localeCompare(sa,"zh"):sa.localeCompare(sb,"zh");}
      return desc?vb-va:va-vb;});
    rows.forEach(r=>tb.appendChild(r));
    const sa=th.querySelector(".sarr");if(sa)sa.textContent=desc?"▼":"▲";
  });
}
function orgRow(x){return `<tr><td class="code">${x.code}</td><td><b>${esc(x.name)}</b></td>
    <td class="r num ${cls(x.chg)}">${signed(x.chg)}</td><td class="r num">${x.buy_times}</td><td class="r num">${x.sell_times}</td>
    <td class="r num up">${yiWan(x.buy_yi)}</td><td class="r num down">${yiWan(x.sell_yi)}</td>
    <td class="r num ${cls(x.net_yi)}"><b>${signed(x.net_yi,3)}</b></td></tr>`}
function orgSortVal(x,k){return ({chg:x.chg,buy_times:x.buy_times,sell_times:x.sell_times,buy_yi:x.buy_yi,sell_yi:x.sell_yi,net:x.net_yi,net_abs:Math.abs(x.net_yi||0)})[k]??0}
function orgTbodyHtml(){
  const arr=(R.lhb?.org||[]).slice().sort((a,b)=>orgSortState.desc?orgSortVal(b,orgSortState.key)-orgSortVal(a,orgSortState.key):orgSortVal(a,orgSortState.key)-orgSortVal(b,orgSortState.key));
  return arr.map(orgRow).join("");
}
function orgTh(label,key){return `<th class="r sort-th ${orgSortState.key===key?"active":""}" data-orgsort="${key}">${label}<span class="sarr">${orgSortState.key===key?(orgSortState.desc?"▼":"▲"):"⇅"}</span></th>`}