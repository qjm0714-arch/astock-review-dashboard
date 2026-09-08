/* ============================================================
   图表绘制
   ============================================================ */
const mh=()=>R.macro_hist||{};
function sparkLine(id,key,color,unit){
  const arr=(mh()[key]||[]).map(x=>x.v).filter(v=>v!=null);
  const cats=(mh()[key]||[]).map(x=>x.d);
  if(!arr.length)return;
  const el=document.getElementById("sv-"+key);if(el)el.innerHTML=`<span class="num" style="color:${color}">${f2(arr[arr.length-1])} ${unit||""}</span>`;
  makeChart(id,{grid:{left:6,right:6,top:8,bottom:14},xAxis:{type:"category",data:cats,show:false,boundaryGap:false},
    yAxis:{type:"value",scale:true,show:false},tooltip:TT,
    series:[{type:"line",data:arr,smooth:true,symbol:"none",lineStyle:{width:1.8,color},areaStyle:{color:color,opacity:.10}}]})}
function drawAllCharts(){
  if(!window.echarts){toast("ECharts未加载");return}
  Object.values(CHARTS).forEach(c=>c.dispose());for(const k in CHARTS)delete CHARTS[k];
  // 宏观 spark
  sparkLine("spark-vix","vix",BLUE);sparkLine("spark-us10y","us10y",GOLD);sparkLine("spark-us30y","us30y",PURPLE);
  sparkLine("spark-gold","gold",UP);sparkLine("spark-lme_cu","lme_cu","#c47b2a");sparkLine("spark-dxy","dxy",BLUED);
  sparkLine("spark-dram","dram",DOWN);
  sparkLine("spark-wti","wti","#b06a1f");
  // 美债曲线
  const bd=R.global?.us_bonds||{};const bk=["US2Y","US5Y","US10Y","US30Y"];
  makeChart("chart-yieldcurve",{grid:{left:44,right:14,top:16,bottom:26},
    xAxis:{type:"category",data:bk,...AXIS_STYLE},yAxis:{type:"value",scale:true,...AXIS_STYLE},tooltip:TT,
    series:[{type:"line",data:bk.map(k=>bd[k]?.yield),symbolSize:8,lineStyle:{width:2.4,color:BLUE},itemStyle:{color:BLUE},
      label:{show:true,formatter:p=>f2(p.value)+"%",color:"#46566f",fontSize:11},areaStyle:{color:BLUE,opacity:.08}}]});
  // 风格四象限
  const sq=(R.style?.quadrants||[]);
  makeChart("chart-style",{grid:{left:70,right:52,top:8,bottom:18},
    xAxis:{type:"value",...AXIS_STYLE},yAxis:{type:"category",data:sq.map(x=>x.quad),...AXIS_STYLE},tooltip:TT,
    series:[
      {type:"bar",barWidth:15,data:sq.map(x=>x.chg>=0?{value:x.chg,itemStyle:{color:UP}}:null),label:{show:true,position:"right",formatter:p=>signed(p.value)+"%",fontSize:11,color:"#46566f"}},
      {type:"bar",barWidth:15,data:sq.map(x=>x.chg<0?{value:x.chg,itemStyle:{color:DOWN}}:null),label:{show:true,position:"left",formatter:p=>signed(p.value)+"%",fontSize:11,color:"#46566f"}}
    ]});
  // 指数涨跌
  const ix=(R.indices||[]).filter(x=>!["深证综指"].includes(x.name));
  const ixv=ix.map(x=>x.chg_pct).reverse();
  makeChart("chart-idxbar",{grid:{left:80,right:52,top:10,bottom:20},
    xAxis:{type:"value",...AXIS_STYLE},yAxis:{type:"category",data:ix.map(x=>x.name).reverse(),...AXIS_STYLE},
    tooltip:TT,series:[
      {type:"bar",barWidth:16,data:ixv.map(v=>v>=0?{value:v,itemStyle:{color:UP}}:null),label:{show:true,position:"right",formatter:p=>signed(p.value)+"%",color:"#46566f",fontSize:11}},
      {type:"bar",barWidth:16,data:ixv.map(v=>v<0?{value:v,itemStyle:{color:DOWN}}:null),label:{show:true,position:"left",formatter:p=>signed(p.value)+"%",color:"#46566f",fontSize:11}}
    ]});
  // 涨跌家数
  const uh=(R.hist?.updown)||[];
  makeChart("chart-breadth",{grid:{left:48,right:48,top:34,bottom:40},legend:{data:["上涨","下跌","涨停","跌停"],bottom:0,type:"scroll",textStyle:{fontSize:11}},
    tooltip:TT,xAxis:{type:"category",data:uh.map(x=>x.date.slice(5)),...AXIS_STYLE,axisLabel:{color:"#7a869c",fontSize:10,rotate:35}},
    yAxis:[{type:"value",name:"家数",...AXIS_STYLE},{type:"value",name:"涨跌停",...AXIS_STYLE,splitLine:{show:false}}],
    series:[{name:"上涨",type:"bar",stack:"ud",data:uh.map(x=>x.up),itemStyle:{color:"#f3b4af"}},
      {name:"下跌",type:"bar",stack:"ud",data:uh.map(x=>-x.down),itemStyle:{color:"#aedcc4"}},
      {name:"涨停",type:"line",yAxisIndex:1,data:uh.map(x=>x.lu),smooth:true,symbol:"circle",symbolSize:5,lineStyle:{color:UP,width:2},itemStyle:{color:UP}},
      {name:"跌停",type:"line",yAxisIndex:1,data:uh.map(x=>x.ld),smooth:true,symbol:"circle",symbolSize:5,lineStyle:{color:DOWN,width:2},itemStyle:{color:DOWN}}]});
  // HS300+恐贪
  const fh=(mh().feargreed)||[];
  makeChart("chart-hs300fg",{grid:{left:50,right:50,top:30,bottom:40},tooltip:TT,legend:{data:["恐贪","沪深300"],bottom:0,textStyle:{fontSize:11}},
    xAxis:{type:"category",data:fh.map(x=>x.d),...AXIS_STYLE,axisLabel:{fontSize:10,rotate:35}},
    yAxis:[{type:"value",name:"恐贪",min:0,max:100,...AXIS_STYLE},{type:"value",name:"HS300",scale:true,...AXIS_STYLE,splitLine:{show:false}}],
    series:[{name:"恐贪",type:"bar",data:fh.map(x=>({value:x.fear,itemStyle:{color:x.fear<25?UP:x.fear<45?"#e8a23d":x.fear<=55?"#9aa7bd":DOWN}}))},
      {name:"沪深300",type:"line",yAxisIndex:1,data:fh.map(x=>x.hs),smooth:true,symbol:"none",lineStyle:{color:BLUE,width:2.2}}]});
  // 行业条形
  const it=[...(R.industries?.bottom5||[]).reverse(),...(R.industries?.top5||[])];
  const itv=it.map(x=>x.avg_chg);
  makeChart("chart-indbar",{grid:{left:110,right:58,top:10,bottom:20},
    xAxis:{type:"value",...AXIS_STYLE},yAxis:{type:"category",data:it.map(x=>x.name),...AXIS_STYLE,axisLabel:{fontSize:11}},
    tooltip:TT,series:[
      {type:"bar",barWidth:14,data:itv.map(v=>v>=0?{value:v,itemStyle:{color:UP}}:null),label:{show:true,position:"right",formatter:p=>signed(p.value)+"%",fontSize:10.5,color:"#46566f"}},
      {type:"bar",barWidth:14,data:itv.map(v=>v<0?{value:v,itemStyle:{color:DOWN}}:null),label:{show:true,position:"left",formatter:p=>signed(p.value)+"%",fontSize:10.5,color:"#46566f"}}
    ]});
  // 拥挤度/TMT
  const ch=(R.hist?.crowding)||[],tt=(R.hist?.tmt)||[];
  const dates=Array.from(new Set([...ch.map(x=>x.date),...tt.map(x=>x.date)])).sort();
  const cm=Object.fromEntries(ch.map(x=>[x.date,x.ratio])),tm=Object.fromEntries(tt.map(x=>[x.date,x.ratio]));
  makeChart("chart-crowd",{grid:{left:46,right:20,top:24,bottom:44},legend:{data:["全市场拥挤度","TMT占比"],bottom:4,textStyle:{fontSize:12}},
    tooltip:TT,xAxis:{type:"category",data:dates.map(d=>d.slice(5)),...AXIS_STYLE,axisLabel:{fontSize:10,rotate:35}},
    yAxis:{type:"value",min:v=>Math.max(20,Math.floor(v.min-3)),max:v=>Math.ceil(v.max+3),...AXIS_STYLE},
    series:[
      {name:"全市场拥挤度",type:"line",smooth:true,symbol:"circle",symbolSize:5,data:dates.map(d=>cm[d]??null),
        lineStyle:{width:2.6,color:UP},itemStyle:{color:UP},
        markArea:{silent:true,data:[[{yAxis:40,itemStyle:{color:"#fdf0e6"}},{yAxis:45}],[{yAxis:45,itemStyle:{color:"#fbe6e2"}},{yAxis:50}],[{yAxis:50,itemStyle:{color:"#f6d4cf"}},{yAxis:60}]]}},
      {name:"TMT占比",type:"line",smooth:true,symbol:"circle",symbolSize:5,data:dates.map(d=>tm[d]??null),
        lineStyle:{width:2.6,color:BLUE,type:"dashed"},itemStyle:{color:BLUE}}]});
  // 主力资金序列
  const fhist=R.fund_hist||[];
  makeChart("chart-fundhist",{grid:{left:54,right:18,top:18,bottom:30},tooltip:TT,
    xAxis:{type:"category",data:fhist.map(x=>x.date.slice(5)),...AXIS_STYLE,axisLabel:{fontSize:10,rotate:35}},
    yAxis:{type:"value",name:"亿元",...AXIS_STYLE},
    series:[{type:"bar",barWidth:14,data:fhist.map(x=>({value:x.main_yi,itemStyle:{color:barBySign(x.main_yi)}})),
      label:{show:fhist.length<=15,position:"top",formatter:p=>signed(p.value,0),fontSize:10}}]});
  // 龙虎榜
  const lhb=R.lhb||{};const bs=[...(lhb.sell_top5||[]).reverse(),...(lhb.buy_top5||[])];
  const bsv=bs.map(x=>x.net_yi);
  makeChart("chart-lhb",{grid:{left:90,right:64,top:10,bottom:20},
    xAxis:{type:"value",name:"净买额(亿)",...AXIS_STYLE},yAxis:{type:"category",data:bs.map(x=>x.name),...AXIS_STYLE},
    tooltip:TT,series:[
      {type:"bar",barWidth:15,data:bsv.map(v=>v>=0?{value:v,itemStyle:{color:UP}}:null),label:{show:true,position:"right",formatter:p=>signed(p.value,2),fontSize:10.5,color:"#46566f"}},
      {type:"bar",barWidth:15,data:bsv.map(v=>v<0?{value:v,itemStyle:{color:DOWN}}:null),label:{show:true,position:"left",formatter:p=>signed(p.value,2),fontSize:10.5,color:"#46566f"}}
    ]});
  // 恐贪20日
  makeChart("chart-fg",{grid:{left:40,right:16,top:16,bottom:24},
    xAxis:{type:"category",data:fh.map(x=>x.d),show:false,boundaryGap:false},yAxis:{type:"value",min:0,max:100,...AXIS_STYLE},tooltip:TT,
    series:[{type:"line",data:fh.map(x=>x.fear),smooth:true,symbol:"circle",symbolSize:4,lineStyle:{width:2,color:GOLD},
      areaStyle:{color:GOLD,opacity:.12},markLine:{silent:true,data:[{yAxis:25},{yAxis:45}],lineStyle:{color:"#d8c28f",type:"dashed"},label:{fontSize:10}}}]});
  // 情绪周期曲线
  const es=(R.emotion?.series)||[];
  makeChart("chart-emotion",{grid:{left:42,right:18,top:28,bottom:36},tooltip:TT,
    legend:{data:["情绪分","涨停数","最高板"],bottom:0,textStyle:{fontSize:11}},
    xAxis:{type:"category",data:es.map(x=>x.date.slice(5)),...AXIS_STYLE,axisLabel:{fontSize:10,rotate:35}},
    yAxis:[{type:"value",name:"情绪分",min:0,max:100,...AXIS_STYLE},{type:"value",name:"家数/板",...AXIS_STYLE,splitLine:{show:false}}],
    series:[
      {name:"情绪分",type:"line",smooth:true,symbol:"circle",symbolSize:6,data:es.map(x=>x.score),lineStyle:{width:3,color:BLUED},itemStyle:{color:BLUED},
        label:{show:true,formatter:p=>f1(p.value,0),fontSize:10,color:BLUED},
        markArea:{silent:true,data:[[{yAxis:70,itemStyle:{color:"#fdeceb"}},{yAxis:100}],[{yAxis:30,itemStyle:{color:"#eef4fc"}},{yAxis:0}]]}},
      {name:"涨停数",type:"bar",yAxisIndex:1,data:es.map(x=>x.limit_up),itemStyle:{color:"#f0b6b0",opacity:.7},barWidth:10},
      {name:"最高板",type:"line",yAxisIndex:1,data:es.map(x=>x.highest),smooth:true,symbol:"diamond",symbolSize:7,lineStyle:{color:GOLD,width:1.8},itemStyle:{color:GOLD}}]});
  // 温度计雷达
  const th=thermometerScores();const ls=leaderScoreNum();
  makeChart("chart-thermo",{radar:{indicator:[{name:"涨停数量",max:20},{name:"连板高度",max:20},{name:"封板率",max:20},{name:"上涨占比",max:20},{name:"龙头健康",max:20}],
    radius:"66%",axisName:{color:"#46566f",fontSize:11},splitLine:{lineStyle:{color:"#e0e7f1"}},splitArea:{areaStyle:{color:["#fbfcfe","#f4f7fb"]}}},
    tooltip:{},series:[{type:"radar",data:[{value:[...th.vals,ls],name:"情绪温度",areaStyle:{color:BLUE,opacity:.18},lineStyle:{color:BLUE,width:2},itemStyle:{color:BLUE}}]}]});
  // 60分K ×3
  (R.tech60||[]).forEach(t=>{
    const cats=t.kl.map(x=>x.day.slice(5,16));
    const kdata=t.kl.map(x=>[x.open,x.close,x.low,x.high]);
    makeChart("kline-"+t.name,{animation:false,
      grid:[{left:50,right:16,top:20,height:"58%"},{left:50,right:16,top:"74%",height:"18%"}],
      xAxis:[{type:"category",data:cats,scale:true,...AXIS_STYLE,axisLabel:{show:false},splitLine:{show:false}},
        {type:"category",gridIndex:1,data:cats,...AXIS_STYLE,axisLabel:{fontSize:9,interval:11}}],
      yAxis:[{scale:true,...AXIS_STYLE},{gridIndex:1,scale:true,...AXIS_STYLE,splitNumber:2}],
      tooltip:{trigger:"axis",confine:true,axisPointer:{type:"cross"}},
      dataZoom:[{type:"inside",xAxisIndex:[0,1],start:50,end:100}],
      series:[
        {type:"candlestick",data:kdata,itemStyle:{color:UP,color0:DOWN,borderColor:UP,borderColor0:DOWN}},
        {type:"line",data:t.ma55_series,symbol:"none",lineStyle:{width:1.6,color:GOLD}},
        {type:"bar",xAxisIndex:1,yAxisIndex:1,data:t.macd_bars.map(v=>({value:v,itemStyle:{color:v>=0?UP:DOWN}}))}
      ]})
  });
  switchFundTab("in")
}
function switchFundTab(tab){
  const list=tab==="in"?(R.funds?.in_top10||[]):(R.funds?.out_top10||[]);
  const tb=$("#fundTbody");if(!tb)return;
  tb.innerHTML=list.map(fundRow).join("");
  $$("[data-fundtab]").forEach(b=>b.classList.toggle("on",b.dataset.fundtab===tab))
}