(() => {
  const OWNER='rodrodbeat-stack', REPO='888DIGITALFACTORY-Nexus-CI-CD';
  const API=`https://api.github.com/repos/${OWNER}/${REPO}`;
  const $=id=>document.getElementById(id);
  let branches=[], commits=[], selectedBranch='all', runToken=0;
  const colors=name=>name==='main'?'#3de4ff':name==='develop'?'#a77aff':name.startsWith('feature/')?'#56f2a5':name.startsWith('release/')?'#ffcc66':name.startsWith('hotfix/')?'#ff6688':'#6ea8ff';
  const short=s=>s?s.slice(0,7):'-------';
  function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
  function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  async function getJson(url){const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw new Error(r.status===403?'Límite temporal de API de GitHub. Espera un minuto y vuelve a sincronizar.':`GitHub API respondió ${r.status}`);return r.json()}
  async function load(){
    $('connectionLabel').textContent='SYNC EN PROGRESO';$('dataMode').textContent='FETCHING LIVE DATA';$('refreshBtn').disabled=true;
    try{
      const b=await getJson(`${API}/branches?per_page=100`);branches=b;
      const results=await Promise.all(b.slice(0,20).map(async br=>{try{return await getJson(`${API}/commits?sha=${encodeURIComponent(br.name)}&per_page=8`)}catch(e){return []}}));
      const seen=new Set();commits=[];results.forEach((list,i)=>list.forEach(c=>{if(!c||!c.sha)return;const branch=branches[i]?.name||'unknown';const key=`${c.sha}:${branch}`;if(seen.has(key))return;seen.add(key);commits.push({sha:c.sha,message:(c.commit?.message||'').split('\n')[0],author:c.commit?.author?.name||c.author?.login||'unknown',date:c.commit?.author?.date||'',url:c.html_url,branch});}));
      commits.sort((a,b)=>new Date(b.date)-new Date(a.date));
      $('branchCount').textContent=branches.length;$('commitCount').textContent=commits.length;$('connectionLabel').textContent='GITHUB CONNECTED';$('dataMode').textContent='LIVE GITHUB API';$('pipelineStatus').textContent='READY';$('pipelineSub').textContent='Esperando ejecución manual';$('lastUpdated').textContent='LAST SYNC: '+new Date().toLocaleTimeString();
      renderBranches();renderGraph();renderCommits();loadActions();
    }catch(e){$('connectionLabel').textContent='API UNAVAILABLE';$('dataMode').textContent='CONNECTION ERROR';$('graphWrap').innerHTML=`<div class="loading"><p>⚠ ${escapeHtml(e.message)}</p><button class="small-btn" onclick="document.getElementById('refreshBtn').click()">RETRY SYNC</button><p>Comprueba que el repositorio sea público y que la URL esté bien escrita.</p></div>`;toast(e.message)}finally{$('refreshBtn').disabled=false}
  }
  function stateLabel(run){
    if(run.status==='in_progress'||run.status==='queued'||run.status==='waiting'||run.status==='requested')return {label:run.status.toUpperCase().replace('_',' '),cls:'running'};
    if(run.conclusion==='success')return {label:'SUCCESS',cls:'success'};
    if(run.conclusion==='failure')return {label:'FAILURE',cls:'failure'};
    if(run.conclusion==='cancelled')return {label:'CANCELLED',cls:'neutral'};
    if(run.conclusion==='skipped')return {label:'SKIPPED',cls:'neutral'};
    return {label:(run.conclusion||run.status||'UNKNOWN').toUpperCase(),cls:'neutral'};
  }
  async function loadActions(){
    const state=$('actionsState'),when=$('actionsWhen'),box=$('actionsRun');
    if(!state||!box)return;
    state.textContent='SYNC EN PROGRESO';state.className='actions-state running';
    try{
      const data=await getJson(`${API}/actions/runs?per_page=8`);
      const runs=data.workflow_runs||[];
      if(!runs.length){state.textContent='SIN EJECUCIONES';state.className='actions-state neutral';when.textContent='No hay runs devueltos por GitHub';box.innerHTML='<div class="actions-empty"><b>No hay ejecuciones registradas.</b><p>Agrega un workflow en .github/workflows/ y haz push para que GitHub Actions genere la primera ejecución.</p><a href="https://github.com/'+OWNER+'/'+REPO+'/actions" target="_blank" rel="noreferrer">ABRIR GITHUB ACTIONS ↗</a></div>';return;}
      const run=runs[0],st=stateLabel(run);state.textContent=st.label;state.className='actions-state '+st.cls;
      when.textContent=`Última ejecución · ${new Date(run.updated_at||run.created_at).toLocaleString()}`;
      box.innerHTML=`<div class="run-header"><div><b>${escapeHtml(run.name||run.display_title||'Workflow')}</b><small>${escapeHtml(run.head_branch||'branch desconocida')} · #${run.run_number} · ${short(run.head_sha)}</small></div><span class="run-badge ${st.cls}">${st.label}</span></div><div class="run-detail"><span>EVENTO <b>${escapeHtml(run.event||'—')}</b></span><span>ACTOR <b>${escapeHtml(run.actor?.login||'—')}</b></span><span>WORKFLOW <b>${escapeHtml(run.path||'—')}</b></span></div><a class="run-link" href="${escapeHtml(run.html_url)}" target="_blank" rel="noreferrer">VER EJECUCIÓN COMPLETA EN GITHUB ↗</a><div class="job-live-list" id="liveJobs"><div class="live-job"><span class="tiny-dot"></span>Consultando jobs de esta ejecución…</div></div>`;
      try{
        const jobsData=await getJson(`${API}/actions/runs/${run.id}/jobs?per_page=30`),jobList=jobsData.jobs||[];
        const live=$('liveJobs');
        if(!jobList.length){live.innerHTML='<div class="live-job muted">GitHub no devolvió jobs para esta ejecución.</div>';return;}
        live.innerHTML=jobList.map(j=>{const js=stateLabel({status:j.status,conclusion:j.conclusion});return `<div class="live-job"><span class="job-led ${js.cls}"></span><span class="live-job-name">${escapeHtml(j.name)}</span><span class="live-job-status ${js.cls}">${js.label}</span><small>${j.started_at?new Date(j.started_at).toLocaleTimeString():'—'}</small></div>`}).join('');
      }catch(jobErr){const live=$('liveJobs');if(live)live.innerHTML='<div class="live-job muted">Estado general disponible; no se pudieron cargar los jobs. Reintenta SYNC ACTIONS.</div>';}
    }catch(e){state.textContent='NO DISPONIBLE';state.className='actions-state failure';when.textContent='No se pudo consultar GitHub Actions';box.innerHTML=`<div class="actions-empty"><b>${escapeHtml(e.message)}</b><p>Revisa que Actions esté habilitado y que el repositorio sea público. La API pública tiene límites de consultas.</p><a href="https://github.com/${OWNER}/${REPO}/actions" target="_blank" rel="noreferrer">ABRIR GITHUB ACTIONS ↗</a></div>`;}
  }
  function renderBranches(){
    $('branchSummary').textContent=`${branches.length} RAMAS`;const list=$('branchList');list.innerHTML='';
    const all=document.createElement('button');all.className='branch-chip '+(selectedBranch==='all'?'selected':'');all.innerHTML='<span class="tiny-dot"></span>ALL BRANCHES';all.onclick=()=>{selectedBranch='all';renderBranches();renderGraph();renderCommits()};list.appendChild(all);
    branches.forEach(b=>{const el=document.createElement('button');el.className='branch-chip '+(selectedBranch===b.name?'selected':'');el.innerHTML=`<span class="tiny-dot" style="background:${colors(b.name)}"></span>${escapeHtml(b.name)}`;el.title='Ver commits de '+b.name;el.onclick=()=>{selectedBranch=b.name;renderBranches();renderGraph();renderCommits()};list.appendChild(el)});
  }
  function renderGraph(){
    const svg=$('branchGraph'),wrap=$('graphWrap');wrap.querySelector('.loading')?.remove();const W=Math.max(520,wrap.clientWidth||700),H=370;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
    const NS='http://www.w3.org/2000/svg';const add=(tag,attrs,parent=svg,textVal)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(textVal!==undefined)e.textContent=textVal;parent.appendChild(e);return e};
    const shown=selectedBranch==='all'?branches:branches.filter(b=>b.name===selectedBranch);if(!shown.length){add('text',{x:24,y:40,class:'graph-label'},svg,'No se encontraron ramas para mostrar.');return}
    const left=selectedBranch==='all'?155:115,right=30,plotW=W-left-right;const lanes=shown.slice(0,12);const laneGap=Math.max(22,Math.min(39,(H-70)/Math.max(lanes.length,1)));const y0=34;
    lanes.forEach((b,i)=>{const y=y0+i*laneGap;const color=colors(b.name);add('line',{x1:left,y1:y,x2:W-right,y2:y,stroke:'#1b2b43','stroke-width':1});add('text',{x:10,y:y+4,class:'graph-label',fill:color,style:`fill:${color}`},svg,b.name.length>19?b.name.slice(0,18)+'…':b.name);const branchCommits=commits.filter(c=>c.branch===b.name).slice(0,6);const count=Math.max(branchCommits.length,1);const xs=branchCommits.map((c,j)=>left+20+j*(Math.max(0,plotW-60)/Math.max(1,count-1)));if(xs.length>1)add('path',{d:xs.map((x,j)=>(j?'L':'M')+x+' '+y).join(' '),class:'graph-line pulse',stroke:color});if(!branchCommits.length){add('circle',{cx:left+20,cy:y,r:4,fill:color,opacity:.6});add('text',{x:left+32,y:y+3,class:'graph-sha'},svg,'No recent commits returned');}branchCommits.forEach((c,j)=>{const x=xs[j];const g=add('g',{class:'commit-node',tabindex:'0',role:'button','aria-label':c.message});add('circle',{cx:x,cy:y,r:4.5,fill:color,stroke:'#08101c','stroke-width':2},g);add('title',{},g,`${b.name}\n${short(c.sha)} · ${c.message}`);if(j===branchCommits.length-1||j===0)add('text',{x:x,y:y-9,class:'graph-sha','text-anchor':'middle'},g,short(c.sha));g.addEventListener('click',()=>{if(c.url)window.open(c.url,'_blank','noopener')});});});
    if(branches.length>12)add('text',{x:W-15,y:H-8,class:'graph-sha','text-anchor':'end'},svg,`+ ${branches.length-12} ramas más en inventario`);
    add('text',{x:left,y:H-10,class:'graph-sha'},svg,'OLDER  ←  COMMIT HISTORY  →  RECENT');
  }
  function renderCommits(){const rows=commits.filter(c=>selectedBranch==='all'||c.branch===selectedBranch).slice(0,14);$('activityCount').textContent=`${rows.length} EVENTS`;const body=$('commitTable');if(!rows.length){body.innerHTML='<tr><td colspan="5" class="empty">No hay commits recientes devueltos para este filtro.</td></tr>';return}body.innerHTML=rows.map(c=>`<tr><td><a style="color:var(--cyan);text-decoration:none" href="${escapeHtml(c.url)}" target="_blank" rel="noreferrer">${short(c.sha)}</a></td><td title="${escapeHtml(c.message)}">${escapeHtml(c.message||'(sin mensaje)')}</td><td><span class="branch-tag">${escapeHtml(c.branch)}</span></td><td>${escapeHtml(c.author)}</td><td>${c.date?new Date(c.date).toLocaleString():'—'}</td></tr>`).join('')}
  $('refreshBtn').addEventListener('click',load);$('refreshActionsBtn')?.addEventListener('click',loadActions);$('allBranchesBtn').addEventListener('click',()=>{selectedBranch='all';renderBranches();renderGraph();renderCommits()});
  const jobs=[...document.querySelectorAll('.job')];jobs.forEach((j,i)=>j.addEventListener('click',()=>{jobs.forEach(x=>x.classList.remove('active'));j.classList.add('active');toast(`Job ${i+1}: ${j.querySelector('b').textContent}. Usa RUN DEMO PIPELINE para animar el flujo completo.`)}));
  $('runPipeline').addEventListener('click',async()=>{const token=++runToken;const btn=$('runPipeline');btn.disabled=true;$('pipelineStatus').textContent='RUNNING';$('pipelineSub').textContent='Simulación de entrega en curso';jobs.forEach(j=>{j.classList.remove('active','done','failed');j.querySelector('.job-state').textContent='WAIT'});document.querySelectorAll('.env-card').forEach(e=>e.classList.remove('active','done'));const envs=[...document.querySelectorAll('.env-card')];for(let i=0;i<jobs.length;i++){if(token!==runToken)return;jobs[i].classList.add('active');jobs[i].querySelector('.job-state').textContent='RUNNING';await new Promise(r=>setTimeout(r,650));if(token!==runToken)return;jobs[i].classList.remove('active');jobs[i].classList.add('done');jobs[i].querySelector('.job-state').textContent='PASS';if(i===0)envs[0].classList.add('active');if(i===1){envs[0].classList.remove('active');envs[0].classList.add('done');envs[1].classList.add('active')}if(i===2){envs[1].classList.remove('active');envs[1].classList.add('done');envs[2].classList.add('active')}if(i===3){envs[2].classList.remove('active');envs[2].classList.add('done');envs[3].classList.add('active')}if(i===4){envs[3].classList.remove('active');envs[3].classList.add('done')}}$('pipelineStatus').textContent='SUCCESS';$('pipelineSub').textContent='Demo completada · no se ejecutó un deploy real';btn.disabled=false;toast('Demo pipeline completada. No se realizaron cambios en AWS, Azure ni GitHub Actions.');});
  load();
})();


// Module navigation: highlight the active section and keep all dashboard areas reachable.
(() => {
  const links = [...document.querySelectorAll('.module-nav .nav-item')];
  const targets = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const setActive = id => links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
  links.forEach(link => link.addEventListener('click', () => setActive(link.getAttribute('href').slice(1))));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, {rootMargin:'-18% 0px -65% 0px', threshold:[0,.1,.25,.5]});
    targets.forEach(target => observer.observe(target));
  }
})();
