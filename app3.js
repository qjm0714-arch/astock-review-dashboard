function renderRotate5d(){
  const rt=R.rotate5d; if(!rt||!rt.days||!rt.days.length) return "";
  const cols=rt.days.map(dy=>{
    const rows=dy.rows.map(r=>`<tr class="r5-row" data-b="${esc(r.name)}">
      <td class="r5-name">${esc(r.name)}</td>
      <td class="r num ${cls(r.pct)}" data-v="${r.pct??''}">${r.pct==null?'--':signed(r.pct)}</td>
      <td class="r num" data-v="${r.amt_ratio??''}">${r.amt_ratio==null?'--':f2(r.amt_ratio)}</td>
      <td class="r num" data-v="${r.amount_yi??''}">${f1(r.amount_yi)}</td></tr>`).join("");
    return `<div class="r5-col"><div class="r5-day"><span>${esc(dy.date)}</span><span class="r5-tot">${f1(dy.total_yi)}亿</span></div>
      <table><thead><tr><th class="sort-th">板块<span class="sarr">⇅</span></th><th class="r sort-th">涨跌%<span class="sarr">⇅</span></th><th class="r sort-th">额占比<span class="sarr">⇅</span></th><th class="r sort-th">成交亿<span class="sarr">⇅</span></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join("");
  return `<div class="panel" style="margin-bottom:14px"><div class="nm-head"><h3>5日板块轮动</h3>
    <span class="nm-sub">${rt.dates[0]} → ${rt.dates[rt.dates.length-1]}（最新在最左）；点任一<b style="color:var(--blue)">板块名</b>可在5列中同时蓝色高亮、观察排名迁移；每列表头可点排序</span></div>
    <div class="r5-wrap">${cols}</div>
    <div class="note-src">每日按申万一级行业涨跌幅降序；额占比=行业成交额÷当日31行业合计。连续多日居前=主线孕育，排名快速上移=资金切入，快速滑落=退潮。</div></div>`;
}
// 新模块交互（事件委托，bindUI 里只绑一次）：分组折叠 / 左表联动 / 跨列高亮
function bindNewModules(){
  document.addEventListener("click",function(e){
    const gh=e.target.closest("tr.nh-gh");
    if(gh){const tb=gh.closest("tbody"),g=gh.dataset.g,open=gh.classList.toggle("open");
      Array.prototype.forEach.call(tb.querySelectorAll('tr.nh-irow[data-g="'+g+'"]'),(r,i)=>{r.style.display=(open||i===0)?"table-row":"none";});
      return;}
    const br=e.target.closest("tr.nh-brow");
    if(br){const wrap=document.querySelector(".nh-grid");if(!wrap)return;
      wrap.querySelectorAll(".hl").forEach(x=>x.classList.remove("hl"));
      const g=br.dataset.g;br.classList.add("hl");
      const gh2=wrap.querySelector('tr.nh-gh[data-g="'+g+'"]');
      if(gh2){gh2.classList.add("open");
        Array.prototype.forEach.call(gh2.closest("tbody").querySelectorAll('tr.nh-irow[data-g="'+g+'"]'),r=>{r.style.display="table-row";r.classList.add("hl");});
        gh2.scrollIntoView({block:"nearest",behavior:"smooth"});}
      return;}
    const rc=e.target.closest("tr.r5-row");
    if(rc){const b=rc.dataset.b,wrap=rc.closest(".r5-wrap");if(!wrap)return;
      const already=rc.classList.contains("hl");
      wrap.querySelectorAll("tr.r5-row.hl").forEach(x=>x.classList.remove("hl"));
      if(!already)wrap.querySelectorAll('tr.r5-row[data-b="'+b+'"]').forEach(x=>x.classList.add("hl"));
      return;}
  });
}
function renderBoards(){
  const inds=R.industries||{},con=R.concepts||{},cr=R.crowding||{};
  const top10=(cr.top10||[]).map((x,i)=>`<tr><td class="muted">${i+1}</td><td class="code">${x.code}</td><td>${esc(x.name)}</td>
    <td style="white-space:normal;color:var(--ink3);font-size:11.5px">${esc(x.industry||"")}</td>
    <td class="r num ${cls(x.chg)}">${signed(x.chg)}</td><td class="r num">${yiWan(x.amount_yi)}</td>
    <td class="r num ${cls(x.main_yi)}">${signed(x.main_yi)}</td></tr>`).join("");
  return `${renderNewHigh60()}${renderRotate5d()}<div class="grid g2">
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
