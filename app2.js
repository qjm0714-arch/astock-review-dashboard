function renderBias(){
  const B=R.bias;
  if(!B||!B.indices)return "";
  const ID=B.indices;
  // ① 三指数结论KPI卡
  let boxes="";
  IB_NMS.forEach(nm=>{
    const it=ID[nm];if(!it)return;
    const bt60=ibBest(it.th_buy60),bt233=ibBest(it.th_buy233),t60=it.top60||{},t233=it.top233||{};
    const rmt=(bt,b)=>{const r=ibRm(bt,b);if(r==null)return "—";return r<0?`<b class="down">还需跌 ${Math.abs(r).toFixed(1)}%</b>`:'<b class="up">已在抄底区</b>'};
    const w60=bt60?`${bt60.h10.win}% / ${bt60.h20.win}%`:"—",w233=bt233?`${bt233.h10.win}% / ${bt233.h20.win}%`:"—";
    const sell=t60.best_th!=null?`逃顶参考：60日 ≥+${t60.best_th}% 后20日下跌率 ${t60.w20}%`:"逃顶参考：无有效逃顶点（强趋势乖离可放大）";
    boxes+=`<div class="kpi ib-kpi"><div class="lab"><b>${esc(nm)}</b> · 距均线乖离率</div>
      <div class="ib-big">60日 <span class="${cls(it.bias60)}">${ibF(it.bias60)}</span> ｜ 233日 <span class="${cls(it.bias233)}">${ibF(it.bias233)}</span></div>
      <div class="sub">历史分位：60日 ${it.pct60}% · 233日 ${it.pct233}%（越低越超跌）</div>
      <div class="sub">60日抄底点 ${bt60?bt60.th+"%":"—"}：${rmt(bt60,it.bias60)} · 10/20日上涨率 ${w60}</div>
      <div class="sub">233日抄底点 ${bt233?bt233.th+"%":"—"}：${rmt(bt233,it.bias233)} · 10/20日上涨率 ${w233}</div>
      <div class="sub">顶部参考：60日90分位 +${t60.p90??"—"}% · 233日 +${t233.p90??"—"}% · 5年最高60日 +${t60.max??"—"}%</div>
      <div class="sub">${sell}</div></div>`;
  });
  // ② 每日监测表
  let mrows="";
  IB_NMS.forEach(nm=>{const it=ID[nm];if(!it)return;
    [["MA60",it.bias60,it.min60,it.max60,it.pct60],["MA233",it.bias233,it.min233,it.max233,it.pct233]].forEach(a=>{
      const [lb,b,mn,mx,pc]=a,[pos,pk]=ibPos(pc);
      mrows+=`<tr><td>${esc(nm)}</td><td class="num">${lb}</td><td class="num ${cls(b)}"><b>${ibF(b)}</b></td>
        <td class="num">${pc}%</td><td>${badge(pos,pk)}</td><td class="num">${ibF(mn)}</td><td class="num">${ibF(mx)}</td></tr>`;
    });
  });
  // ③ 结论·距抄底点多远
  let clines="";
  IB_NMS.forEach(nm=>{const it=ID[nm];if(!it)return;
    const bt=ibBest(it.th_buy60),r=ibRm(bt,it.bias60),t=it.top60||{};
    const topSeg=t.best_th!=null
      ?`顶部规律：5年60日正乖离90分位 <b>+${t.p90}%</b>、最高 +${t.max}%；乖离 <b>≥+${t.best_th}%</b> 后10日下跌率 <b>${t.w10}%</b>、20日 <b>${t.w20}%</b>（两期均&gt;50%，卖出胜率高）。`
      :`顶部规律：5年60日正乖离90分位 <b>+${t.p90}%</b>、最高 +${t.max}%；但<b>未找到有效逃顶点</b>——强趋势中乖离可持续放大，需配合趋势/量能。`;
    let line;
    if(!bt||r==null)line=`历史样本不足，暂不给抄底结论。${topSeg}`;
    else if(r>=0)line=`当前60日乖离 <b>${ibF(it.bias60)}</b> 已进入历史高胜率抄底区（阈值 ${bt.th}%），此位买入10日上涨率 <b>${bt.h10.win}%</b> / 20日 <b>${bt.h20.win}%</b>，可分批布局。${topSeg}`;
    else line=`当前60日乖离 <b>${ibF(it.bias60)}</b>（分位 ${it.pct60}%），距最优抄底点 ${bt.th}% 还需跌 <b class="down">${Math.abs(r).toFixed(1)}%</b>；到位后10日上涨率 <b>${bt.h10.win}%</b>（均 ${ibF(bt.h10.avg)}）/ 20日 <b>${bt.h20.win}%</b>（均 ${ibF(bt.h20.avg)}）。${topSeg}`;
    clines+=`<div class="ib-cline"><b class="ib-cname">${esc(nm)}</b>：${line}</div>`;
  });
  // ④ 胜率摘要表（每指数抄底+逃顶各一行）
  let srows="";
  IB_NMS.forEach(nm=>{const it=ID[nm];if(!it)return;
    const bt=ibBest(it.th_buy60),t=it.top60||{};
    if(bt){const v=(bt.h10.win>=60&&bt.h20.win>=60)?"✓ 有效":"样本内";
      srows+=`<tr><td>${esc(nm)}</td><td><span class="up">抄底</span></td><td class="num">60日 ≤ ${bt.th}%</td>
        <td class="up">上涨概率 ${bt.h10.win}%</td><td class="up">上涨概率 ${bt.h20.win}%</td>
        <td class="num">${ibF(bt.h10.avg)} / ${ibF(bt.h20.avg)}</td><td>${v}</td></tr>`;}
    if(t.best_th!=null)srows+=`<tr><td>${esc(nm)}</td><td><span class="down">逃顶</span></td><td class="num">60日 ≥ ${t.best_th}%</td>
        <td class="down">下跌概率 ${t.w10}%</td><td class="down">下跌概率 ${t.w20}%</td><td class="num">—</td><td>✓ 有效（两期&gt;50%）</td></tr>`;
    else srows+=`<tr><td>${esc(nm)}</td><td class="muted">逃顶</td><td class="num">—</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td><td class="muted">无有效逃顶点</td></tr>`;
  });
  const src0=(ID["上证指数"]||{}).src||"—";
  return `<div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">1B</span><h2>指数乖离率监测（MA60 / MA233 · 抄底逃顶）</h2><span class="tag">近5年 ${esc(B.window_start||"")} 起 · ${esc(B.date||"")}</span></div><div class="sec-body">
    <div class="grid g3">${boxes}</div>
    <div class="note-src">口径：乖离率 =(收盘−均线)/均线×100%；历史窗口近5年（${esc(B.window_start||"")} 起）；取数源 ${esc(src0)}；胜率=持有到期收红占比，信号间不重叠（持有期内不重复触发）；「最优抄底点」=历史胜率≥70%且样本≥5的最浅阈值。红=正乖离（偏贵），绿=负乖离（便宜）。</div>
    <div class="grid g2" style="margin-top:12px">
      <div class="panel"><h3>每日监测（三指数 × MA60/MA233）</h3><div class="tbl-wrap"><table>
        <thead><tr><th>指数</th><th>均线</th><th class="r">当前乖离</th><th class="r">历史分位</th><th>位置</th><th class="r">5年最低</th><th class="r">5年最高</th></tr></thead>
        <tbody>${mrows}</tbody></table></div></div>
      <div class="panel"><h3>结论 · 距抄底点还有多远</h3><div class="ib-concl">${clines}</div></div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>胜率摘要（最优抄底点 / 逃顶点）</h3><div class="tbl-wrap"><table>
      <thead><tr><th>指数</th><th>方向</th><th class="r">乖离阈值(MA60)</th><th class="r">10日后概率</th><th class="r">20日后概率</th><th class="r">均值(10/20日)</th><th>判定</th></tr></thead>
      <tbody>${srows}</tbody></table></div></div>
    <div class="panel" style="margin-top:14px"><h3>三指数乖离率走势（纯乖离 · MA60橘实线 / MA233紫虚线 · 近5年，自动标注历史极值）</h3>
      <div class="chart" id="chart-ib-上证指数" style="height:380px"></div>
      <div class="chart" id="chart-ib-创业板指" style="height:380px;margin-top:16px"></div>
      <div class="chart" id="chart-ib-科创50" style="height:380px;margin-top:16px"></div>
    </div>
  </div></div>`;
}

function renderMarket(){
  const rows=(R.indices||[]).map(x=>`<tr>
    <td>${x.name}</td><td class="r num">${f2(x.close)}</td>
    <td class="r num ${cls(x.chg_pct)}">${arrow(x.chg_pct)} ${signed(x.chg_pct)}</td>
    <td class="r num">${yiWan(x.amount_yi)}</td><td class="r num">${f2(x.turnover)}%</td>
    <td class="r num ${cls(x.amplitude)}">${f2(x.amplitude)}</td>
    <td class="r num">${f2(x.high)}</td><td class="r num">${f2(x.low)}</td></tr>`).join("");
  const uh=(R.hist&&R.hist.updown)||[];const prev=uh.length>=2?uh[uh.length-2]:null;
  const cmp=(a,b,fmt)=>{if(!a||b==null)return "--";const d=a-b;return `<span class="${cls(d)}">${d>0?"+":""}${fmt?fmt(d):d}</span>`};
  const techCards=(R.tech60||[]).map(t=>{
    const [g,k]=techBadge(t.grade);
    return `<div class="panel"><h3>${t.name} · 60分钟 ${badge(g,k)}</h3>
      <div class="kvline"><span class="k">最新/时间</span><span class="v num">${f2(t.price)} · ${esc(t.t)}</span></div>
      <div class="kvline"><span class="k">MA55</span><span class="v num">${f2(t.ma55)}（${t.above?'<span class="up">站上 ▲</span>':'<span class="down">跌破 ▼</span>'}，偏离 ${signed(t.dev)}%）</span></div>
      <div class="kvline"><span class="k">DIF/DEA</span><span class="v num">${f2(t.dif)} / ${f2(t.dea)}（零轴${t.zero_axis}方，柱 ${signed(t.bar)}，前柱 ${signed(t.bar_prev)}）</span></div>
      <div class="kvline"><span class="k">近4根收盘</span><span class="v num">${(t.last4_closes||[]).join(" → ")}</span></div>
      <div class="chart sm" id="kline-${t.name}" style="height:290px;min-height:290px;margin-top:8px"></div>
    </div>`}).join("");
  return `<div class="grid g2">
    <div class="panel"><h3>核心指数总览（东财+新浪60分K双源）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>指数</th><th class="r">收盘</th><th class="r">涨跌幅%</th>
      <th class="r">成交额亿</th><th class="r">换手%</th><th class="r">振幅%</th><th class="r">最高</th><th class="r">最低</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
      <div class="note-src">全市场成交额=上证综指(沪)+深证综指(深)+北交所个股合计，与全部个股求和交叉偏差&thinsp;0.5%内。</div>
    </div>
    <div class="panel"><h3>指数涨跌幅对比（红涨绿跌）</h3><div class="chart" id="chart-idxbar" style="height:300px"></div></div>
  </div>
  ${renderBias()}
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>近20交易日涨跌家数 / 涨跌停</h3><div class="chart" id="chart-breadth" style="height:300px"></div></div>
    <div class="panel"><h3>沪深300 收盘走势（叠加恐贪）</h3><div class="chart" id="chart-hs300fg" style="height:300px"></div>
      <div class="note-src">柱=恐贪（左轴0-100，&lt;25极度恐惧），蓝线=沪深300（右轴）。</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>情绪指标环比（vs 前一交易日）</h3>
    <div class="tbl-wrap"><table><thead><tr><th>指标</th><th class="r">今日</th><th class="r">昨日</th><th class="r">变化</th></tr></thead><tbody>
      <tr><td>上涨家数</td><td class="r num">${f0(R.breadth?.up)}</td><td class="r num">${prev?f0(prev.up):"--"}</td><td class="r num">${prev?cmp(R.breadth.up,+prev.up,f0):"--"}</td></tr>
      <tr><td>下跌家数</td><td class="r num">${f0(R.breadth?.down)}</td><td class="r num">${prev?f0(prev.down):"--"}</td><td class="r num">${prev?cmp(R.breadth.down,+prev.down,f0):"--"}</td></tr>
      <tr><td>涨停</td><td class="r num up">${R.limit?.zt_count??"--"}</td><td class="r num">${prev?prev.lu:"--"}</td><td class="r num">${prev?cmp(R.limit.zt_count,+prev.lu,null):"--"}</td></tr>
      <tr><td>跌停</td><td class="r num down">${R.limit?.dt_count??"--"}</td><td class="r num">${prev?prev.ld:"--"}</td><td class="r num">${prev?cmp(R.limit.dt_count,+prev.ld,null):"--"}</td></tr>
    </tbody></table></div></div>

  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">8</span><h2>三位一体 · 60分钟技术分析</h2><span class="tag">MA55 + MACD 五级定档</span></div><div class="sec-body">
    <div class="note-src" style="margin-bottom:10px">MA55=近55根60分K收盘均值；DIF=EMA12-EMA26，DEA=DIF的9日EMA，柱=2×(DIF-DEA)。极强=站上MA55且DIF/DEA双正金叉；强=零轴上方金叉；中性=零轴缠绕；弱=零轴下方金叉收敛；极弱=跌破MA55且零轴下方死叉。</div>
    <div class="grid g3">${techCards}</div>
    <div style="margin-top:12px">${insightBlock("tech_detail","三位一体综合技术解读 · 总-分-总","prose")}</div>
  </div></div>

  <div class="grid g2" style="margin-top:14px">
    ${insightBlock("key_levels","关键支撑 / 压力位（跌破/站上对应动作）","levels")}
    ${insightBlock("triple","三重共振结论（技术面 × 情绪面 × 资金面）","prose")}
  </div>`}

/* ============================================================
   P3 涨停梯队 + 昨日涨停今日反馈
   ============================================================ */
function fmtFbt(v){if(v==null||v==="")return "--";const s=String(v).padStart(6,"0");return `${s.slice(0,2)}:${s.slice(2,4)}`}
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
