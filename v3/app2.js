
/* ============================================================
   P0 首页总览
   ============================================================ */
function renderHome(){
  const ix=Object.fromEntries((R.indices||[]).map(x=>[x.name,x]));
  const sh=ix["上证指数"],kc=ix["科创50"],cy=ix["创业板指"],hs=ix["沪深300"],bj=ix["北证50"],sz50=ix["上证50"];
  const cr=R.crowding||{},tmt=R.tmt||{},fg=R.feargreed||{},bd=R.breadth||{},lm=R.limit||{};
  const [cz,ck]=crowdZone(cr.ratio),[fz,fk]=fgZone(fg.today);
  const emo=R.emotion||{},el=emo.latest||{},style=R.style||{},zp=R.zt_prev||{};
  const bk=(lab,val,sub,c)=>`<div class="bigkpi"><div class="lab">${lab}</div><div class="val ${c||""}">${val}</div><div class="sub">${sub||""}</div></div>`;
  const quad=(style.quadrants||[]).map(q=>`<div class="kpi"><div class="lab">${q.quad} · ${q.index}</div>
    <div class="val ${cls(q.chg)}" style="font-size:19px">${signed(q.chg)}%</div></div>`).join("");
  const bull=(R.notes?.bull||[]),bear=(R.notes?.bear||[]);
  const logicArr=(arr,ph,tone)=>{const a=Array.isArray(arr)?arr:(arr?String(arr).split(/\n/).filter(s=>s.trim()):[]);
    return a.length?`<ol class="logic-list ${tone}">${a.map((x,i)=>`<li data-n="${i+1}">${esc(typeof x==="object"?JSON.stringify(x):x)}</li>`).join("")}</ol>`
    :`<div class="placeholder-empty">${ph}</div>`;};
  return `<div class="section"><div class="sec-body">
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
      <div style="flex:1;min-width:300px;font-size:12.5px;color:var(--ink3)">${R.meta.date} 收盘复盘 · 数据生成 ${R.meta.generated_at} · v${R.meta.version}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${badge("拥挤度 "+f2(cr.ratio)+"% "+cz,ck)}${badge("TMT "+f2(tmt.ratio)+"%",tmt.ratio>=40?"warn":"ok")}
        ${badge("恐贪 "+f2(fg.today)+" "+fz,fk)}${badge("涨停"+(lm.zt_count??"--")+"/跌停"+(lm.dt_count??"--"),"info")}
        ${el.zone?badge("情绪 "+f1(el.score)+" "+el.zone,emoZone(el.zone)):""}
      </div>
    </div>
    <div class="manual home-headline" data-field="headline"><span class="mlab">人工 · 一句话定调</span>
      <div class="view-text" data-view="headline" style="font-size:14px;line-height:1.9;white-space:normal;word-break:break-word"></div></div>
    <div class="home-grid" style="margin-top:13px">
      ${bk("上证指数",f2(sh?.close),`${arrow(sh?.chg_pct)} ${signed(sh?.chg_pct)}% · 成交${yiWan(sh?.amount_yi)}亿`,cls(sh?.chg_pct))}
      ${bk("创业板指",f2(cy?.close),`${arrow(cy?.chg_pct)} ${signed(cy?.chg_pct)}%`,cls(cy?.chg_pct))}
      ${bk("科创50",f2(kc?.close),`${arrow(kc?.chg_pct)} ${signed(kc?.chg_pct)}%`,cls(kc?.chg_pct))}
      ${bk("北证50",f2(bj?.close),`${arrow(bj?.chg_pct)} ${signed(bj?.chg_pct)}%`,cls(bj?.chg_pct))}
      ${bk("全市场成交",yiWan(cr.total_yi)+"亿",`沪深 ${yiWan(cr.sh_sz_yi)} + 北交 ${yiWan(cr.bj_yi)}`,"")}
      ${bk("涨/跌/平",`${f0(bd.up)}/${f0(bd.down)}`,`平${f0(bd.flat)} · 涨跌比${f2(bd.ratio)}`,bd.up>=bd.down?"up":"down")}
      ${bk("情绪周期分",el.score?f1(el.score):"--",el.zone?`${el.zone} · 近3日${el.trend}`:"窗口累积中",el.zone?emoZone(el.zone):"")}
    </div>
    <div class="manual home-headline" style="margin-top:14px" data-field="core_summary"><span class="mlab">人工 · 核心结论（AI每日复核润色）</span>
      <div class="view-text home-prose" data-view="core_summary" style="white-space:normal;word-break:break-word"></div></div>
  </div></div>

  <div class="grid g2">
    <div class="section"><div class="sec-body">
      <h3 style="font-size:13px;color:var(--ink);margin-bottom:8px">风格四象限（大盘价值/均衡 vs 小盘成长/硬核科技）</h3>
      <div class="kpi-strip">${quad}</div>
      <div class="kvline" style="margin-top:8px"><span class="k">剪刀差</span><span class="v">科创50 - 上证50 = <b class="${cls(style.scissor_kc_sz50)}">${signed(style.scissor_kc_sz50)} pct</b>
        ${style.strongest?`（最强：${esc(style.strongest.quad)}，最弱：${esc(style.weakest.quad)}）`:""}</span></div>
      <div class="chart sm" id="chart-style" style="height:200px;min-height:200px;margin-top:6px"></div>
    </div></div>
    <div class="section"><div class="sec-body">
      <h3 style="font-size:13px;color:var(--ink);margin-bottom:8px">短线情绪速览</h3>
      ${el.score?`<div class="kvline"><span class="k">情绪定位</span><span class="v">${badge(el.zone,emoZone(el.zone))} ${f1(el.score)}/100，较前日 <b class="${cls(-(el.chg||0))}">${signed(el.chg,1)}</b>，距窗口低点第 ${el.days_from_trough} 天，近3日${el.trend}（斜率${signed(el.slope,1)}）</span></div>`:'<div class="muted">情绪周期窗口累积中（需近10交易日）</div>'}
      <div class="kvline"><span class="k">涨停/跌停</span><span class="v">${lm.zt_count??"--"} / ${lm.dt_count??"--"} · 炸板${lm.zb_count??"--"} · 封板率${f1(lm.seal_rate)}%</span></div>
      ${zp.money_effect?`<div class="kvline"><span class="k">昨日涨停反馈</span><span class="v">${zp.prev_date}涨停${zp.prev_n}只→今日 均<b class="${cls(zp.money_effect.avg)}">${f2(zp.money_effect.avg)}%</b> / 中位${f2(zp.money_effect.median)}% / 翻红${pct(zp.money_effect.positive_rate)} / 再涨停${pct(zp.money_effect.limit_up_again_rate)}</span></div>`:""}
      <div class="manual" style="margin-top:8px" data-field="emotion_stage"><span class="mlab">人工 · 情绪周期定位</span>
        <div class="view-text" data-view="emotion_stage"></div></div>
    </div></div>
  </div>

  <div class="bullbear">
    <div class="side-col bull"><h4 class="up">多头逻辑（复核填写，5-6条）</h4>
      <div class="manual" data-field="bull" style="border:none;background:transparent;padding:0"><div class="view-text" data-view="bull" data-logic="tone-bull">${logicArr(bull,"待复核：开启复核模式，一行一条多头依据")}</div></div></div>
    <div class="side-col bear"><h4 class="down">空头/风险逻辑（复核填写，5-6条）</h4>
      <div class="manual" data-field="bear" style="border:none;background:transparent;padding:0"><div class="view-text" data-view="bear" data-logic="tone-bear">${logicArr(bear,"待复核：开启复核模式，一行一条空头/风险依据")}</div></div></div>
  </div>`}

/* ============================================================
   P1 全球宏观
   ============================================================ */
function renderGlobal(){
  const g=R.global||{},us=g.us_stocks||{},bonds=g.us_bonds||{};
  const usRow=(k)=>{const x=us[k];if(!x)return `<tr><td>${k}</td><td colspan="3" class="muted">未获取</td></tr>`;
    return `<tr><td>${k}</td><td class="r num">${f2(x.close)}</td><td class="r num ${cls(x.chg_pct)}">${signed(x.chg_pct)}%</td><td class="r num ${cls(x.chg)}">${signed(x.chg)}</td></tr>`};
  const m6=[
    ["比特币 BTC",g.btc&&(g.btc.gate??g.btc.sina),"美元",g.btc&&g.btc.gate_chg,"新浪+gate双源"],
    ["美债10Y",bonds.US10Y&&bonds.US10Y.yield,"%",bonds.US10Y&&(bonds.US10Y.bp_chg/100),`bp变动 ${bonds.US10Y?.bp_chg??"--"}；10Y-2Y/30Y-10Y倒挂监测见下`],
    ["COMEX黄金",g.gold&&g.gold.price,"美元/盎司",g.gold&&g.gold.chg_pct,"纽约金连续"],
    ["WTI原油",g.wti&&g.wti.price,"美元/桶",g.wti&&g.wti.chg_pct,`布油 ${f2(g.brent?.price)}`],
    ["美元指数DXY",(g.dxy_sina&&g.dxy_sina.price)??(g.dxy_em&&g.dxy_em.price),"",(g.dxy_sina&&g.dxy_sina.chg_pct)??(g.dxy_em&&g.dxy_em.chg_pct),"新浪/东财双源"],
    ["离岸人民币",g.usdcnh&&g.usdcnh.price,"",g.usdcnh&&g.usdcnh.chg_pct,"USDCNH"]
  ];
  const m6rows=m6.map(([name,v,u,chg,note])=>`<tr><td>${name}</td><td class="r num">${f2(v)} ${u}</td>
    <td class="r num ${cls(chg)}">${chg==null?"--":(chg>0?"+":"")+f2(chg)+"%"}</td><td class="muted" style="white-space:normal">${note}</td></tr>`).join("");
  const bondRow=k=>{const b=bonds[k];return `<tr><td>${k}</td><td class="r num">${b?f2(b.yield)+"%":"--"}</td>
    <td class="r num ${b&&cls(b.bp_chg)}">${b?signed(b.bp_chg,1)+"bp":"--"}</td></tr>`};
  const u2=bonds.US2Y?.yield,u10=bonds.US10Y?.yield,u30=bonds.US30Y?.yield;
  const inv102=(u10!=null&&u2!=null)?(u10-u2):null, inv3010=(u30!=null&&u10!=null)?(u30-u10):null;
  const sparkDefs=[["vix","VIX期货(近月,非现货)"],["us10y","美债10Y收益率%"],["us30y","美债30Y收益率%"],
    ["gold","COMEX黄金"],["lme_cu","LME铜"],["dxy","美元指数"],["dram","DRAM现货(人工)"],["wti","WTI原油(美元/桶)"]];
  const sparks=sparkDefs.map(([k,t])=>`<div class="spark-cell"><div class="t"><span>${t}</span><span class="v" id="sv-${k}"></span></div><div class="chart sm" id="spark-${k}" style="height:120px;min-height:120px"></div></div>`).join("");
  return `<div class="grid g-side">
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="panel"><h3>隔夜美股与AI龙头（新浪行情/东财双源交叉）</h3>
        <div class="tbl-wrap"><table><thead><tr><th>标的</th><th class="r">收盘</th><th class="r">涨跌幅</th><th class="r">涨跌点</th></tr></thead>
        <tbody>${["道琼斯","纳斯达克","标普500","费城半导体ETF(SOXX)","英伟达","AMD","台积电"].map(usRow).join("")}</tbody></table></div>
        <div class="note-src">SOXX为费半核心ETF；东财交叉：${
          Object.entries(g.us_cross_em||{}).map(([k,v])=>`${k} ${f2(v.close)}(${signed(v.chg_pct)}%)`).join(" / ")||"--"}</div>
      </div>
      <div class="panel"><h3>全球大类资产六项（抓取时刻快照，历史日重跑为当时值）</h3>
        <div class="tbl-wrap"><table><thead><tr><th>资产</th><th class="r">最新</th><th class="r">涨跌</th><th>口径/备注</th></tr></thead>
        <tbody>${m6rows}</tbody></table></div>
        <div class="note-src">VIX 为近月期货（现货无稳定免费自动源）；白银 ${f2(g.silver?.price)}。</div>
      </div>
      ${insightBlock("macro_interp","全球流动性综合判断 · 总-分-总","prose")}
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="panel"><h3>美债收益率曲线 + 倒挂监测</h3>
        <div class="tbl-wrap"><table><thead><tr><th>期限</th><th class="r">收益率</th><th class="r">变动</th></tr></thead>
        <tbody>${["US2Y","US5Y","US10Y","US30Y"].map(bondRow).join("")}</tbody></table></div>
        <div class="kvline" style="margin-top:6px"><span class="k">10Y-2Y</span><span class="v num ${cls(inv102)}">${signed(inv102,2)} pct ${inv102!=null&&inv102<0?badge("倒挂","danger"):badge("正常","ok")}</span></div>
        <div class="kvline"><span class="k">30Y-10Y</span><span class="v num ${cls(inv3010)}">${signed(inv3010,2)} pct ${inv3010!=null&&inv3010<0?badge("倒挂","warn"):""}</span></div>
        <div class="chart sm" id="chart-yieldcurve" style="height:180px;min-height:180px;margin-top:8px"></div>
      </div>
      <div class="panel"><h3>宏观指标趋势（每日收盘append）</h3>
        <div class="spark-grid">${sparks}</div>
        <div class="note-src">序列来自本地 macro_history.json，每交易日自动追加。</div>
      </div>
    </div>
  </div>`}
function ibF(v){return v==null?"--":(v>=0?"+":"")+(+v).toFixed(2)+"%"}