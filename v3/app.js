/* ================= 应用主逻辑 2.0 ================= */
"use strict";
function f2(v,d="--"){return (v===null||v===undefined||v===""||Number.isNaN(v))?d:(+v).toFixed(2)}
function f1(v,d="--"){return (v===null||v===undefined||v==="")?d:(+v).toFixed(1)}
function f0(v,d="--"){return (v===null||v===undefined||v==="")?d:Math.round(+v).toLocaleString()}
function pct(v,d=1){return v===null||v===undefined?"--":(+v*100).toFixed(d)+"%"}
function signed(v,d=2){if(v===null||v===undefined||v==="")return "--";const x=+v;return (x>0?"+":"")+x.toFixed(d)}
function cls(v){return v>0?"up":v<0?"down":"flat"}
function arrow(v){return v>0?"▲":v<0?"▼":"—"}
function yiWan(v,d=2){return v===null||v===undefined?"--":(+v).toFixed(d)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}
function download(name,text,mime="text/plain;charset=utf-8"){
  const b=new Blob([text],{type:mime}),u=URL.createObjectURL(b),a=document.createElement("a");
  a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}
function copyText(t){navigator.clipboard.writeText(t).then(()=>toast("已复制到剪贴板")).catch(()=>{
  const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("已复制")})}
function badge(text,kind){return `<span class="badge b-${kind}">${esc(text)}</span>`}
function crowdZone(v){if(v==null)return["--","neutral"];if(v>=50)return["极端拥挤","danger"];if(v>=45)return["极度危险","danger"];if(v>=40)return["危险抱团","warn"];if(v>=35)return["偏高","warn"];return["健康","ok"]}
function fgZone(v){if(v==null)return["--","neutral"];if(v<25)return["极度恐惧","danger"];if(v<45)return["恐惧","warn"];if(v<=55)return["中性","neutral"];if(v<=75)return["贪婪","warn"];return["极度贪婪","danger"]}
function emoZone(z){return ({高位:"danger",偏暖:"warn",中性震荡:"neutral",偏冷:"warn",冰点:"danger"})[z]||"neutral"}
function techBadge(g){return ({极强:["极强","danger"],强:["强","info"],中性:["中性","neutral"],弱:["弱","warn"],极弱:["极弱","danger"]})[g]||[g,"neutral"]}
function contTag(t){return ({连续净流入:["连续净流入","ok"],连续净流出:["连续净流出","danger"],流出转流入:["流出转流入","info"],流入转流出:["流入转流出","warn"]})[t]||[t,"neutral"]}
function makeChart(id,option){
  const el=document.getElementById(id);if(!el||!window.echarts)return null;
  let c=CHARTS[id];
  if(!c){c=echarts.init(el);CHARTS[id]=c;
    if(window.ResizeObserver)new ResizeObserver(()=>c.resize()).observe(el)}
  c.setOption(option,true);return c}
function barBySign(v){return v>=0?UP:DOWN}
function loadDateScript(date){
  return new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src=`data/report_${date}.js?t=${Date.now()}`;
    s.onload=()=>{resolve(window.REPORT);s.remove()};
    s.onerror=()=>{s.remove();reject(new Error("missing "+date))};
    document.body.appendChild(s)})}
function secBox(id,no,title,tag,inner){
  return `<section class="section" id="sec-${id}"><div class="sec-head">
  <span class="sec-no">${no}</span><h2>${title}</h2>${tag?`<span class="tag">${tag}</span>`:""}
  </div><div class="sec-body">${inner||""}</div></section>`}
function manualBlock(field,label,hint){
  return `<div class="manual" data-field="${field}"><span class="mlab">人工 · ${label}</span>
  <div class="view-text" data-view="${field}"></div>
  <div class="edit-hint">${hint||"直接编辑，退出复核模式后可导出复核稿保存。"}</div></div>`}
function insParse(raw){
  let t=String(raw==null?"":raw).replace(/\r/g,"").trim();
  let marks=[];
  for(let i=0;i<t.length;i++){const n=INS_CIRC.indexOf(t[i]);if(n>=0)marks.push({i,n:n+1});}
  let lead="",steps=[],sum="";
  if(marks.length){
    lead=t.slice(0,marks[0].i).replace(/[：:；;\s]+$/,"").trim();
    for(let k=0;k<marks.length;k++){
      const st=marks[k].i+1,en=k+1<marks.length?marks[k+1].i:t.length;
      steps.push({n:marks[k].n,text:t.slice(st,en).replace(/^[\s：:、.）)]+/,"").trim()});
    }
    const last=steps[steps.length-1];
    const m=last.text.match(INS_SUMCUT);
    if(m){const cut=m.index+1;const head=last.text.slice(0,cut).trim();sum=last.text.slice(cut).trim();if(head){last.text=head}else{steps.pop()}}
  }else{lead=t;}
  return {lead,steps,sum};
}
function insightProseHtml(field){
  const raw=getNote(field);
  if(raw==null||String(raw).trim()==="")return "";
  const {lead,steps,sum}=insParse(raw);const p=[];
  if(lead)p.push(`<div class="insight-lead">${esc(lead)}</div>`);
  if(steps.length)p.push(`<ol class="insight-steps">${steps.map(s=>`<li><span class="isn">${s.n}</span>${esc(s.text)}</li>`).join("")}</ol>`);
  if(sum)p.push(`<div class="insight-sum"><span class="islab">综合研判</span>${esc(sum)}</div>`);
  if(!p.length)p.push(`<div class="insight-prose">${esc(raw)}</div>`);
  return `<div class="insight">${p.join("")}</div>`;
}
function levelsHtml(field){
  const o=getNoteRaw(field);
  if(!o||typeof o!=="object")return "";
  const sup=o.support||o["支撑"]||o.sup||[],res=o.resistance||o["压力"]||o.res||[];
  const li=a=>(a||[]).map(x=>`<li>${esc(String(x).replace(/^[-·•\s]+/,""))}</li>`).join("");
  if(!(sup.length||res.length))return "";
  return `<div class="levels-grid">
    <div class="level-col lv-sup"><h4>▲ 关键支撑位</h4><ul>${li(sup)}</ul></div>
    <div class="level-col lv-res"><h4>▼ 关键压力位</h4><ul>${li(res)}</ul></div></div>`;
}
function _noteArr(field){
  const v=getNoteRaw(field);
  const a=Array.isArray(v)?v:(v?String(v).split(/\n/):[]);
  return a.map(x=>String(x).trim()).filter(Boolean);
}
function riskListHtml(field){
  const a=_noteArr(field);if(!a.length)return "";
  return `<div class="insight">${a.map((x,i)=>{
    let s=x,hot=/最高优先|拥挤度|45%|45 %|极度危险/.test(s),tag="";
    const tm=s.match(/^【([^】]+)】\s*/);if(tm){tag=tm[1];s=s.slice(tm[0].length)}
    return `<div class="risk-item ${hot?"hot":""}">${tag?`<span class="ritag">${esc(tag)}</span>`:`<span class="rin">${i+1}</span>`}${esc(s)}</div>`;
  }).join("")}</div>`;
}
function unvListHtml(field){
  const a=_noteArr(field);if(!a.length)return "";
  return `<div class="insight">${a.map((x,i)=>`<div class="unv-item"><span class="uin">${i+1}</span>${esc(x)}</div>`).join("")}</div>`;
}
function insightBlock(field,label,kind){
  return `<div class="manual insight-manual" data-field="${field}"><span class="mlab">人工 · ${label}</span>
  <div class="view-text" data-view="${field}" data-insight="${kind||"prose"}"></div></div>`;
}
function renderInsightView(view,field){
  const kind=view.dataset.insight||"prose";let h="";
  if(kind==="levels")h=levelsHtml(field);
  else if(kind==="risks")h=riskListHtml(field);
  else if(kind==="unverified")h=unvListHtml(field);
  else h=insightProseHtml(field);
  view.innerHTML=h||'<span class="placeholder-empty">待复核：开启右上角「复核模式」后在此填写</span>';
}
function renderAll(){
  $("#loading").style.display="none";$("#content").style.display="block";
  $("#tabBar").innerHTML=PAGES.map(([id,t,no])=>
    `<button class="tab-btn2 ${state.page===id?"on":""}" data-page="${id}"><span class="tn">${no}</span>${t}</button>`).join("");
  $("#content").innerHTML=PAGES.map(([id])=>
    `<div class="page ${state.page===id?"active":""}" id="page-${id}"><div class="main">${(PAGE_RENDER[id]||(()=>""))()}</div></div>`).join("");
  drawAllCharts();
  bindManualEditable();
  applyNotesDraft();
  bindPool();
  bindOrgSort();
  refreshLeaderNum();
  fillSourceState();
}
function switchPage(id){
  state.page=id;
  $$(".tab-btn2").forEach(b=>b.classList.toggle("on",b.dataset.page===id));
  $$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+id));
  if(history.replaceState)history.replaceState(null,"","#"+id);
  // 切页时 resize 该页图表(隐藏容器尺寸为0的修正)
  setTimeout(()=>{$$(`#page-${id} .chart`).forEach(el=>{const c=CHARTS[el.id];if(c)c.resize()})},30);
}