/* ============================================================
   9-15 移植：模块1 60日新高板块统计 / 模块2 5日板块轮动（热门板块页顶部）
   ============================================================ */
function renderNewHigh60(){
  const nh=R.newhigh60; if(!nh||!nh.groups||!nh.groups.length) return "";
  const leftRows=nh.left.map(g=>`<tr class="nh-brow" data-g="${esc(g.name)}">
      <td><b>${esc(g.name)}</b></td>
      <td class="r num" data-v="${g.n??''}">${g.n}</td>
      <td class="r num ${cls(g.ind_pct)}" data-v="${g.ind_pct??''}">${g.ind_pct==null?'--':signed(g.ind_pct)}</td>
      <td class="r num" data-v="${g.up_ratio??''}">${g.up_ratio==null?'--':f1(g.up_ratio)+'%'}</td>
      <td class="r num" data-v="${g.amt_ratio??''}">${g.amt_ratio==null?'--':f2(g.amt_ratio)+'%'}</td>
      <td class="r num ${cls(g.main_net)}" data-v="${g.main_net??''}">${g.main_net==null?'--':signed(f2(g.main_net))}</td></tr>`).join("");
  const rightGroups=nh.groups.map(grp=>{
    const head=`<tr class="nh-gh" data-g="${esc(grp.name)}"><td colspan="6"><span class="arw">▶</span>${esc(grp.name)}（${grp.n}只 · 点击展开/收起）</td></tr>`;
    const rows=grp.rows.map((r,i)=>`<tr class="nh-irow ${i===0?'':'rest'}" data-g="${esc(grp.name)}" style="display:${i===0?'table-row':'none'}">
      <td class="code">${r.code}</td><td><b>${esc(r.name)}</b></td>
      <td class="r num ${cls(r.chg60)}" data-v="${r.chg60??''}">${r.chg60==null?'--':signed(r.chg60)}</td>
      <td class="r num ${cls(r.chg)}">${r.chg==null?'--':signed(r.chg)}</td>
      <td>${esc(grp.name)}</td><td class="nh-concept">${esc(r.concept||'')}</td></tr>`).join("");
    return head+rows;}).join("");
  return `<div class="panel" style="margin-bottom:14px"><div class="nm-head"><h3>60日新高板块统计</h3>
    <span class="nm-sub">${esc(nh.date)} · 共 <b style="color:var(--blue)">${nh.total}</b> 只创60日新高（今日最高价&gt;过去60交易日最高价）；点左表行业联动展开右表分组，表头可点排序；每组默认只显示60日涨幅最高的一只</span></div>
    <div class="nh-grid">
      <div class="nh-wrap"><table><thead><tr>
        <th class="sort-th">所属行业<span class="sarr">⇅</span></th>
        <th class="r sort-th">数量<span class="sarr">⇅</span></th>
        <th class="r sort-th">行业涨跌%<span class="sarr">⇅</span></th>
        <th class="r sort-th">上涨占比<span class="sarr">⇅</span></th>
        <th class="r sort-th">额占比<span class="sarr">⇅</span></th>
        <th class="r sort-th">主力净亿<span class="sarr">⇅</span></th></tr></thead><tbody>${leftRows}</tbody></table></div>
      <div class="nh-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">60日涨跌%</th><th class="r">今日%</th><th>行业</th><th>概念</th></tr></thead><tbody>${rightGroups}</tbody></table></div>
    </div>
    <div class="note-src">强度三指标：行业涨跌幅=申万一级当日；上涨占比=行业内上涨家数÷(涨+跌+平)；额占比=行业成交额÷31个申万一级合计（${f1(nh.mkt_yi)}亿）。60日涨跌幅=最新收盘÷62根日K首根−1（腾讯前复权）。</div></div>`;
}
function renderRotate5d(){
  const rt=R.rotate5d; if(!rt||!rt.days||!rt.days.length) return "";
  const cols=rt.days.map(dy=>{
    const rows=dy.rows.map(r=>`<tr class="r5-row" data-b="${esc(r.name)}">
      <td class="r5-name">${esc(r.name)}</td>
      <td class="r num ${cls(r.pct)}" data-v="${r.pct??''}">${r.pct==null?'--':signed(r.pct)}</td>
      <td class="r num" data-v="${r.amt_ratio??''}">${r.amt_ratio==null?'--':f1(r.amt_ratio)}</td>
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