const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const branchColors={main:"#9258ff","release/v2.8":"#00d9ed",develop:"#168bff","feature/auth":"#00dfa2","feature/payments":"#ff9d26","feature/observability":"#a15bff"};
let commits=[
{h:"a3f9c2e",m:"Merge pull request #482 · auth",a:"r.rodriguez",t:"2m ago",b:"main"},
{h:"7e4d1ab",m:"Release v2.8.0",a:"r.rodriguez",t:"4m ago",b:"release/v2.8"},
{h:"c9b8f73",m:"Update helm chart",a:"j.lopez",t:"6m ago",b:"develop"},
{h:"5d2e1f0",m:"Add auth middleware",a:"m.torres",t:"8m ago",b:"feature/auth"},
{h:"3a6f9c1",m:"Fix pipeline config",a:"d.garcia",t:"10m ago",b:"develop"},
{h:"8e3f4b2",m:"Merge feature/payment",a:"r.rodriguez",t:"12m ago",b:"main"},
{h:"6b7d2a9",m:"Add monitoring alerts",a:"m.torres",t:"14m ago",b:"feature/observability"},
{h:"4c1e9d3",m:"Update Dockerfile",a:"j.lopez",t:"16m ago",b:"feature/payments"},
{h:"2f8a7c6",m:"Merge feature/observability",a:"r.rodriguez",t:"18m ago",b:"develop"},
{h:"1d3e5f7",m:"Refactor services",a:"d.garcia",t:"20m ago",b:"feature/auth"}];
const branches=Object.keys(branchColors);
function renderGraph(){
 const filter=$("#branchFilter").value, svg=$("#gitGraph");svg.innerHTML="";
 const rows=branches.filter(b=>filter==="all"||b===filter); const yMap={main:36,"release/v2.8":104,develop:172,"feature/auth":240,"feature/payments":308,"feature/observability":376};
 const ns="http://www.w3.org/2000/svg";
 function el(tag,attrs,parent=svg){let n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));parent.appendChild(n);return n}
 // Branch paths with merge and fork points. Decorative graph represents sample history, not a live API feed.
 const paths={
 main:"M18 36 H650",
 "release/v2.8":"M18 104 H190 Q205 104 205 88 V52 Q205 36 220 36 M205 88 V104 H315 Q330 104 330 122 V138 Q330 172 360 172 H650",
 develop:"M18 172 H650",
 "feature/auth":"M18 240 H235 Q252 240 252 257 V274 Q252 290 270 290 H450 Q470 290 470 270 V190 Q470 172 490 172",
 "feature/payments":"M18 308 H160 Q175 308 175 325 V340 Q175 357 192 357 H330 Q348 357 348 338 V325 Q348 308 366 308 H560 Q580 308 580 290 V270 Q580 240 610 240",
 "feature/observability":"M18 376 H280 Q300 376 300 360 V354 Q300 340 320 340 H420 Q440 340 440 360 V375 H520 Q540 375 540 350 L565 270 Q570 250 590 240"};
 rows.forEach(b=>el("path",{d:paths[b],fill:"none",stroke:branchColors[b],"stroke-width":3,"stroke-linecap":"round","stroke-linejoin":"round",opacity:.9}));
 // Merge connectors across branches
 [[205,36,104],[330,172,104],[470,172,240],[348,308,172],[440,376,308],[565,240,376]].forEach(([x,y1,y2])=>el("path",{d:`M${x} ${y1} V${y2}`,stroke:"#1d8ac4","stroke-width":1.6,fill:"none",opacity:.8}));
 branches.forEach(b=>{if(filter!=="all"&&filter!==b)return;let y=yMap[b];el("rect",{x:10,y:y-14,width:Math.max(75,b.length*7+24),height:27,rx:7,fill:branchColors[b],opacity:.9});let tx=el("text",{x:19,y:y+4,fill:"#031326","font-size":11,"font-weight":700});tx.textContent=b;
 for(let x=110;x<660;x+=35){if(x<Math.max(100,b.length*7+30))continue;el("circle",{cx:x,cy:y,r:4,fill:branchColors[b],stroke:"#06162b","stroke-width":1})}});
}
function renderCommits(){let q=$("#commitFilter").value.toLowerCase();$("#commits").innerHTML=commits.filter(c=>(c.m+c.h+c.b+c.a).toLowerCase().includes(q)).map(c=>`<div class="commit-row"><span class="commit-msg"><span class="hash">${c.h}</span>${c.m}</span><span class="author">${c.a}</span><span class="time">${c.t}</span></div>`).join("")||'<div class="commit-row">No matching commits</div>'}
function toast(msg){let t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2800)}
function activity(type,msg,level="INFO"){let row=document.createElement("div");row.className="activity-item";let d=new Date();row.innerHTML=`<span class="activity-dot ${level==="WARN"?"orange-bg":level==="GIT"?"cyan-bg":"green-bg"}"></span><time>${d.toLocaleTimeString("es-CL",{hour12:false})}</time><b>${type}</b><span>${msg}</span><em>${level}</em>`;$("#activity").prepend(row)}
function setEnv(env){$$(".env").forEach(b=>b.classList.toggle("active",b.dataset.env===env));$("#envPill").textContent=env;$("#envDeployText").textContent=env==="PROD"?"Production target selected":env==="STAGING"?"Staging target selected":"Development target selected";toast("Entorno seleccionado: "+env);activity("environment",`Target changed to ${env}`,"INFO")}
$$(".env").forEach(b=>b.addEventListener("click",()=>setEnv(b.dataset.env)));
$("#branchFilter").addEventListener("change",renderGraph);$("#commitFilter").addEventListener("input",renderCommits);
$("#search").addEventListener("input",e=>{let q=e.target.value;$("#commitFilter").value=q;renderCommits();if(q)toast("Buscando en el historial visible")});
$("#refresh").addEventListener("click",()=>{renderGraph();renderCommits();activity("refresh","Vista local actualizada","INFO");toast("Panel actualizado")});
$("#simulate").addEventListener("click",()=>{let h=Math.random().toString(16).slice(2,9);commits.unshift({h,m:"feat: simulated commit → pipeline",a:"you",t:"just now",b:"feature/auth"});commits=commits.slice(0,12);renderCommits();renderGraph();activity("commit",`${h} feat: simulated commit on feature/auth`,"GIT");toast("Commit simulado creado. Ejecuta el pipeline demo.");$("#runStatus").textContent="NEW COMMIT";});
$("#runPipeline").addEventListener("click",async()=>{let stages=$$(".stage");$("#runStatus").textContent="RUNNING";stages.forEach(s=>{s.classList.remove("done","warn","running");s.querySelector(".stage-node b")?.remove()});for(let i=0;i<stages.length;i++){stages[i].classList.add("running");activity("job",["source-validation","build","unit-tests","security-checks","deploy-pages"][i]+" started","INFO");await new Promise(r=>setTimeout(r,650));stages[i].classList.remove("running");stages[i].classList.add(i===3?"warn":"done");let b=document.createElement("b");b.textContent=i===3?"!":"✓";stages[i].querySelector(".stage-node").appendChild(b);stages[i].querySelector("em").textContent=i===3?"Review required":"Completed";}$("#runStatus").textContent="COMPLETED WITH WARNING";activity("workflow","Demo pipeline completed; review security advisory","WARN");toast("Flujo demo terminado. Esta simulación no ejecuta jobs en GitHub.");});
$("#clearActivity").addEventListener("click",()=>{$("#activity").innerHTML="";toast("Eventos locales limpiados")});
$$(".nav").forEach(b=>b.addEventListener("click",()=>{$$(".nav").forEach(n=>n.classList.remove("active"));b.classList.add("active");let map={overview:null,git:"#gitPanel",pipeline:"#pipelinePanel",security:"#securityPanel",deploy:"#pipelinePanel",audit:"#activityPanel"};if(map[b.dataset.view])$(map[b.dataset.view]).scrollIntoView({behavior:"smooth",block:"start"});else window.scrollTo({top:0,behavior:"smooth"})}));
renderGraph();renderCommits();