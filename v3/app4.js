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