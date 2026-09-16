function renderRiskDown(){
  const lm=R.limit||{};
  const dtRows=(lm.dt_items||[]).map(x=>`<tr><td class="code">${x.code}</td><td><b>${esc(x.name)}</b></td>
    <td class="r num ${cls(x.chg)}">${signed(x.chg)}%</td><td class="r num">${f2(x.price)}</td>
    <td class="r num">${yiWan(x.amount_yi)}</td><td class="r num">${f2(x.turnover)}%</td>
    <td style="white-space:normal;color:var(--ink3);font-size:11.5px">${esc(x.industry||"")}</td></tr>`).join("");
  const sc=R.selfcheck||{items:[],n_pass:0,n_total:0},warn=R.meta.warnings||[],src=R.meta.sources||{};
  const items=sc.items.map(c=>`<li>${c.pass?'<span class="badge b-ok">通过</span>':'<span class="badge b-danger">未过</span>'}
    <span>${esc(c.item)}</span><span class="muted num">${esc(Object.entries(c).filter(([k])=>!["item","pass"].includes(k)).map(([k,v])=>`${k}=${v}`).join("  "))}</span></li>`).join("");
  const srcRows=Object.entries(src).map(([k,v])=>`<li><b>${k}</b>：${esc(v)}</li>`).join("");
  return `${renderLightning()}<div class="section"><div class="sec-head"><span class="sec-no">5A</span><h2>跌停股全表（风险释放方向）</h2><span class="tag">收盘跌停 ${lm.dt_count??0} 只 · 炸板 ${lm.zb_count??0} 只</span></div><div class="sec-body">
    ${dtRows?`<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th class="r">涨跌幅</th><th class="r">收盘</th><th class="r">成交亿</th><th class="r">换手%</th><th>行业</th></tr></thead><tbody>${dtRows}</tbody></table></div>`
      :'<div class="muted">今日无跌停股</div>'}
  </div></div>
  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">5B</span><h2>风险提示（人工复核）</h2></div><div class="sec-body">
    ${insightBlock("risks","风险提示 · 逐条列示（外生冲击/流动性/情绪/拥挤/事件落空）","risks")}
    <div style="height:13px"></div>
    ${insightBlock("unverified","未核实 / 口径差异诚实披露","unverified")}
  </div></div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>数据交叉验证自检（自动硬门禁）</h3>
      <div style="margin:6px 0">${badge(`通过 ${sc.n_pass}/${sc.n_total}`,sc.all_pass?"ok":"warn")}</div>
      <ul class="selfcheck">${items}</ul>
      ${warn.length?`<div style="margin-top:8px"><div class="muted">运行警告：</div><ul class="bul">${warn.map(w=>`<li>${esc(w.module)}: ${esc(w.msg)}</li>`).join("")}</ul></div>`:""}
    </div>
    <div class="panel"><h3>信息源清单（口径可追溯）</h3><ul class="bul">${srcRows}</ul>
      <div class="note-src">主源东方财富（push2ex涨停池/datacenter数据中心，收盘终值）；交叉源新浪财经（60分K/外盘/美股）、gate.io（BTC）；恐贪韭圈儿funddb加密接口；zt_prev/emotion由自有历史池本地实算。全部可在 update_daily.py 复算。</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h3>免责声明</h3>
  <p class="muted" style="font-size:12.5px;line-height:1.9">本工作台由本地程序自动抓取公开行情数据并聚合计算，主观结论为人工/AI复核的研究笔记。数据虽经双源交叉与自检门禁，仍可能因供应商口径、快照时点、接口调整产生偏差（已知口径差异：涨停家数东财收盘封死 vs 数据宝盘中触板；全市场成交额为交易所综合指数合成口径；VIX为近月期货非现货；情绪周期分为窗口内minmax相对值，跨日全量重算）。内容仅供个人投研学习，不构成投资建议、不写买入价位与仓位指令，不承诺收益，据此交易风险自担。市场有风险，投资需谨慎。</p></div>`}

/* ============================================================
   P8 情绪温度(恐贪 + 情绪周期 + 五维温度计 + 六阶段)
   ============================================================ */
function thermometerScores(){
  const lm=R.limit||{},bd=R.breadth||{};
  const maxLB=Math.max(0,...(lm.ladder||[]).map(x=>x.lb));
  const s1=Math.min(20,Math.round((lm.zt_count||0)/50*20));
  const s2=Math.min(20,Math.round(maxLB/7*20));
  const s3=Math.round((lm.seal_rate||0)/100*20);
  const s4=bd.total?Math.round(bd.up/bd.total*20):0;
  return {vals:[s1,s2,s3,s4],maxLB,totalAuto:s1+s2+s3+s4}}
function leaderScoreNum(){
  // 只提取“⑤龙头健康度 N/20”这一维的得分；严禁抓整段首个数字（总分34会被误截成20，2026-09-10邱总批）
  const t=String(getNote("leader_score")||"");
  let m=t.match(/龙头健康度[^\d]{0,8}(\d{1,2})\s*\/\s*20/)
      ||t.match(/[⑤5][^①②③④⑤\d]{0,8}(\d{1,2})\s*\/\s*20/);
  let v=m?parseInt(m[1],10):NaN;
  if(isNaN(v)){ // 兜底：取所有“N/20”里的最后一个（第五维排在最后）
    const all=[...t.matchAll(/(\d{1,2})\s*\/\s*20/g)].map(x=>parseInt(x[1],10)).filter(n=>n>=0&&n<=20);
    v=all.length?all[all.length-1]:NaN;
  }
  if(isNaN(v))return 0;return Math.max(0,Math.min(20,v));
}
function refreshLeaderNum(){const el=$("#leaderScoreNum");if(el)el.textContent=leaderScoreNum();}
// 五维统一口径：人工 leader_score 若写全①-⑤则以人工为准（保证表格/雷达/文本总分一致，2026-09-10邱总）；缺维回退自动
function fiveDimScores(){
  const auto=thermometerScores();
  const t=String(getNote("leader_score")||"");
  const circ=["①","②","③","④","⑤"],vals=[null,null,null,null,null];
  circ.forEach((c,i)=>{const m=t.match(new RegExp(c+"[^\\d]{0,10}(\\d{1,2})\\s*\\/\\s*20"));if(m)vals[i]=parseInt(m[1],10);});
  if(vals[4]==null)vals[4]=leaderScoreNum();
  for(let i=0;i<4;i++)if(vals[i]==null)vals[i]=auto.vals[i];
  const human=circ.every((c,i)=>new RegExp(c+"[^\\d]{0,10}\\d{1,2}\\s*\\/\\s*20").test(t));
  const total=vals.reduce((a,b)=>a+(b||0),0);
  return {vals,maxLB:auto.maxLB,totalAuto:auto.totalAuto,total,human};
}
function renderEmotionPage(){
  const fg=R.feargreed||{},[fz,fk]=fgZone(fg.today),th=fiveDimScores();
  const emo=R.emotion||{},el=emo.latest||{},ser=emo.series||[];
  return `<div class="grid g2">
    <div class="panel"><h3>恐贪指数（韭圈儿官方 · 沪深300）</h3>
      <div class="kpi-strip">
        <div class="kpi"><div class="lab">今日恐贪</div><div class="val">${f2(fg.today)}</div><div class="sub">${badge(fz,fk)}</div></div>
        <div class="kpi"><div class="lab">昨日/环比</div><div class="val ${cls(fg.mom)}">${signed(fg.mom)}</div><div class="sub">沪深300 ${f2(fg.hs300)}</div></div>
      </div>
      <div class="chart sm" id="chart-fg" style="height:180px;min-height:180px;margin-top:8px"></div>
      <div class="note-src">0-25极度恐惧 / 25-45恐惧 / 45-55中性 / 55-75贪婪 / 75-100极度贪婪。</div>
    </div>
    <div class="panel"><h3>情绪周期曲线（近${emo.window||10}交易日三因子合成，0-100）</h3>
      ${el.score?`<div class="kvline"><span class="k">最新</span><span class="v">${badge(el.zone,emoZone(el.zone))} <b class="num">${f1(el.score)}</b>，较前日${signed(el.chg,1)}，近3日${el.trend}（斜率${signed(el.slope,1)}），距窗口低点(${el.trough_date} ${f1(el.trough_score)})第${el.days_from_trough}天</span></div>`
        :'<div class="muted">窗口累积中</div>'}
      <div class="chart sm" id="chart-emotion" style="height:258px;min-height:258px;margin-top:6px"></div>
      <div class="note-src">${esc(emo.note||"")}</div>
    </div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="panel"><h3>五维情绪温度计（${th.human?"人工五维终稿":"前四维自动，龙头健康度人工"} · 合计 <b class="num">${th.total}</b>/100）</h3>
      <div class="chart sm" id="chart-thermo" style="height:270px;min-height:270px"></div>
      <div class="tbl-wrap"><table><thead><tr><th>维度</th><th class="r">得分</th><th>依据</th></tr></thead><tbody>
        <tr><td>涨停数量</td><td class="r num">${th.vals[0]}/20</td><td class="muted">涨停${R.limit?.zt_count}只，50只满分${th.human?"（人工校准）":""}</td></tr>
        <tr><td>连板高度</td><td class="r num">${th.vals[1]}/20</td><td class="muted">最高${th.maxLB}板，7板满分${th.human?"（人工校准）":""}</td></tr>
        <tr><td>封板率</td><td class="r num">${th.vals[2]}/20</td><td class="muted">封板率${f1(R.limit?.seal_rate)}%${th.human?"（人工校准）":""}</td></tr>
        <tr><td>上涨占比</td><td class="r num">${th.vals[3]}/20</td><td class="muted">${f1(R.breadth?.up/(R.breadth?.total||1)*100)}%个股上涨</td></tr>
        <tr><td>龙头健康度（人工）</td><td class="r num"><b id="leaderScoreNum">${th.vals[4]}</b>/20</td><td class="manual-cell" data-field="leader_score" data-plain="1" style="white-space:normal;color:var(--ink2);min-width:260px"></td></tr>
        <tr style="font-weight:800;background:var(--panel2,#f6f8fb)"><td>五维合计</td><td class="r num">${th.total}/100</td><td class="muted">与左侧人工结论文本、雷达图三者必须一致（自检门禁）</td></tr>
      </tbody></table></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
      <div class="panel"><h3>情绪周期六阶段要素（对照定位）</h3>
        <div class="tbl-wrap"><table><thead><tr><th>阶段</th><th>典型特征</th></tr></thead><tbody>
          <tr><td><span class="tagchip chip-blue">启动</span></td><td style="white-space:normal">冰点后首板增多、炸板率回落、情绪分触底回升</td></tr>
          <tr><td><span class="tagchip chip-up">发酵</span></td><td style="white-space:normal">1进2晋级率走高、连板梯队成形、赚钱效应扩散</td></tr>
          <tr><td><span class="tagchip chip-up">高潮</span></td><td style="white-space:normal">最高板拔高、涨停数峰值、情绪分≥70高位，警惕一致</td></tr>
          <tr><td><span class="tagchip chip-gold">分歧</span></td><td style="white-space:normal">炸板率抬升、高位股震荡、晋级率分化、斜率走平转负</td></tr>
          <tr><td><span class="tagchip chip-gray">退潮</span></td><td style="white-space:normal">连板溢价转负、高标断层、再涨停率下台阶</td></tr>
          <tr><td><span class="tagchip chip-down">冰点</span></td><td style="white-space:normal">情绪分&lt;30、炸板率高企、涨停数低位，等待回暖信号</td></tr>
        </tbody></table></div>
        ${el.score?`<div class="note-src">自动定位：${esc(emo.position_text||"")}</div>`:""}
      </div>
      ${insightBlock("emotion_stage","情绪周期最终定位 · 总-分-总（阶段 + 依据 + 次日观察）","prose")}
    </div>
  </div>`}