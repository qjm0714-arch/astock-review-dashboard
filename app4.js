function poolCarryHtml(){
  const c=R.pool_carry; if(!c||!c.prev_date) return "";
  const track=R.notes?.pool_track||{};
  const actCls=a=>/止损|移出|剔除/.test(a)?"down":(/止盈/.test(a)?"gold":/持有|继续|观察/.test(a)?"up":"");
  const actBadge=a=>a?`<span class="pact ${actCls(a)}">${esc(a)}</span>`:'<span class="pact pending">待复核</span>';
  let body;
  if(!c.rows.length){
    body=`<div class="muted" style="padding:8px 2px">上一交易日（${esc(c.prev_date)}）未留存带个股代码的「次日入池」，今日无逐只闭环标的；滚动闭环自今日 pool_new 起，下一交易日收盘后自动在此逐只复盘（继续观察 / 持有 / 止损移出 / 止盈 / 移出）。</div>`;
  }else{
    body=`<div class="tbl-wrap"><table><thead><tr><th>名称(代码)</th><th>入选日</th><th>入选逻辑</th><th class="r">今日涨跌%</th><th class="r">主力净亿</th><th>处置</th><th>处置依据</th></tr></thead><tbody>
    ${c.rows.map(x=>{const t=track[x.code]||{};return `<tr>
      <td style="white-space:nowrap"><b>${esc(x.name)}</b> <span class="code">${esc(x.code)}</span>${x.industry?`<div class="muted" style="font-size:11px">${esc(x.industry)}</div>`:""}</td>
      <td class="num">${esc(x.from_date)}</td>
      <td style="white-space:normal;min-width:200px">${esc(x.reason)}</td>
      <td class="r num ${cls(x.today_chg)}">${x.today_chg==null?"--":signed(x.today_chg)}</td>
      <td class="r num ${cls(x.today_main_yi)}">${x.today_main_yi==null?"--":signed(x.today_main_yi)}</td>
      <td style="white-space:nowrap">${actBadge(t.action)}</td>
      <td style="white-space:normal;min-width:180px">${t.note?esc(t.note):'<span class="muted">--</span>'}</td></tr>`}).join("")}
    </tbody></table></div>`;
  }
  return `<div class="panel" style="margin-bottom:14px"><h3>候选池滚动闭环 · ${esc(c.prev_date)} 入池 → 今日逐只处置</h3>
    ${body}
    <div class="note-src">滚动规则：每个交易日收盘后，对上一交易日「次日入池 pool_new」逐只回答——①是否继续拿着/观察；②是否止损或移出观察池；③是否止盈。人工处置写入 notes.pool_track[代码]={action,note}；处置完成后再生成今日新 pool_new，循环往复。</div></div>`;
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
  return `<div class="section"><div class="sec-head"><span class="sec-no">8A</span><h2>仓位风控与候选池闭环</h2><span class="tag">上一日入池逐只处置 · 完整结构化内容见「复盘观点」⑥⑦⑨</span></div><div class="sec-body rv-wrap">
    ${poolCarryHtml()}
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
function noteText(v){
  if(v==null)return "";
  if(typeof v==="string")return v;
  if(typeof v==="number")return String(v);
  if(Array.isArray(v))return v.map(x=>typeof x==="object"?JSON.stringify(x):String(x)).join("\n");
  const labels={win:"【赚钱效应】",lose:"【亏钱效应】",core:"【核心观察】",flex:"【弹性】",avoid:"【回避】"};
  return Object.entries(v).map(([k,a])=>{const t=noteText(a);return t?((labels[k]||("【"+k+"】"))+"\n"+t):null}).filter(Boolean).join("\n")
}
function getNote(field,code){const n=notes();let v=n[field];if(code)v=(v&&v[code])||"";return noteText(v)}
function getNoteRaw(field){return notes()[field]}
function logicCards(v,tone){const a=Array.isArray(v)?v:(v?String(v).split(/\n/).filter(s=>s.trim()):[]);
  if(!a.length)return '<span class="placeholder-empty">待复核：开启复核模式，一行一条</span>';
  return `<ol class="logic-list ${tone||""}">${a.map((x,i)=>`<li data-n="${i+1}">${esc(typeof x==="object"?JSON.stringify(x):x)}</li>`).join("")}</ol>`;}
function setNote(field,val,code){const n=notes();if(code){n[field]=n[field]||{};n[field][code]=val||""}else n[field]=val}
function bindManualEditable(){
  $$(".manual").forEach(box=>{
    const field=box.dataset.field,view=box.querySelector("[data-view]");
    if(!view)return;
    view.style.whiteSpace="pre-wrap";
    const v=getNote(field);
    if(view.dataset.bound)return; // 保留 renderHome 预置的占位
    if(view.dataset.logic){view.innerHTML=logicCards(getNoteRaw(field),view.dataset.logic);return;}
    if(view.dataset.insight){renderInsightView(view,field);return;}
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
  if(st)L.push(`风格四象限：上证50 ${signed(st.quadrants?.find(q=>q.index==="上证50")?.chg)}% / 沪深300 ${signed(st.quadrants?.find(q=>q.index==="沪深300")?.chg)}% / 创业板 ${signed(st.quadrants?.find(q=>q.index==="创业板指")?.chg)}% / 科创50 ${signed(st.quadrants?.find(q=>q.index=="科创50")?.chg)}%；科创50-上证50剪刀差 ${signed(st.scissor_kc_sz50)} pct。`,"");
  if(emo)L.push(`情绪周期：${emo.zone} ${f1(emo.score)}/100，环比${signed(emo.chg,1)}，近3日${emo.trend}，距窗口低点第${emo.days_from_trough}天。`,"");
  if(zp?.money_effect)L.push(`昨日涨停反馈：${zp.prev_date}涨停${zp.prev_n}只→今日均${signed(zp.money_effect.avg)}%/中位${signed(zp.money_effect.median)}%/翻红${pct(zp.money_effect.positive_rate)}/再涨停${pct(zp.money_effect.limit_up_again_rate)}；1进2 ${pct(zp.promotion["1to2"].rate)}、2进3 ${pct(zp.promotion["2to3"].rate)}、3板+ ${pct(zp.promotion["3plus"].rate)}。`,"");
  L.push("## 〇、全球宏观");
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
function bindUI(){
  // 页签切换(事件委托)
  $("#tabBar").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)switchPage(b.dataset.page)});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-fundtab]");if(b)switchFundTab(b.dataset.fundtab)});
  bindColSort();
  $("#reviewBtn").onclick=()=>{
    state.review=!state.review;document.body.classList.toggle("review",state.review);
    $("#reviewBtn").classList.toggle("on",state.review);
    $("#reviewBtn").textContent=state.review?"退出复核":"复核模式";
    if(state.review){if(!$("#saveNotesBtn")){const b=document.createElement("button");b.className="btn btn-gold";b.id="saveNotesBtn";b.textContent="保存复核稿";b.onclick=exportNotes;$("#reviewBtn").after(b)}}
    else{const b=$("#saveNotesBtn");if(b)b.remove();persistDraft()}
    bindManualEditable();toast(state.review?"复核模式：可编辑所有琥珀色区域":"已退出复核，编辑已暂存本地")
  };
  $("#exportMdBtn").onclick=()=>{const t=buildMarkdown();download(`复盘_${state.date}.md`,t,"text/markdown;charset=utf-8");$("#modalText").value=t;};
  $("#exportTxtBtn").onclick=()=>{const t=buildPlainText();copyText(t);download(`复盘公众号_${state.date}.txt`,t)};
  $("#exportHtmlBtn").onclick=exportHtmlSnapshot;
  $("#loadFileBtn").onclick=()=>$("#fileInput").click();
  $("#fileInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{try{R=JSON.parse(rd.result);state.date=R.meta.date;renderAll();toast("已载入 "+state.date)}catch(err){toast("JSON解析失败")}};rd.readText(f)};
  $("#modalClose").onclick=()=>$("#modalMask").classList.remove("show");
  $("#modalCopy").onclick=()=>copyText($("#modalText").value);
}
window.addEventListener("DOMContentLoaded",()=>{
  bindUI();
  const h=location.hash.replace("#","").replace("page-","");
  if(PAGES.some(p=>p[0]===h))state.page=h;
  window.addEventListener("hashchange",()=>{const x=location.hash.replace("#","").replace("page-","");if(PAGES.some(p=>p[0]===x))switchPage(x)});
  if(window.LATEST){R=window.LATEST;state.date=R.meta.date;initDateSelect();
    const boot=()=>{if(window.echarts)renderAll();else setTimeout(boot,120)};boot()}
  else{$("#loading").innerHTML='未找到 data/latest.js。<br>请先运行：<code>python update_daily.py</code>；或点击「导入JSON」选择 report_*.json。'}
});const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const UP="#d93026", DOWN="#0a8f4e", FLAT="#8a94a6", BLUE="#2b6fd4", BLUED="#1a3a6e", GOLD="#b0812e", AMBER="#e08a1e", PURPLE="#8a6bbf";
let toastTimer;
const CHARTS={};
const AXIS_STYLE={axisLine:{lineStyle:{color:"#c6d0e0"}},axisLabel:{color:"#7a869c",fontSize:11},
  splitLine:{lineStyle:{color:"#eef1f6"}},axisTick:{show:false}};
const TT={trigger:"axis",confine:true,backgroundColor:"#1a2f5a",borderWidth:0,textStyle:{color:"#fff",fontSize:12}};
let R=null;
const state={date:null,review:false,notesDraft:null,page:"home"};
const PAGES=[
  ["home","首页总览","00"],["global","全球宏观","0"],["market","大盘分析","1"],
  ["ladder","涨停梯队","2"],["boards","热门板块","3"],["funds","资金流向","4"],
  ["lhb","龙虎榜","龙"],["riskdown","跌停与风险","5"],["emotion","情绪温度","6"],
  ["review","复盘观点","7"],["mypool","我的股票池","8"]
];
const INS_CIRC="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
// 最后一个分述里，遇到这些总结性起句，切到“综合研判”卡
const INS_SUMCUT=/[。；;]\s*(综合|综上|对比|总体|整体看?|结论|总之|因此|确认度|二者|这意味|需要后续|操作上|三方同向|技术面（[^）]*）\s*[+＋])/;
const PAGE_RENDER={home:renderHome,global:renderGlobal,market:renderMarket,ladder:renderLadder,
  boards:renderBoards,funds:renderFunds,lhb:renderLHB,riskdown:renderRiskDown,emotion:renderEmotionPage,
  review:renderReview,mypool:renderMyPool};
let orgSortState={key:"net_abs",desc:true};
const POOL_KEY="my_stock_pool_v2";
