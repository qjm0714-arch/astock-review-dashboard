function ladderStockTable(items){
  const H=(t,al)=>`<th class="${al||""} sort-th">${t}<span class="sarr">⇅</span></th>`;
  return `<div class="tbl-wrap"><table><thead><tr>${H("代码")}${H("名称")}${H("连板","r")}${H("涨幅%","r")}
    ${H("收盘","r")}${H("首次封板","r")}${H("封单亿","r")}${H("炸板次数","r")}${H("成交亿","r")}${H("换手%","r")}${H("行业")}</tr></thead><tbody>
    ${items.map(it=>`<tr><td class="code" data-v="${it.code}">${it.code}</td><td data-v="${esc(it.name)}"><b>${esc(it.name)}</b></td><td class="r num up" data-v="${it.lb}">${it.lb}板</td>
    <td class="r num ${cls(it.chg)}" data-v="${it.chg??""}">${signed(it.chg)}</td><td class="r num" data-v="${it.price??""}">${f2(it.price)}</td>
    <td class="r num" data-v="${it.first_seal??""}">${fmtFbt(it.first_seal)}</td><td class="r num" data-v="${it.seal_yi??""}">${yiWan(it.seal_yi)}</td>
    <td class="r num ${(it.open_times||0)>0?"down":""}" data-v="${it.open_times||0}">${it.open_times||0}</td><td class="r num" data-v="${it.amount_yi??""}">${yiWan(it.amount_yi)}</td>
    <td class="r num" data-v="${it.turnover??""}">${f2(it.turnover)}</td><td style="white-space:normal;color:var(--ink3);font-size:11.5px" data-v="${esc(it.industry||"")}">${esc(it.industry||"")}</td></tr>`).join("")}
  </tbody></table></div>`}
function renderLadder(){
  const lm=R.limit||{},zp=R.zt_prev||{};
  const all=(lm.ladder||[]);
  const high=all.filter(r=>r.lb>=3).flatMap(r=>r.items);
  const two=all.filter(r=>r.lb===2).flatMap(r=>r.items);
  const one=all.filter(r=>r.lb===1).flatMap(r=>r.items);
  const me=zp.money_effect,pr=zp.promotion,cp=zp.consec_premium,ld=zp.ladder||{};
  const promoCell=(p,lab)=>p?`<div class="kpi"><div class="lab">${lab}</div><div class="val" style="font-size:20px">${p.rate==null?"--":pct(p.rate)}</div><div class="sub">${p.k}/${p.n} 再封板</div></div>`:"";
  const moveRow=(x)=>`<tr><td class="code" data-v="${x.code}">${x.code}</td><td data-v="${esc(x.name)}">${esc(x.name)}</td><td class="r num" data-v="${x.pb??""}">${x.pb}板进</td>
    <td class="r num ${cls(x.ret)}" data-v="${x.ret??""}"><b>${signed(x.ret)}%</b></td><td>${x.again?'<span class="tagchip chip-up">再涨停</span>':'<span class="tagchip chip-gray">未封</span>'}</td><td style="white-space:normal;color:var(--ink3);font-size:11.5px" data-v="${esc(x.industry||"")}">${esc(x.industry||"")}</td></tr>`;
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
      <div class="panel"><h3 class="up">反馈最强 Top5</h3><div class="tbl-wrap"><table><thead><tr><th class="sort-th">代码<span class="sarr">⇅</span></th><th class="sort-th">名称<span class="sarr">⇅</span></th><th class="r sort-th">板位<span class="sarr">⇅</span></th><th class="r sort-th">今日涨幅<span class="sarr">⇅</span></th><th class="sort-th">状态<span class="sarr">⇅</span></th><th class="sort-th">行业<span class="sarr">⇅</span></th></tr></thead><tbody>${(zp.top_moves||[]).map(moveRow).join("")}</tbody></table></div></div>
      <div class="panel"><h3 class="down">反馈最弱 Top5</h3><div class="tbl-wrap"><table><thead><tr><th class="sort-th">代码<span class="sarr">⇅</span></th><th class="sort-th">名称<span class="sarr">⇅</span></th><th class="r sort-th">板位<span class="sarr">⇅</span></th><th class="r sort-th">今日涨幅<span class="sarr">⇅</span></th><th class="sort-th">状态<span class="sarr">⇅</span></th><th class="sort-th">行业<span class="sarr">⇅</span></th></tr></thead><tbody>${(zp.bot_moves||[]).map(moveRow).join("")}</tbody></table></div></div>
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
  const contRows=cont.rows.slice().sort((a,b)=>(b.today_yi??0)-(a.today_yi??0)).map(x=>{const[t,k]=contTag(x.tag);return `<tr><td>${esc(x.name)}</td>
    <td class="r num ${cls(x.prev_yi)}">${signed(x.prev_yi)}</td><td class="r num ${cls(x.today_yi)}"><b>${signed(x.today_yi)}</b></td>
    <td class="r num ${cls(x.chg_yi)}">${signed(x.chg_yi)}</td><td>${badge(t,k)}</td></tr>`}).join("");
  const fh=(R.fund_hist||[]).slice(-10);
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
