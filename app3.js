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
  return `<div class="section"><div class="sec-head"><span class="sec-no">5A</span><h2>跌停股全表（风险释放方向）</h2><span class="tag">收盘跌停 ${lm.dt_count??0} 只 · 炸板 ${lm.zb_count??0} 只</span></div><div class="sec-body">
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
  // leader_score 文本形如 "16/20：最高6板……"，提取首个 0-20 整数作为第五维得分
  const t=getNote("leader_score")||"";
  const m=String(t).match(/\d{1,2}/);
  let v=m?parseInt(m[0],10):0;
  if(isNaN(v))v=0;return Math.max(0,Math.min(20,v));
}
function refreshLeaderNum(){const el=$("#leaderScoreNum");if(el)el.textContent=leaderScoreNum();}
function renderEmotionPage(){
  const fg=R.feargreed||{},[fz,fk]=fgZone(fg.today),th=thermometerScores();
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
    <div class="panel"><h3>五维情绪温度计（前四维自动，龙头健康度人工）</h3>
      <div class="chart sm" id="chart-thermo" style="height:270px;min-height:270px"></div>
      <div class="tbl-wrap"><table><thead><tr><th>维度</th><th class="r">得分</th><th>依据</th></tr></thead><tbody>
        <tr><td>涨停数量</td><td class="r num">${th.vals[0]}/20</td><td class="muted">涨停${R.limit?.zt_count}只，50只满分</td></tr>
        <tr><td>连板高度</td><td class="r num">${th.vals[1]}/20</td><td class="muted">最高${th.maxLB}板，7板满分</td></tr>
        <tr><td>封板率</td><td class="r num">${th.vals[2]}/20</td><td class="muted">封板率${f1(R.limit?.seal_rate)}%</td></tr>
        <tr><td>上涨占比</td><td class="r num">${th.vals[3]}/20</td><td class="muted">${f1(R.breadth?.up/(R.breadth?.total||1)*100)}%个股上涨</td></tr>
        <tr><td>龙头健康度（人工）</td><td class="r num"><b id="leaderScoreNum">--</b>/20</td><td class="manual-cell" data-field="leader_score" data-plain="1" style="white-space:normal;color:var(--ink2);min-width:260px"></td></tr>
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

/* ============================================================
   P9 复盘观点(人工/AI复核结构化观点块)
   ============================================================ */
function renderEventCard(e){
  const tone=String(e.tone||"中性");
  const tc=/利[多好]|正面|偏多|回暖|上行/.test(tone)?"good":/利[空]|负面|偏空|承压|下行/.test(tone)?"bad":"mid";
  const seg=(lab,txt,c)=>txt?`<div class="ev-seg"><span class="ev-lab ${c}">${lab}</span><div class="ev-txt">${esc(String(txt))}</div></div>`:"";
  return `<div class="ev-card ev-${tc}">
    <div class="ev-head">${e.date?`<span class="ev-date">${esc(e.date)}</span>`:""}<span class="ev-tone tone-${tc}">${esc(tone)}</span><span class="ev-title">${esc(e.title||"")}</span></div>
    ${seg("事件数据",e.data,"d")}${seg("市场反应",e.reaction,"r")}${seg("评估",e.assess,"a")}
  </div>`;
}
function eventCardsBlock(){
  const cs=R.notes?.events_cards;
  if(Array.isArray(cs)&&cs.length)
    return `<div class="panel"><h3>当日核心事件 · 事件驱动卡片（利好/利空 · 事件数据 → 市场反应 → 评估）</h3><div class="ev-grid">${cs.map(renderEventCard).join("")}</div></div>`;
  return manualBlock("events","事件六要素（政策/产业/公司/海外/资金/监管，含来源与传导链）","结构化 events_cards（date/tone/title/data/reaction/assess）将自动渲染为统一卡片");
}
/* ---- 复盘观点3.0 结构化读取助手（数据来自 notes，空则回退人工块） ---- */
function rvArr(field){const v=getNoteRaw(field);if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean);if(typeof v==="string"&&v.trim())return v.split(/\n/).map(s=>s.trim()).filter(Boolean);return []}
function rvTxt(field){const v=getNoteRaw(field);return Array.isArray(v)?v.join("\n"):(v==null?"":String(v))}
function rvCard(no,title,sub,inner,cls){return `<section class="rv-card ${cls||""}"><div class="rv-head"><span class="rv-no">${no}</span><h3>${title}</h3>${sub?`<span class="rv-sub">${sub}</span>`:""}</div><div class="rv-body">${inner}</div></section>`}
function rvTextField(field,no,title,sub,cls){const t=rvTxt(field).trim();return rvCard(no,title,sub,t?`<div class="rv-prose ${cls||""}">${esc(t)}</div>`:manualBlock(field,title,""),cls)}
/* ② 论点论据（偏多/偏空） */
function rvArgs(){
  const bull=rvArr("bull"),bear=rvArr("bear");
  if(!bull.length&&!bear.length)return `<div class="grid g2">${manualBlock("bull","偏多因素（一行一条）","")}${manualBlock("bear","偏空因素（一行一条）","")}</div>`;
  const li=a=>a.map(x=>`<li>${esc(x.replace(/^[\s\-·•\d.、）)]+/,""))}</li>`).join("");
  return `<div class="rv-args">
    <div class="rv-side rv-bull"><h4>▲ 偏多论据（${bull.length}条）</h4><ul>${li(bull)}</ul></div>
    <div class="rv-side rv-bear"><h4>▼ 偏空论据（${bear.length}条）</h4><ul>${li(bear)}</ul></div></div>`;
}
/* ③ 核心驱动事件：点击标题折叠/展开 */
function rvEvents(){
  const cs=getNoteRaw("events_cards");
  if(!Array.isArray(cs)||!cs.length)return eventCardsBlock();
  const tc=t=>/利[多好]|正面|偏多|回暖|上行/.test(t)?"good":/利[空]|负面|偏空|承压|下行/.test(t)?"bad":"mid";
  return cs.map((e,i)=>{
    const c=tc(String(e.tone||"中性"));
    const seg=(lab,txt,k)=>txt?`<div class="rv-dseg"><span class="rv-dlab ${k}">${lab}</span><div class="rv-dtxt">${esc(String(txt))}</div></div>`:"";
    return `<details class="rv-seat" ${i===0?"open":""}>
      <summary><span class="ev-tone tone-${c}">${esc(e.tone||"中性")}</span><span class="rv-stitle">${i+1}. ${esc(e.title||"")}</span><span class="rv-arrow"></span></summary>
      <div class="rv-drv">${seg("事件数据",e.data,"d")}${seg("市场反应",e.reaction,"r")}${seg("评估",e.assess,"a")}</div></details>`;
  }).join("");
}
/* ④ 三情景：解析"基准（概率50%）：区间，描述"为表 */
function rvScenarios(){
  const arr=rvArr("scenarios");
  if(!arr.length)return `<div class="grid g2">${manualBlock("scenarios","次日三情景（基准/乐观/谨慎：概率+区间+应对）","")}${manualBlock("falsify","证伪信号（出现即推翻判断+对应仓位动作）","")}</div>`;
  const rows=arr.map(s=>{
    let m=s.match(/^(基准|乐观|谨慎|悲观|中性)[^（(：:]*[（(]?\s*概率?\s*(\d+\s*%)?\s*[)）]?\s*[:：]\s*([\s\S]*)$/);
    let name,prob,rest;if(m){name=m[1];prob=m[2]||"--";rest=m[3].trim()}else{name="情景";prob="--";rest=s}
    let rng="--",desc=rest;const rm=rest.match(/^([^，。；;]+)[，。；;]([\s\S]*)$/);
    if(rm){rng=rm[1];desc=rm[2]}
    return `<tr><td class="rv-scname">${esc(name)}</td><td class="rv-scprob">${esc(prob)}</td><td style="white-space:normal">${esc(rng)}</td><td style="white-space:normal">${esc(desc)}</td></tr>`;
  }).join("");
  const fal=rvArr("falsify");
  const falBox=fal.length?`<div class="rv-cal" style="margin-top:0"><h4>⚑ 量化证伪信号（出现即降权/减仓）</h4><ul class="rv-blist">${fal.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:manualBlock("falsify","证伪信号","");
  return `<div class="tbl-wrap"><table><thead><tr><th>情景</th><th>概率</th><th>指数区间/条件</th><th>推演与应对要点</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div style="margin-top:13px">${falBox}</div>`;
}
/* ⑥ 昨日候选池回溯（闭环） */
function rvPoolReview(){
  const cr=rvTxt("candidate_review").trim(),pr=rvTxt("pool_review").trim();
  const t=cr||pr;if(!t)return manualBlock("pool_review","昨日候选池回溯（昨日点名个股今日实际表现，对错复盘）","");
  return `<div class="rv-prose">${esc(t)}</div>${pr&&pr!==cr?`<div class="rv-prose" style="margin-top:10px">${esc(pr)}</div>`:""}`;
}
/* ⑦ 风险排除 */
function rvExclude(){
  const a=rvArr("pool_exclude");if(!a.length)return manualBlock("pool_exclude","今日风险排除（剔除/回避标的及原因，一行一条）","");
  return `<div class="rv-risk">${a.map(x=>`<div class="rv-rk">${esc(x.replace(/^[-·•\s]+/,""))}</div>`).join("")}</div>`;
}
/* ⑧ 次日入池：解析"名称 代码｜理由｜计划"为表（含入选理由+交易计划） */
function rvPoolNew(){
  const a=rvArr("pool_new");if(!a.length)return manualBlock("pool_new","次日入池观察（每项：名称 代码｜入选理由｜交易计划）","仅研究观察，不构成买卖建议、不承诺收益");
  const rows=a.map(s=>{
    const parts=s.split(/[｜|]/).map(x=>x.trim()).filter(Boolean);
    const code=(s.match(/\d{6}/)||[""])[0],isSec=!code;
    let first=parts[0]||s;let name=first.replace(/\d{6}/g,"").replace(/[（()）]/g,"").replace(/^[-·•\s]+/,"").trim()||first;
    let mid=parts.slice(1),plan="";
    if(mid.length){const last=mid[mid.length-1];if(/观察|不追|回踩|止损|止盈|逢低|轻仓|等|破|分散|配套|不超|上限/.test(last)){plan=last;mid=mid.slice(0,-1)}}
    let reason=mid.join("；")||(isSec?s:"");
    return `<tr><td class="rv-code">${esc(code||"板块")}</td><td style="white-space:normal;font-weight:700;color:var(--ink)">${esc(name)}</td><td style="white-space:normal">${esc(reason)}</td><td style="white-space:normal">${esc(plan||"回踩/分歧日再评估，不追高")}</td></tr>`;
  }).join("");
  return `<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>标的</th><th>入选理由</th><th>交易计划</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="note-src" style="margin-top:8px">仅为研究观察标的，不构成买卖建议、不承诺收益；仓位遵循「逢低轻仓/回踩观察、禁止大阳线追高」纪律。</div>`;
}
/* ⑩ 近期事件 + 未核实诚实披露 */
function rvCalUnver(){
  const cal=rvArr("events_calendar"),uv=rvArr("unverified");
  const calBox=cal.length?`<ul class="rv-blist">${cal.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:'<span class="muted">待复核补充未来1-2周催化日历</span>';
  const uvBox=uv.length?`<ul class="rv-blist">${uv.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:'<span class="muted">无未核实项（全部数据已双源核实）</span>';
  return `<div class="grid g2">
    <div class="rv-cal"><h4>📅 近期关键事件关注</h4>${calBox}</div>
    <div class="rv-unverified"><h4>⚐ 未核实 / 口径差异诚实披露</h4>${uvBox}</div></div>`;
}
function renderReview(){
  const nature=rvTxt("nature").trim();
  return `<div class="rv-wrap">
    ${rvCard("①","市场定性 · 总论","结论先行（总）",nature?`<div class="rv-nature">${esc(nature)}</div>`:manualBlock("nature","市场定性（当前处于什么市场/阶段/总体仓位取向）",""))}
    ${rvCard("②","论点论据 · 偏多 vs 偏空","多空因素逐条对照（分）",rvArgs())}
    ${rvCard("③","核心驱动事件","点击标题展开 / 收起 · 事件数据 → 市场反应 → 评估",rvEvents())}
    ${rvCard("④","次日三情景推演 + 量化证伪信号","基准/乐观/谨慎概率与区间",rvScenarios())}
    ${rvCard("⑤","三重共振选股结论","技术面 × 情绪面 × 资金面",(()=>{const t=rvTxt("triple").trim();return t?`<div class="rv-triple">${esc(t)}</div>`:manualBlock("triple","三重共振结论","")})())}
    ${rvCard("⑥","昨日候选池回溯（闭环）","验证昨日关注、迭代选股",rvPoolReview())}
    ${rvCard("⑦","今日风险排除项","剔除/回避方向及原因",rvExclude())}
    ${rvCard("⑧","次日入池观察 · 入选理由与交易计划","可荐股口径 · 仅研究观察",rvPoolNew())}
    ${rvTextField("position","⑨","仓位与风控节奏","总仓位/单线上限/止损纪律","")}
    ${rvCalUnver()}
  </div>`}

/* ============================================================
   P10 我的股票池(localStorage 增删改, 自动标注当日状态)
   ============================================================ */
function loadPool(){try{return JSON.parse(localStorage.getItem(POOL_KEY)||"[]")}catch(e){return []}}
function savePool(p){try{localStorage.setItem(POOL_KEY,JSON.stringify(p));toast("股票池已保存到本机浏览器")}catch(e){toast("保存失败")}}
function poolMark(code){
  const marks=[];
  const zt=(R.limit?.zt_items||[]).find(x=>x.code===code);
  if(zt)marks.push(`<span class="tagchip chip-up">${zt.lb}板涨停</span>`);
  const lhb=[...(R.lhb?.buy_top5||[]),...(R.lhb?.sell_top5||[])].find(x=>x.code===code);
  if(lhb)marks.push(`<span class="tagchip chip-gold">龙虎榜 ${signed(lhb.net_yi,2)}亿</span>`);
  const f10=[...(R.funds?.in_top10||[]),...(R.funds?.out_top10||[])].find(x=>x.code===code);
  if(f10)marks.push(`<span class="tagchip chip-blue">主力${signed(f10.main_yi)}亿</span>`);
  return marks.join(" ");
}
function pickRow(s){
  s=String(s);
  let m=s.match(/^(.*?)[（(](\d{6})[)）]\s*[:：]?\s*(.*)$/);
  if(m&&m[3]!==undefined)return `<div class="pick-row"><span class="pick-nm">${esc(m[1].trim())}<span class="code">${m[2]}</span></span><span class="pick-rs">${esc(m[3].trim())}</span></div>`;
  m=s.match(/^([^:：]{2,14})[:：](.*)$/);
  if(m)return `<div class="pick-row"><span class="pick-nm">${esc(m[1].trim())}</span><span class="pick-rs">${esc(m[2].trim())}</span></div>`;
  return `<div class="pick-row"><span class="pick-rs">${esc(s)}</span></div>`;
}
function pickPanel(title,arr,kind,hint){
  arr=Array.isArray(arr)?arr:[];
  if(!arr.length)return "";
  return `<div class="panel pick-panel pick-${kind}" style="margin-bottom:12px"><h3>${title}（${arr.length}）${hint?`<span style="font-weight:400;font-size:11px;color:var(--ink3)">${hint}</span>`:""}</h3>${arr.map(pickRow).join("")}</div>`;
}
function renderMyPool(){
  const pool=loadPool();
  const groups=["核心观察","弹性","回避"];
  const wl=R.notes?.watchlist||{};
  const core=wl.core||R.notes?.pool_core||[];
  const flex=wl.flex||R.notes?.pool_flex||[];
  const avoid=wl.avoid||R.notes?.pool_avoid||[];
  const hasPick=core.length||flex.length||avoid.length;
  const preset=(R.notes?.pool_new||[]);
  const groupBlock=g=>{
    const items=pool.filter(x=>x.group===g);
    return `<div class="panel" style="margin-bottom:12px"><h3>${g}（${items.length}）</h3>
      ${items.length?`<div class="tbl-wrap"><table><thead><tr><th>代码</th><th>名称</th><th>当日状态(自动匹配涨停/龙虎榜/主力)</th><th>逻辑/备注</th><th class="r">操作</th></tr></thead><tbody>
      ${items.map((x,i)=>`<tr><td class="code">${esc(x.code)}</td><td><b>${esc(x.name)}</b></td>
        <td style="white-space:normal">${poolMark(x.code)||'<span class="muted">--</span>'}</td>
        <td style="white-space:normal;min-width:220px">${esc(x.note||"")}</td>
        <td class="r"><button class="mini-btn del" data-pool-del="${pool.indexOf(x)}">删除</button></td></tr>`).join("")}
      </tbody></table></div>`:'<div class="muted">暂无</div>'}</div>`};
  return `<div class="section"><div class="sec-head"><span class="sec-no">8A</span><h2>仓位风控与候选池闭环</h2><span class="tag">完整结构化内容见「复盘观点」⑥⑦⑨</span></div><div class="sec-body rv-wrap">
    <div class="rv-prose" style="background:#f6f9fe;border:1px solid var(--line2);border-radius:10px;padding:13px 17px;font-size:13.3px;line-height:1.9">
      「昨日候选池回溯」「今日风险排除」「次日入池·入选理由与交易计划」「仓位与风控节奏」已按总分总结构统一放在 <b>⑦复盘观点</b> 页（⑥⑦⑧⑨节），本页不再重复维护，避免两处口径不一致。本页只保留：AI 每日三档推荐（8B）+ 你的本机自选池（8C，localStorage 保存、自动匹配当日涨停/龙虎榜/主力状态）。
    </div>
  </div></div>
  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">8B</span><h2>今日三档观察池 · 核心观察 / 弹性 / 回避</h2><span class="tag">AI复盘推荐 · 仅研究观察、不承诺收益</span></div><div class="sec-body">
    ${pickPanel("① 核心观察（趋势延续：成交活跃 / 站上MA55 / 60分走强）",core,"core")}
    ${pickPanel("② 弹性（向上弹性较好的品种）",flex,"flex")}
    ${pickPanel("③ 回避（当日整体走弱板块 / 高位补跌个股）",avoid,"avoid")}
    ${hasPick?"":manualBlock("watchlist","三档观察池（notes.watchlist.core/flex/avoid，每项『名称(代码)：理由』）","")}
    ${preset.length?`<div class="manual" style="margin-top:6px"><span class="mlab">人工 · 次日入池 pool_new</span><div class="view-text" style="margin-top:4px;white-space:pre-wrap">${esc(Array.isArray(preset)?preset.join("\n"):preset)}</div></div>`:""}
  </div></div>
  <div class="section" style="margin-top:14px"><div class="sec-head"><span class="sec-no">8C</span><h2>我的自选池（本机保存 · 可增删 · 自动匹配当日状态）</h2></div><div class="sec-body">
    <div class="pool-add">
      <input id="poolCode" placeholder="代码 如000001" style="width:130px">
      <input id="poolName" placeholder="名称" style="width:120px">
      <select id="poolGroup">${groups.map(g=>`<option>${g}</option>`).join("")}</select>
      <input id="poolNote" placeholder="逻辑/催化/风险（可选）" style="flex:1;min-width:200px">
      <button class="mini-btn" id="poolAddBtn">＋ 加入股票池</button>
      <button class="mini-btn" id="poolPresetBtn" title="把次日入池 pool_new 里带代码的标的一键导入核心观察">导入次日入池(pool_new)</button>
      <button class="mini-btn del" id="poolClearBtn">清空</button>
    </div>
    <div class="note-src">8B 三档为 AI 复盘每日推荐（数据源 notes.watchlist）；8C 自选池仅保存在本机浏览器 localStorage，不上传不联网，切换交易日自动匹配当日涨停梯队/龙虎榜/主力Top10。</div>
  </div></div>
  <div style="margin-top:14px">${groups.map(groupBlock).join("")}</div>`}
function bindPool(){
  const add=$("#poolAddBtn");if(!add)return;
  add.onclick=()=>{
    const code=$("#poolCode").value.trim(),name=$("#poolName").value.trim();
    if(!code){toast("请填写代码");return}
    const pool=loadPool();if(pool.some(x=>x.code===code)){toast("该代码已在池中");return}
    pool.push({code,name:name||code,group:$("#poolGroup").value,note:$("#poolNote").value.trim(),added:R.meta.date});
    savePool(pool);renderAll();switchPage("mypool")};
  const pc=$("#poolClearBtn");pc.onclick=()=>{if(confirm("确认清空整个股票池？")){savePool([]);renderAll();switchPage("mypool")}};
  const pp=$("#poolPresetBtn");pp.onclick=()=>{
    const raw=R.notes?.pool_new;if(!raw||(Array.isArray(raw)&&!raw.length)){toast("复盘观点页尚未填写次日入池");return}
    const text=Array.isArray(raw)?raw.join("\n"):String(raw);
    const pool=loadPool();let n=0;
    text.split(/\n/).forEach(line=>{const m=line.match(/(?:[（(]?)(\d{6})(?:[)）]?)/);
      if(m&&!pool.some(x=>x.code===m[1])){const nm=(line.replace(m[1],"").replace(/[（()）]/g,"").trim().split(/\s+/)[0])||m[1];
        pool.push({code:m[1],name:nm,group:"核心观察",note:line.trim(),added:R.meta.date});n++}});
    savePool(pool);toast(`已导入${n}只`);renderAll();switchPage("mypool")};
  $$("[data-pool-del]").forEach(b=>b.onclick=()=>{const pool=loadPool();pool.splice(+b.dataset.poolDel,1);savePool(pool);renderAll();switchPage("mypool")});
}

/* ============================================================
   人工复核字段
   ============================================================ */
function notes(){if(!state.notesDraft){state.notesDraft=JSON.parse(JSON.stringify(R.notes||{}))}return state.notesDraft}
