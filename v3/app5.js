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
  const ztInd=lm.zt_industry||{rows:[],total:lm.zt_count??0,covered:0};
  const dtInd=lm.dt_industry||{rows:[]};
  const maxLB=all[0]?.lb??0, leaders=(all[0]?.items||[]).map(i=>i.name).join("、")||"--";
  const _ztn=lm.zt_count??0,_zbn=lm.zb_count??0;
  const zbRate=(_ztn+_zbn)?_zbn/(_ztn+_zbn)*100:null;
  const willLab=zbRate==null?"--":(zbRate>=30?"封板意愿弱":zbRate>=18?"封板意愿一般":"封板意愿强");
  const willCls=zbRate==null?"flat":(zbRate>=30?"down":zbRate>=18?"flat":"up");
  const boardDist=all.map(r=>`${r.lb}板${r.count}`).join("、");
  const _prLab={"1to2":"1进2","2to3":"2进3","3plus":"3板+"};
  const prLine=pr?["1to2","2to3","3plus"].map(k=>{const p=pr[k];return p?`${_prLab[k]}=${p.rate==null?"--":pct(p.rate)}(${p.k}/${p.n})`:""}).filter(Boolean).join("，"):"";
  const concLab=ztInd.covered>=20?"较分散":ztInd.covered>=10?"适度集中":"高度集中";
  const ldRow=x=>`<tr><td data-v="${esc(x.name)}">${esc(x.name)}</td><td class="r num" data-v="${x.count}"><b>${x.count}</b></td><td class="r num" data-v="${x.pct}">${f1(x.pct)}%</td></tr>`;
  return `<div class="section"><div class="sec-head"><span class="sec-no">1</span><h2>涨停方向分布与梯队总览</h2><span class="tag">申万二级行业 · 列头可排序</span></div><div class="sec-body">
    <div class="ld-grid">
      <div class="panel">
        <h3>涨停方向分布（今日涨停共 ${lm.zt_count??"--"} 只 · 按申万二级行业统计）</h3>
        <div class="ld-stat"><span>涨停<b class="up">${lm.zt_count??"--"}</b></span><span>跌停<b class="down">${lm.dt_count??"--"}</b></span><span>炸板<b>${lm.zb_count??"--"}</b></span><span>封板率<b>${f1(lm.seal_rate)}%</b></span><span>覆盖<b>${ztInd.covered}</b>个二级行业</span></div>
        <div class="tbl-wrap"><table><thead><tr><th class="sort-th">二级行业<span class="sarr">⇅</span></th><th class="r sort-th">涨停家数<span class="sarr">⇅</span></th><th class="r sort-th">占比<span class="sarr">⇅</span></th></tr></thead><tbody>${(ztInd.rows||[]).map(ldRow).join("")}</tbody></table></div>
        <div class="ld-foot">点击列头可按该列 从多到少 / 从少到多 排序（类 Excel）。口径：东财涨停池 ${lm.zt_count??0} 只全部涨停股（含首板/2板/3板+）按所属申万二级行业归类、从多到少排序；涨停方向${concLab}（覆盖 ${ztInd.covered} 个行业）。</div>
        ${(dtInd.rows||[]).length?`<div class="ld-foot">跌停方向（申万二级，从多到少）：${dtInd.rows.slice(0,8).map(x=>`${esc(x.name)}${x.count}只`).join("、")}</div>`:""}
      </div>
      <div class="ld-right">
        <div class="panel ld-card"><div class="lab">最高连板</div><div class="bigv up">${maxLB}<span style="font-size:15px"> 板</span></div><div class="sub2">${esc(leaders)}</div></div>
        <div class="panel ld-card"><div class="lab">连板梯队（3板+ / 2板 / 首板）</div><div class="bigv">${high.length} / ${two.length} / ${one.length}</div><div class="sub2">板位：${boardDist||"--"}${ld.gaps&&ld.gaps.length?`；缺 <b class="down">${ld.gaps.join("、")}档</b>`:"；梯队无断层"}${prLine?`<br>晋级率：${prLine}`:""}</div></div>
        <div class="panel ld-card"><div class="lab">炸板率</div><div class="bigv ${willCls}">${zbRate==null?"--":f1(zbRate)+"%"}</div><div class="${willCls}" style="font-weight:700;font-size:12.5px">${willLab}</div><div class="sub2">封板率 ${f1(lm.seal_rate)}% · 炸板 ${_zbn} / 涨停 ${_ztn}</div></div>
        <div class="panel ld-card ld-dir manual" data-field="ladder_direction"><div class="lab" style="font-weight:800;color:var(--blue)">方向解读 <span style="font-weight:400;color:var(--ink3)">（人工）</span></div><div class="view-text" data-view="ladder_direction"></div></div>
      </div>
    </div>
  </div></div>

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