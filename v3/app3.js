function ibBest(rows){ // 最优抄底点：h10胜率≥70且样本≥5的最浅阈值，退取样本≥5中胜率最高
  if(!rows)return null;
  let c=rows.filter(r=>r.h10&&r.h10.win!=null&&r.h10.win>=70&&r.h10.n>=5);
  if(c.length)return c.reduce((a,b)=>b.th>a.th?b:a);
  let c2=rows.filter(r=>r.h10&&r.h10.win!=null&&r.h10.n>=5);
  if(c2.length)return c2.reduce((a,b)=>b.h10.win>a.h10.win?b:a);
  return null;
}
function ibRm(bt,b){return bt?(bt.th-b)/(1+b/100):null} // 距最优抄底点还需跌多少(%)
function ibPos(pc){return pc<=20?["超跌区","danger"]:pc<=40?["偏低","warn"]:pc<=60?["中性","neutral"]:pc<=80?["偏高","warn"]:["超买区","danger"]}
function ibChartOpt(nm,d){
  const ch=d.chart||{},cur={bias60:d.bias60,bias233:d.bias233,min60:d.min60,max60:d.max60};
  const c=IB_COL[nm]||"#1663ac";
  return {animation:false,
    title:{text:nm+"　最新 MA60乖离 "+ibF(cur.bias60)+" ｜ MA233乖离 "+ibF(cur.bias233)
             +"　（5年极值 MA60 "+ibF(cur.min60)+"~"+ibF(cur.max60)+"）",
      left:8,top:4,textStyle:{fontSize:13,color:c,fontWeight:"bold"}},
    tooltip:TT,
    legend:{show:true,top:26,textStyle:{fontSize:11},data:["MA60乖离率","MA233乖离率"]},
    grid:{left:56,right:82,top:60,bottom:34},
    xAxis:{type:"category",data:ch.dates,axisLabel:{fontSize:10,interval:180},axisLine:{lineStyle:{color:"#c6d0e0"}}},
    yAxis:{type:"value",scale:true,axisLabel:{fontSize:10,color:"#7a869c",formatter:"{value}%"},splitLine:{lineStyle:{color:"#eef1f6"}}},
    series:[
      {name:"MA60乖离率",type:"line",data:ch.b60,symbol:"none",smooth:false,
       lineStyle:{width:1.8,color:"#d97706"},itemStyle:{color:"#d97706"},
       markLine:{silent:true,symbol:"none",label:{fontSize:10,color:"#8a94a6"},
         data:[{yAxis:0,lineStyle:{color:"#94a3b8"}},
               {type:"max",lineStyle:{color:"#d93026",type:"dashed"},label:{formatter:"60日最高 {c}%"}},
               {type:"min",lineStyle:{color:"#0e8a54",type:"dashed"},label:{formatter:"60日最低 {c}%"}}]}},
      {name:"MA233乖离率",type:"line",data:ch.b233,symbol:"none",smooth:false,
       lineStyle:{width:1.5,color:"#7c3aed",type:"dashed"},itemStyle:{color:"#7c3aed"},
       markLine:{silent:true,symbol:"none",label:{fontSize:10,color:"#8a94a6"},
         data:[{type:"max",lineStyle:{color:"#7c3aed",type:"dotted"},label:{formatter:"233日最高 {c}%"}},
               {type:"min",lineStyle:{color:"#2563eb",type:"dotted"},label:{formatter:"233日最低 {c}%"}}]}}
    ]};
}
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