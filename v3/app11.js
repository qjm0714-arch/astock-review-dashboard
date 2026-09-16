/* 候选池滚动闭环：上一交易日 pool_new → 今日逐只处置（邱总2026-09-08铁律） */
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