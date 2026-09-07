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
      ${manualBlock("emotion_stage","人工 · 情绪周期最终定位（结合自动分与盘面，给出阶段+依据+次日观察）","")}
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
function renderReview(){
  return `<div class="rv-wrap">
    <div class="grid g2">
      ${manualBlock("nature","市场定性（一句话：当前处于什么市场/什么阶段/总体仓位取向）","")}
      ${manualBlock("style_note","风格判断（价值/成长、大盘/小盘、科技/红利，结合风格四象限与剪刀差）","")}
    </div>
    ${eventCardsBlock()}
    ${manualBlock("drivers","核心驱动 4-6个（三段式：事件/数据 → 市场反应 → 评估与持续性，一行一个）","")}
    ${manualBlock("industry_logic","题材深度归因（为什么涨/能不能持续/验证信号）","")}
    <div class="grid g2">
      ${manualBlock("scenarios","次日三情景（基准/乐观/悲观：概率+指数区间+应对要点，不写买卖价位）","")}
      ${manualBlock("falsify","证伪信号（什么信号出现就推翻当前判断，并绑定对应仓位动作）","")}
    </div>
    <div class="grid g2">
      ${manualBlock("events_calendar","未来1-2周催化日历（事件/日期/相关方向）","")}
      ${manualBlock("dram_note","DRAM/存储现货与小金属（自动源缺失，人工补价格与解读）","")}
    </div>
    <div class="verdict"><h3>三重共振结论</h3>
    <div class="manual" data-field="triple" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.3)"><div class="view-text" data-view="triple"></div></div>
    <p style="margin-top:8px">技术面（三位一体60分）× 情绪面（情绪周期/涨停反馈）× 资金面（主力/龙虎榜/拥挤度）三方同向为共振，分歧时降权。候选池回溯 / 仓位风控 / 风险排除已统一移至「我的股票池」页。</p></div>
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
  return `<div class="section"><div class="sec-head"><span class="sec-no">8A</span><h2>仓位风控与候选池闭环（自「复盘观点」迁入）</h2></div><div class="sec-body rv-wrap">
    ${manualBlock("position","仓位与风控（总仓位区间/单线上限/止损纪律，研究框架、不构成投资建议）","")}
    ${manualBlock("pool_review","昨日候选池回溯（闭环验证：昨日点名个股今日实际表现，对错复盘）","")}
    ${manualBlock("pool_exclude","次日入池风险排除（剔除/回避标的及原因）","")}
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
function noteText(v){
  if(v==null)return "";
  if(typeof v==="string")return v;
  if(typeof v==="number")return String(v);
  if(Array.isArray(v))return v.map(x=>typeof x==="object"?JSON.stringify(x):String(x)).join("\n");
  const labels={win:"【赚钱效应】",lose:"【亏钱效应】",core:"【核心观察】",flex:"【弹性】",avoid:"【回避】"};
  return Object.entries(v).map(([k,a])=>{const t=noteText(a);return t?((labels[k]||("【"+k+"】"))+"\n"+t):null}).filter(Boolean).join("\n")
}
function getNote(field,code){const n=notes();let v=n[field];if(code)v=(v&&v[code])||"";return noteText(v)}
function setNote(field,val,code){const n=notes();if(code){n[field]=n[field]||{};n[field][code]=val||""}else n[field]=val}
function bindManualEditable(){
  $$(".manual").forEach(box=>{
    const field=box.dataset.field,view=box.querySelector("[data-view]");
    if(!view)return;
    view.style.whiteSpace="pre-wrap";
    const v=getNote(field);
    if(view.dataset.bound)return; // 保留 renderHome 预置的占位
    view.innerHTML=v?esc(v):'<span class="placeholder-empty">待复核：开启右上角「复核模式」后在此填写</span>';
  });
  $$(".manual-cell").forEach(td=>{
    const {field,code}=td.dataset;const v=getNote(field,code);
    td.innerHTML=v?esc(v):'<span class="placeholder-empty">待填</span>';td.style.whiteSpace="pre-wrap";
  });
  $$("[contenteditable]").forEach(el=>el.remove());
  if(state.review){
    $$(".manual .view-text").forEach(view=>{
      const box=view.closest(".manual"),field=box.dataset.field;
      view.contentEditable="true";
      const v=getNote(field);view.textContent=v||"";
      view.addEventListener("input",()=>{setNote(field,view.textContent);persistDraft()})
    });
    $$(".manual-cell").forEach(td=>{
      td.contentEditable="true";const v=getNote(td.dataset.field,td.dataset.code);td.textContent=v||"";
      td.addEventListener("input",()=>{setNote(td.dataset.field,td.textContent,td.dataset.code);persistDraft();if(td.dataset.field==="leader_score")refreshLeaderNum()})
    })
  }
}
function persistDraft(){try{localStorage.setItem("review_"+state.date,JSON.stringify(notes()))}catch(e){}}
function applyNotesDraft(){
  const saved=localStorage.getItem("review_"+state.date);
  if(saved){try{state.notesDraft=JSON.parse(saved)}catch(e){}}
  bindManualEditable();
  if(window.echarts){const c=CHARTS["chart-thermo"];if(c)drawAllCharts()}
}
function exportNotes(){
  const n=notes();download(`notes_${state.date}.json`,JSON.stringify(n,null,2),"application/json;charset=utf-8");
  toast("复核稿已下载，请放入 data/ 目录，下次更新自动合并")}

/* ============================================================
   导出
   ============================================================ */
function idxMap(){return Object.fromEntries((R.indices||[]).map(x=>[x.name,x]))}
function mdTable(head,rows){return `| ${head.join(" | ")} |\n|${head.map(()=>"---").join("|")}|\n`+
  rows.map(r=>`| ${r.join(" | ")} |`).join("\n")}
function buildMarkdown(){
  const im=idxMap(),cr=R.crowding,tmt=R.tmt,fg=R.feargreed,lm=R.limit,L=[];
  const n=notes();const NT=(k,f)=>noteText(n[k])||(f||"（待复核补充）");
  L.push(`# A股每日复盘 ${R.meta.date}`,"",n.headline||">（待填一句话定调）","");
  // 风格与情绪速览
  const st=R.style,emo=R.emotion?.latest,zp=R.zt_prev;
  if(st)L.push(`风格四象限：上证50 ${signed(st.quadrants?.find(q=>q.index==="上证50")?.chg)}% / 沪深300 ${signed(st.quadrants?.find(q=>q.index==="沪深300")?.chg)}% / 创业板 ${signed(st.quadrants?.find(q=>q.index==="创业板指")?.chg)}% / 科创50 ${signed(st.quadrants?.find(q=>q.index==="科创50")?.chg)}%；科创50-上证50剪刀差 ${signed(st.scissor_kc_sz50)} pct。`,"");
  if(emo)L.push(`情绪周期：${emo.zone} ${f1(emo.score)}/100，环比${signed(emo.chg,1)}，近3日${emo.trend}，距窗口低点第${emo.days_from_trough}天。`,"");
  if(zp?.money_effect)L.push(`昨日涨停反馈：${zp.prev_date}涨停${zp.prev_n}只→今日均${signed(zp.money_effect.avg)}%/中位${signed(zp.money_effect.median)}%/翻红${pct(zp.money_effect.positive_rate)}/再涨停${pct(zp.money_effect.limit_up_again_rate)}；1进2 ${pct(zp.promotion["1to2"].rate)}、2进3 ${pct(zp.promotion["2to3"].rate)}、3板+ ${pct(zp.promotion["3plus"].rate)}。`,"");
  L.push("## 〇、全球宏观流动性");
  const g=R.global||{};
  L.push("### 隔夜美股",mdTable(["标的","收盘","涨跌幅%"],Object.entries(g.us_stocks||{}).map(([k,v])=>[k,f2(v.close),signed(v.chg_pct)])));
  L.push("",mdTable(["资产","最新","涨跌"],[
    ["BTC",f2(g.btc?.gate??g.btc?.sina),f2(g.btc?.gate_chg)],
    ["美债10Y",f2(g.us_bonds?.US10Y?.yield)+"%",signed(g.us_bonds?.US10Y?.bp_chg,1)+"bp"],
    ["COMEX黄金",f2(g.gold?.price),signed(g.gold?.chg_pct)+"%"],
    ["WTI原油",f2(g.wti?.price),signed(g.wti?.chg_pct)+"%"],
    ["美元指数",f2(g.dxy_sina?.price??g.dxy_em?.price),signed(g.dxy_sina?.chg_pct??g.dxy_em?.chg_pct)+"%"],
    ["离岸人民币",f2(g.usdcnh?.price),signed(g.usdcnh?.chg_pct)+"%"]]),"");
  L.push(n.macro_interp||"（待填全球流动性判断）","");
  L.push("## 一、核心指数表现",mdTable(["指数","收盘","涨跌幅%","成交额亿","换手%"],
    (R.indices||[]).filter(x=>x.name!=="深证综指").map(x=>[x.name,f2(x.close),signed(x.chg_pct),yiWan(x.amount_yi),f2(x.turnover)])));
  L.push(`\n涨${R.breadth.up}/跌${R.breadth.down}/平${R.breadth.flat}；涨停${lm.zt_count}/跌停${lm.dt_count}；全市场成交${yiWan(cr.total_yi)}亿（沪深${yiWan(cr.sh_sz_yi)}+北交${yiWan(cr.bj_yi)}）。`,"");
  L.push("## 二、板块与题材");
  L.push("行业涨幅前5："+(R.industries.top5||[]).map(x=>`${x.name}${signed(x.avg_chg)}%`).join("、"));
  L.push("行业跌幅前5："+(R.industries.bottom5||[]).map(x=>`${x.name}${signed(x.avg_chg)}%`).join("、"));
  L.push("概念红榜："+(R.concepts.red5||[]).map(x=>`${x.name}(${f1(x.up_ratio)}%)`).join("、"));
  L.push("概念绿榜："+(R.concepts.green5||[]).map(x=>`${x.name}(${f1(x.up_ratio)}%)`).join("、"),"");
  L.push(n.industry_rotation||"（待填板块轮动归因）","");
  L.push("## 三、拥挤度与资金结构");
  L.push(`- 全市场拥挤度 **${f2(cr.ratio)}%**（前${cr.topn}只${yiWan(cr.top5_yi)}/${yiWan(cr.total_yi)}亿，${crowdZone(cr.ratio)[0]}）`);
  L.push(`- TMT占比 **${f2(tmt.ratio)}%**（电子${yiWan(tmt.parts["电子"])}、通信${yiWan(tmt.parts["通信"])}、计算机${yiWan(tmt.parts["计算机"])}、传媒${yiWan(tmt.parts["传媒"])}亿）`);
  if(R.margin)L.push(`- 两融(${R.margin.date})合计${yiWan(R.margin.total_yi)}亿，融资余额${yiWan(R.margin.rzye_yi)}亿`);
  L.push("- 北向净买入2024年8月起停披露，仅成交额口径",n.omo?("- 央行OMO："+n.omo):"","");
  L.push("## 龙虎榜专区");
  const l=R.lhb;
  L.push(`去重上榜${l.n_stocks}只（条款${l.n_records}），净买合计${signed(l.net_total_yi)}亿，净买为正${l.n_positive}只。`);
  L.push(mdTable(["净买Top5","涨跌%","净买亿","题材归因(人工)"],(l.buy_top5||[]).map(x=>[x.name,signed(x.chg),signed(x.net_yi,3),(n.lhb_theme||{})[x.code]||""])));
  L.push(mdTable(["净卖Top5","涨跌%","净卖亿","信号(人工)"],(l.sell_top5||[]).map(x=>[x.name,signed(x.chg),signed(x.net_yi,3),(n.lhb_signal||{})[x.code]||""])));
  L.push("龙虎榜∩连板："+(l.ladder_overlap||[]).map(x=>`${x.lb}板${x.name}(${signed(x.net_yi)}亿)`).join("、"));
  L.push(n.lhb_interp||"（待填游资解读）","");
  L.push("## 四、情绪与连板梯队");
  L.push(`恐贪${f2(fg.today)}（${fgZone(fg.today)[0]}，环比${signed(fg.mom)}）；最高${thermometerScores().maxLB}板；封板率${f1(lm.seal_rate)}%。`);
  (lm.ladder||[]).forEach(r=>L.push(`- ${r.lb}板×${r.count}：${r.items.map(i=>i.name).join("、")}`));
  L.push("",NT("emotion_stage","（待填情绪周期）"),"",NT("money_effect","（待填赚钱/亏钱效应）"),"");
  L.push("## 八、三位一体60分钟");
  (R.tech60||[]).forEach(t=>L.push(`- ${t.name}：**${t.grade}**，收${f2(t.price)}，MA55=${f2(t.ma55)}（${t.above?"站上":"跌破"}），DIF=${f2(t.dif)}、DEA=${f2(t.dea)}、柱${signed(t.bar)}`));
  L.push("",NT("tech_detail"),"");
  L.push("## 五/七、事件与观点",NT("nature"),"",NT("drivers"),"",NT("events"),"",NT("events_calendar","（无催化日历）"),NT("dram_note",""),NT("unverified","（无未核实项）"),"");
  L.push("## 九、次日策略与候选池",NT("scenarios"),"",NT("falsify","（无）"),"",NT("position"),"",NT("pool_review","（无候选池回溯）"),NT("pool_new","（无次日入池）"),"");
  L.push("## 十、风险提示",NT("risks","（待填）"),"","---",
    `数据自检：${R.selfcheck.n_pass}/${R.selfcheck.n_total} 通过。本报告仅为研究观察，不构成投资建议。市场有风险，投资需谨慎。`);
  return L.join("\n")
}
function buildPlainText(){return buildMarkdown().replace(/[#*`>|]/g,"").replace(/\n{3,}/g,"\n\n").replace(/^---$/gm,"")}
function exportHtmlSnapshot(){
  const clone=document.documentElement.cloneNode(true);
  document.querySelectorAll(".chart").forEach(el=>{
    const id=el.id,c=CHARTS[id],srcEl=clone.querySelector("#"+id);
    if(c&&srcEl){const img=document.createElement("img");img.src=c.getDataURL({pixelRatio:2,backgroundColor:"#fff"});
      img.style.width="100%";srcEl.innerHTML="";srcEl.appendChild(img)}});
  clone.querySelectorAll("script").forEach(s=>s.remove());
  clone.querySelectorAll(".top-controls,.tabbar,.toast,.modal-mask,.pool-add").forEach(s=>s.remove());
  clone.querySelectorAll(".page").forEach(p=>p.classList.add("active"));
  clone.querySelectorAll("[contenteditable]").forEach(s=>s.removeAttribute("contenteditable"));
  download(`复盘快照_${state.date}.html`,'<!DOCTYPE html>\n'+clone.outerHTML,"text/html;charset=utf-8");toast("精美HTML快照已导出")
}

/* ============================================================
   源状态 / 初始化
   ============================================================ */
function fillSourceState(){
  const w=R.meta.warnings||[],sc=R.selfcheck||{};const el=$("#srcState");
  if(w.length)el.innerHTML=`<span class="dot a"></span>${w.length}条警告 · 自检${sc.n_pass}/${sc.n_total}`;
  else if(sc.all_pass)el.innerHTML=`<span class="dot g"></span>数据源正常 · 自检全通过`;
  else el.innerHTML=`<span class="dot a"></span>自检${sc.n_pass}/${sc.n_total}`
}
function initDateSelect(){
  const sel=$("#dateSelect"),dates=(window.DATES||[]).slice().sort().reverse();
  sel.innerHTML=dates.map(d=>`<option ${d===state.date?"selected":""}>${d}</option>`).join("");
  sel.onchange=()=>switchDate(sel.value)
}
