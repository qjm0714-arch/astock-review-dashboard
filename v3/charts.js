function sparkLine(id,key,color,unit){
  const arr=(mh()[key]||[]).map(x=>x.v).filter(v=>v!=null);
  const cats=(mh()[key]||[]).map(x=>x.d);
  if(!arr.length)return;
  const el=document.getElementById("sv-"+key);if(el)el.innerHTML=`<span class="num" style="color:${color}">${f2(arr[arr.length-1])} ${unit||""}</span>`;
  makeChart(id,{grid:{left:6,right:6,top:8,bottom:14},xAxis:{type:"category",data:cats,show:false,boundaryGap:false},
    yAxis:{type:"value",scale:true,show:false},tooltip:TT,
    series:[{type:"line",data:arr,smooth:true,symbol:"none",lineStyle:{width:1.8,color},areaStyle:{color:color,opacity:.10}}]})}