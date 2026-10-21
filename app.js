'use strict';
const SUPPORT_EMAIL='charithdabarera@gmail.com';
const $=s=>document.querySelector(s),S={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('fp_'+k))??d}catch{return d}},set:(k,v)=>{if(!window.__imp)localStorage.setItem('fp_'+k,JSON.stringify(v))}};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// tabs
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.id==='tab-'+b.dataset.t))});
const h=new Date().getHours();$('#greet').textContent=(h<12?'Good morning':h<18?'Good afternoon':'Good evening')+' — small steps, gentle wins.';
// audio chime
let ac;function chime(){if(S.get('rem',{}).snd===false&&arguments[0]!==true)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const t=ac.currentTime;[523.25,659.25,783.99].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t+i*.25);g.gain.linearRampToValueAtTime(.18,t+i*.25+.05);g.gain.exponentialRampToValueAtTime(.001,t+i*.25+1.8);o.connect(g).connect(ac.destination);o.start(t+i*.25);o.stop(t+i*.25+2)})}catch(e){}}

// ===== games
let timer,cleanup=()=>{};const area=$('#gameArea'),body=$('#gBody');
function endGame(msg){clearInterval(timer);cleanup();cleanup=()=>{};body.innerHTML=`<p class="center" style="font-size:20px">${msg||'Nice work 🌿'}</p>`;$('#gTimer').textContent='done';chime(true)}
function startGame(g){clearInterval(timer);cleanup();area.classList.remove('hidden');$('#gTitle').textContent=g.e+' '+g.n;let left=g.t;const show=()=>$('#gTimer').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');show();timer=setInterval(()=>{left--;show();if(left<=0)endGame('Time’s up — well played 🌿')},1000);g.f();area.scrollIntoView({behavior:'smooth'})}
const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const games=[
{n:'Memory match',e:'🧠',t:120,d:'Find the pairs',f(){const c=sh([...'🌸🍃🌙⭐🐢🍓'].flatMap(x=>[x,x]));let open=[],found=0,lock=false;body.innerHTML='<div class="mem">'+c.map((x,i)=>`<button data-i="${i}" aria-label="card"></button>`).join('')+'</div>';body.querySelectorAll('.mem button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(lock||b.classList.contains('up')||b.classList.contains('ok'))return;b.textContent=c[i];b.classList.add('up');open.push(b);if(open.length===2){lock=true;const[a,z]=open;setTimeout(()=>{if(c[a.dataset.i]===c[z.dataset.i]){a.className=z.className='ok';found++}else{a.className=z.className='';a.textContent=z.textContent=''}open=[];lock=false;if(found===6)endGame('All pairs found! 🎉')},650)}})}},
{n:'Breathing bubble',e:'🫧',t:90,d:'Breathe with the bubble',f(){body.innerHTML='<div class="bub" id="bub">Breathe in</div><p class="center sub">In 4s · Out 4s. Follow the bubble.</p>';let inh=true;const b=$('#bub');const step=()=>{b.classList.toggle('in',inh);b.textContent=inh?'Breathe in':'Breathe out';inh=!inh};setTimeout(step,50);const iv=setInterval(step,4000);cleanup=()=>clearInterval(iv)}},
{n:'Tap the color',e:'🎯',t:60,d:'Tap only on green',f(){let score=0,miss=0,to;body.innerHTML='<p class="center">Tap when it turns <b style="color:#5f8f7d">green</b>.</p><button class="target" id="tg">Wait…</button><p class="center" id="sc">Score 0</p>';const tg=$('#tg'),cols=['#a9c6e8','#f4b6a6','#c9b8e8','#f3d9a4'];let green=false,t0=0;const next=()=>{green=Math.random()<.4;tg.style.background=green?'#8fb9a8':cols[Math.random()*4|0];tg.textContent=green?'TAP!':'not yet…';t0=performance.now();to=setTimeout(next,900+Math.random()*900)};tg.onclick=()=>{if(green){score++;tg.textContent=Math.round(performance.now()-t0)+' ms ✓';green=false}else miss++;$('#sc').textContent=`Score ${score} · Oops ${miss}`};next();cleanup=()=>clearTimeout(to)}},
{n:'Word scramble',e:'🔤',t:120,d:'Unscramble calm words',f(){const W=sh(['CALM','FOCUS','BREATHE','PEACE','SMILE','REST','GENTLE','RELAX','SUNNY','OCEAN']);let wi=0,sol=0;const round=()=>{if(wi>=5)return endGame(`Solved ${sol} words 🎉`);const w=W[wi];let L=sh([...w]);if(L.join('')===w)L=L.reverse();let ans='';body.innerHTML=`<p class="center sub">Word ${wi+1} of 5</p><div class="ans" id="ans">&nbsp;</div><div class="letters">${L.map((c,i)=>`<button data-i="${i}">${c}</button>`).join('')}</div><div class="row"><button class="soft" id="rs">Reset</button><button class="soft" id="sk">Skip</button></div>`;body.querySelectorAll('.letters button').forEach(b=>b.onclick=()=>{ans+=b.textContent;b.disabled=true;b.style.opacity=.3;$('#ans').textContent=ans;if(ans.length===w.length){if(ans===w){sol++;$('#ans').textContent='✓ '+w}else $('#ans').textContent='✗ '+w;wi++;setTimeout(round,900)}});$('#rs').onclick=round;$('#sk').onclick=()=>{wi++;round()}};round()}},
{n:'Calm sort',e:'🧺',t:90,d:'Fruit or nature?',f(){const F=['🍎','🍌','🍇','🍓','🍐','🍑'],N=['🌲','🌻','🍁','🌵','🌷','🍄'];const items=sh([...F,...N]);let i=0,ok=0;const r=()=>{if(i>=items.length)return endGame(`${ok}/${items.length} sorted 🌿`);body.innerHTML=`<p class="center sub">${i+1} / ${items.length}</p><div class="item">${items[i]}</div><div class="sortbins"><button id="bf">🧺 Fruit</button><button id="bn">🌿 Nature</button></div>`;const pick=f=>{if(F.includes(items[i])===f)ok++;i++;r()};$('#bf').onclick=()=>pick(true);$('#bn').onclick=()=>pick(false)};r()}}
];
$('#gameList').innerHTML=games.map((g,i)=>`<button data-g="${i}"><b>${g.e}</b>${g.n}<small>${g.d} · ${Math.round(g.t/60*10)/10} min</small></button>`).join('');
$('#gameList').querySelectorAll('button').forEach(b=>b.onclick=()=>startGame(games[b.dataset.g]));
let lastG=-1;$('#surprise').onclick=()=>{let i;do i=Math.random()*games.length|0;while(i===lastG);lastG=i;startGame(games[i])};
$('#gExit').onclick=()=>{clearInterval(timer);cleanup();area.classList.add('hidden')};
// ===== wants
const ld=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),today=()=>ld(new Date());
function streak(){const days=new Set(S.get('doneDays',[]));let n=0,d=new Date();if(!days.has(today()))d.setDate(d.getDate()-1);while(days.has(ld(d))){n++;d.setDate(d.getDate()-1)}return n}
function renderW(){const w=S.get('wants',[]);$('#wList').innerHTML=w.length?w.map((x,i)=>`<li class="${x.done?'done':''}"><button class="ck" data-i="${i}" aria-label="done">${x.done?'✓':''}</button><span>${esc(x.t)}</span><button class="del" data-d="${i}" aria-label="delete">✕</button></li>`).join(''):'<p class="sub">Nothing yet — add one small thing you’d enjoy.</p>';const s=streak(),dn=w.filter(x=>x.done&&x.at===today()).length;$('#streak').textContent=`🔥 ${s}-day streak · ${dn} done today`;
$('#wList').querySelectorAll('.ck').forEach(b=>b.onclick=()=>{const w=S.get('wants',[]),x=w[b.dataset.i];x.done=!x.done;x.at=x.done?today():null;S.set('wants',w);if(x.done){const d=S.get('doneDays',[]);if(!d.includes(today()))d.push(today());S.set('doneDays',d.slice(-400));chime(true)}renderW()});
$('#wList').querySelectorAll('.del').forEach(b=>b.onclick=()=>{const w=S.get('wants',[]);w.splice(b.dataset.d,1);S.set('wants',w);renderW()})}
$('#wForm').onsubmit=e=>{e.preventDefault();const t=$('#wIn').value.trim();if(!t)return;const w=S.get('wants',[]);w.unshift({t,done:false});S.set('wants',w);$('#wIn').value='';renderW()};
$('#wClear').onclick=()=>{S.set('wants',S.get('wants',[]).filter(x=>!x.done));renderW()};renderW();
// ===== routine
const DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
let R=S.get('routine',{sleep:8,ess:2,days:DN.map((d,i)=>({on:i<5,s:'09:00',e:'17:00'}))});
const mins=t=>{const[a,b]=t.split(':').map(Number);return a*60+b};
if(R.ess==null)R.ess=2;
function renderR(){$('#sleep').value=R.sleep;$('#ess').value=R.ess;$('#days').innerHTML=R.days.map((d,i)=>`<div class="day"><div class="row"><b>${DN[i]}</b><input type="time" data-i="${i}" data-k="s" value="${d.s}" ${d.on?'':'disabled'}><input type="time" data-i="${i}" data-k="e" value="${d.e}" ${d.on?'':'disabled'}><label class="off"><input type="checkbox" data-i="${i}" data-k="on" ${d.on?'checked':''}>work</label></div></div>`).join('');
$('#days').querySelectorAll('input').forEach(x=>x.onchange=()=>{const d=R.days[x.dataset.i];if(x.dataset.k==='on')d.on=x.checked;else d[x.dataset.k]=x.value;S.set('routine',R);renderR()});bars()}
function bars(){const ES=+R.ess||0;$('#bars').innerHTML=R.days.map((d,i)=>{let w=0;if(d.on&&d.s&&d.e){w=(mins(d.e)-mins(d.s))/60;if(w<0)w+=24}const sl=Math.min(+R.sleep||0,24),me=Math.max(0,24-sl-w-ES);const p=x=>(x/24*100).toFixed(1)+'%';return `<div class="blabel"><b>${DN[i]}</b><span>${me.toFixed(1)} h me time</span></div><div class="bar"><div class="sl" style="width:${p(sl)}"></div><div class="wk" style="width:${p(Math.min(w,24-sl))}"></div><div class="es" style="width:${p(Math.min(ES,Math.max(0,24-sl-w)))}"></div><div class="me" style="width:${p(me)}"></div></div>`}).join('')}
$('#sleep').onchange=()=>{R.sleep=Math.max(0,Math.min(16,+$('#sleep').value||0));S.set('routine',R);renderR()};
$('#ess').onchange=()=>{R.ess=Math.max(0,Math.min(12,+$('#ess').value||0));S.set('routine',R);renderR()};renderR();
// ===== reminders with priority
let M=S.get('rem',{});M=Object.assign({brOn:true,brMin:50,brPri:'needed',wdOn:true,wdTime:'21:30',wdPri:'important',snd:true,wdDay:''},M);M.lastBr=Date.now();
['brOn','wdOn','snd'].forEach(k=>{$('#'+k).checked=M[k];$('#'+k).onchange=()=>{M[k]=$('#'+k).checked;if(k==='brOn')M.lastBr=Date.now();save()}});
['brPri','wdPri','wdTime'].forEach(k=>{$('#'+k).value=M[k];$('#'+k).onchange=()=>{M[k]=$('#'+k).value;save()}});
$('#brMin').value=M.brMin;$('#brMin').onchange=()=>{M.brMin=Math.max(5,+$('#brMin').value||50);M.lastBr=Date.now();save()};
function save(){S.set('rem',M);nextInfo()}
function permInfo(){$('#permStat').textContent=!('Notification' in window)?'Notifications not supported here — in-app pop-ups will be used.':'Notification permission: '+Notification.permission+(Notification.permission==='granted'?' ✓':' (in-app pop-ups used as fallback)')}
$('#perm').onclick=async()=>{if('Notification' in window){try{await Notification.requestPermission()}catch(e){}}permInfo()};
async function notify(t,m,o){if(!('Notification' in window)||Notification.permission!=='granted')return;try{const r=await navigator.serviceWorker?.getRegistration();r?await r.showNotification(t,Object.assign({body:m,icon:'icon.svg'},o)):new Notification(t,Object.assign({body:m,icon:'icon.svg'},o))}catch(e){}}
let toastT,urgLoop,urgCur=null;const LV={needed:'Needed',important:'Important',urgent:'Urgent'};
function chimes(n,force){for(let i=0;i<n;i++)setTimeout(()=>chime(force),i*900)}
function remind(title,msg,pri='needed',src=null){
 if(pri==='needed'){chimes(1);$('#toastMsg').textContent=title+' — '+msg;const t=$('#toast');t.classList.remove('hidden');t.style.animation='none';t.offsetHeight;t.style.animation='';clearTimeout(toastT);toastT=setTimeout(()=>t.classList.add('hidden'),5000);if(document.visibilityState!=='visible')notify(title,msg,{tag:'fp-n',silent:true})}
 else if(pri==='important'){chimes(2);$('#cardT').textContent=title;$('#cardM').textContent=msg;$('#card').classList.remove('hidden');notify(title,msg,{tag:'fp-i'})}
 else{urgCur={title,msg,src};$('#urgT').textContent=title;$('#urgM').textContent=msg;$('#urgent').classList.remove('hidden');clearInterval(urgLoop);chimes(2,true);urgLoop=setInterval(()=>chimes(2,true),4000);navigator.vibrate?.([400,200,400,200,400]);notify('⚠ '+title,msg,{tag:'fp-u',requireInteraction:true,vibrate:[400,200,400,200,400],renotify:true})}}
$('#toast').onclick=()=>$('#toast').classList.add('hidden');$('#cardOk').onclick=()=>$('#card').classList.add('hidden');
function ackUrg(){clearInterval(urgLoop);navigator.vibrate?.(0);$('#urgent').classList.add('hidden');navigator.serviceWorker?.getRegistration().then(r=>r&&r.getNotifications({tag:'fp-u'}).then(l=>l.forEach(n=>n.close()))).catch(()=>{})}
$('#urgDone').onclick=()=>{ackUrg();urgCur=null};
$('#urgSnooze').onclick=()=>{ackUrg();const c=urgCur;urgCur=null;if(c)setTimeout(()=>remind(c.title,c.msg,'urgent',c.src),5*6e4);toast2('Snoozed for 5 minutes')};
function toast2(m){$('#toastMsg').textContent=m;$('#toast').classList.remove('hidden');clearTimeout(toastT);toastT=setTimeout(()=>$('#toast').classList.add('hidden'),3000)}
document.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>{chime(true);const p=b.dataset.test;remind(p==='urgent'?'Take your medication':p==='important'?'Time for a soft break 🌿':'Sip some water 💧',p==='urgent'?'This one really matters — please do it now.':'A small reset helps your focus.',p)});
// custom reminders
let CR=S.get('custom',[]);
$('#cMode').onchange=()=>{const e=$('#cMode').value==='every';$('#cTimeL').classList.toggle('hidden',e);$('#cEveryL').classList.toggle('hidden',!e)};
$('#cForm').onsubmit=e=>{e.preventDefault();const n=$('#cName').value.trim();if(!n)return;const mode=$('#cMode').value;CR.push({id:Date.now(),name:n,mode,time:$('#cTime').value||'12:00',every:Math.max(1,+$('#cEvery').value||60),pri:$('#cPri').value,on:true,last:Date.now(),lastDay:''});S.set('custom',CR);$('#cName').value='';renderC()};
function renderC(){$('#cList').innerHTML=CR.length?CR.map((r,i)=>`<li class="rm lv-${r.pri}"><span>${esc(r.name)}<small>${r.mode==='time'?'Daily at '+r.time:'Every '+r.every+' min'} · ${LV[r.pri]}${r.on?'':' · paused'}</small></span><select data-p="${i}" class="pri">${Object.keys(LV).map(k=>`<option value="${k}" ${k===r.pri?'selected':''}>${LV[k]}</option>`).join('')}</select><button class="del" data-o="${i}" aria-label="pause">${r.on?'⏸':'▶'}</button><button class="del" data-d="${i}" aria-label="delete">✕</button></li>`).join(''):'<p class="sub">No task reminders yet.</p>';
 $('#cList').querySelectorAll('[data-p]').forEach(s=>s.onchange=()=>{CR[s.dataset.p].pri=s.value;S.set('custom',CR);renderC()});
 $('#cList').querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const r=CR[b.dataset.o];r.on=!r.on;r.last=Date.now();S.set('custom',CR);renderC()});
 $('#cList').querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{CR.splice(b.dataset.d,1);S.set('custom',CR);renderC()})}
renderC();
function nextInfo(){const p=[];if(M.brOn)p.push('Next break in ~'+Math.max(0,Math.ceil((M.lastBr+M.brMin*6e4-Date.now())/6e4))+' min');if(M.wdOn)p.push('Wind-down at '+M.wdTime);$('#nextR').textContent=p.join(' · ')||'Break & wind-down reminders are off.'}
function isWork(){const d=R.days[(new Date().getDay()+6)%7];if(!d.on)return false;const n=new Date().getHours()*60+new Date().getMinutes(),s=mins(d.s),e=mins(d.e);return s<=e?n>=s&&n<e:n>=s||n<e}
const hmNow=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
// first run: don't fire times already passed today
CR.forEach(r=>{if(r.mode==='time'&&!r.lastDay&&hmNow()>=r.time)r.lastDay=today()});if(!M.wdDay&&hmNow()>=M.wdTime)M.wdDay=today();
setInterval(()=>{const now=Date.now(),hm=hmNow();
 if(M.brOn&&now-M.lastBr>=M.brMin*6e4){M.lastBr=now;if(isWork())remind('Time for a soft break 🌿',`You’ve worked ${M.brMin} minutes. Stretch and breathe.`,M.brPri)}
 if(M.wdOn&&hm>=M.wdTime&&M.wdDay!==today()){M.wdDay=today();remind('Chime down 🌙','Time to wind down: dim lights, put screens away.',M.wdPri)}
 let ch=false;CR.forEach(r=>{if(!r.on)return;if(r.mode==='every'&&now-r.last>=r.every*6e4){r.last=now;ch=true;remind(r.name,'Repeating reminder',r.pri)}else if(r.mode==='time'&&hm>=r.time&&r.lastDay!==today()){r.lastDay=today();ch=true;remind(r.name,'Scheduled for '+r.time,r.pri)}});if(ch)S.set('custom',CR);
 save()},15000);
// ===== themes
const PAL={sage:{n:'Sage',bg:'#f6f3ee',card:'#ffffff',ink:'#3d4a4a',mute:'#86908f',g:'#8fb9a8',soft:'#eef1ef',field:'#fbfaf8',line:'#e6e1da',nav:'#fffffff0'},
ocean:{n:'Ocean',bg:'#eef4f8',card:'#ffffff',ink:'#2f4356',mute:'#7f93a5',g:'#6fa3c8',soft:'#e5eef5',field:'#f7fafc',line:'#d8e4ee',nav:'#fffffff0'},
sunset:{n:'Sunset',bg:'#fbf1ea',card:'#ffffff',ink:'#5a3f3a',mute:'#a08a83',g:'#e7997e',soft:'#f7e9e1',field:'#fdf8f5',line:'#efdcd1',nav:'#fffffff0'},
lavender:{n:'Lavender',bg:'#f4f1fa',card:'#ffffff',ink:'#443d56',mute:'#8f88a3',g:'#a693d1',soft:'#ece7f6',field:'#faf9fd',line:'#e1daf0',nav:'#fffffff0'},
forest:{n:'Forest',bg:'#eff3ec',card:'#ffffff',ink:'#2f3f2f',mute:'#7f8f7c',g:'#6f9a6a',soft:'#e4ece1',field:'#f8faf6',line:'#d6e1d2',nav:'#fffffff0'},
dark:{n:'Dark',bg:'#1c2023',card:'#262b2f',ink:'#e6ebe8',mute:'#9aa3a0',g:'#7fb3a0',soft:'#30363a',field:'#2c3135',line:'#3a4145',nav:'#262b2ff0'}};
let TH=S.get('theme',{p:'sage',accent:''});
function darken(hex,f){const n=parseInt(hex.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*f).toString(16).padStart(2,'0')).join('')}
function applyTheme(){const p=PAL[TH.p]||PAL.sage,r=document.documentElement.style;['bg','card','ink','mute','g','soft','field','line','nav'].forEach(k=>r.setProperty('--'+k,p[k]));const acc=TH.accent||p.g;r.setProperty('--g',acc);r.setProperty('--gi',TH.p==='dark'?acc:darken(acc,.72));document.querySelector('meta[name=theme-color]').content=acc;$('#accent').value=acc;
 $('#pal').innerHTML=Object.entries(PAL).map(([k,v])=>`<button data-p="${k}" class="${k===TH.p?'on':''}" style="background:${v.bg};color:${v.ink}"><span class="sw"><i style="background:${v.g}"></i><i style="background:${v.card};border:1px solid ${v.line}"></i><i style="background:${v.ink}"></i></span>${v.n}</button>`).join('');
 $('#pal').querySelectorAll('button').forEach(b=>b.onclick=()=>{TH.p=b.dataset.p;TH.accent='';S.set('theme',TH);applyTheme()})}
$('#accent').oninput=()=>{TH.accent=$('#accent').value;S.set('theme',TH);applyTheme()};$('#accReset').onclick=()=>{TH.accent='';S.set('theme',TH);applyTheme()};applyTheme();
// ===== suggestion box
let rating=0;function stars(){$('#stars').innerHTML=[1,2,3,4,5].map(n=>`<button type="button" data-s="${n}" class="${n<=rating?'on':''}" aria-label="${n} stars">★</button>`).join('');$('#stars').querySelectorAll('button').forEach(b=>b.onclick=()=>{rating=rating===+b.dataset.s?0:+b.dataset.s;stars()})}stars();
function saveSug(){const t=$('#sText').value.trim();if(!t){$('#sText').reportValidity();return null}const s={t,type:$('#sType').value,rating,at:new Date().toLocaleString(),sent:false};const L=S.get('sugs',[]);L.unshift(s);S.set('sugs',L);$('#sText').value='';rating=0;stars();renderS();return s}
function mail(s){location.href=`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('FocusPlay '+s.type+' suggestion')}&body=${encodeURIComponent(`Type: ${s.type}\nRating: ${s.rating?s.rating+'/5':'—'}\nDate: ${s.at}\n\n${s.t}`)}`}
function markSent(i){const L=S.get('sugs',[]);if(L[i]){L[i].sent=true;S.set('sugs',L);renderS()}}
$('#sForm').onsubmit=e=>{e.preventDefault();if(saveSug())toast2('Suggestion saved 💚')};
$('#sSend').onclick=()=>{const s=saveSug();if(s){markSent(0);mail(s)}};
function renderS(){const L=S.get('sugs',[]);$('#sList').innerHTML=L.length?L.map((s,i)=>`<li><span><b>${s.type}</b>${s.rating?' · '+'★'.repeat(s.rating):''}<br>${esc(s.t)}<small>${s.at}${s.sent?' · sent ✉️':''}</small></span><button class="del" data-m="${i}" aria-label="send">✉️</button><button class="del" data-x="${i}" aria-label="delete">✕</button></li>`).join(''):'<p class="sub">No suggestions yet.</p>';
 $('#sList').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const s=S.get('sugs',[])[b.dataset.m];markSent(+b.dataset.m);mail(s)});
 $('#sList').querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{const L=S.get('sugs',[]);L.splice(b.dataset.x,1);S.set('sugs',L);renderS()})}
renderS();
permInfo();nextInfo();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
// ===== Gentle nudges
const PRESETS=[['water','💧','Drink water — stay hydrated',60],['stretch','🙆','Stretch your body',45],['eyes','👀','Eye break: look 20 ft away for 20 s',20],['posture','🪑','Posture check: shoulders down, back tall',30],['breath','🌬️','Take one deep breath',90],['phone','📵','Put your phone away for a bit',120]];
let G=S.get('gentle',null);
if(!G){G=PRESETS.map(([id,e,n,ev])=>({id,e,name:n,on:id==='water'||id==='eyes',mode:'interval',every:ev,times:['10:00','15:00'],repeat:'always',days:[0,1,2,3,4],from:'',to:'',ah:true,ahS:'08:00',ahE:'21:00',pri:'needed',last:Date.now(),fired:{}}));S.set('gentle',G)}
G.forEach(g=>g.last=Date.now());
const saveG=()=>S.set('gentle',G);let editId=null;
function gDesc(g){const m=g.mode==='interval'?'Every '+g.every+' min':'At '+(g.times.join(', ')||'—');const r=g.repeat==='always'?'always':g.repeat==='weekdays'?g.days.map(d=>DN[d]).join(' '):((g.from||'…')+' → '+(g.to||'…'));return `${m} · ${r}${g.ah?' · '+g.ahS+'–'+g.ahE:''} · ${LV[g.pri]}`}
function renderG(){$('#gList').innerHTML=G.map(g=>`<li class="gn lv-${g.pri}" data-e="${g.id}"><span class="em">${g.e||'🌱'}</span><span>${esc(g.name)}<small>${gDesc(g)}</small></span><input type="checkbox" data-t="${g.id}" ${g.on?'checked':''} aria-label="on/off"></li>`).join('');
 $('#gList').querySelectorAll('[data-t]').forEach(c=>{c.onclick=e=>e.stopPropagation();c.onchange=()=>{const g=G.find(x=>x.id===c.dataset.t);g.on=c.checked;g.last=Date.now();saveG()}});
 $('#gList').querySelectorAll('li').forEach(l=>l.onclick=()=>openG(l.dataset.e))}
function timeRow(v){return `<div class="row"><input type="time" value="${v}"><button class="del" type="button" onclick="this.parentNode.remove()">✕</button></div>`}
function gVis(){$('#gEvL').classList.toggle('hidden',$('#gMode').value!=='interval');$('#gTimesL').classList.toggle('hidden',$('#gMode').value!=='times');$('#gDaysL').classList.toggle('hidden',$('#gRep').value!=='weekdays');$('#gRangeL').classList.toggle('hidden',$('#gRep').value!=='range');$('#gAhL').classList.toggle('hidden',!$('#gAh').checked)}
['#gMode','#gRep','#gAh'].forEach(s=>$(s).onchange=gVis);
function openG(id){editId=id;const g=G.find(x=>x.id===id)||{e:'🌱',name:'',mode:'interval',every:30,times:['12:00'],repeat:'always',days:[0,1,2,3,4],from:today(),to:today(),ah:false,ahS:'08:00',ahE:'21:00',pri:'needed'};
 $('#gEdT').textContent=id?'Edit nudge':'New nudge';$('#gName').value=g.name;$('#gMode').value=g.mode;$('#gEvery').value=g.every;$('#gTimes').innerHTML=g.times.map(timeRow).join('');$('#gRep').value=g.repeat;document.querySelectorAll('.gDay').forEach(c=>c.checked=g.days.includes(+c.value));$('#gFrom').value=g.from;$('#gTo').value=g.to;$('#gAh').checked=g.ah;$('#gAhS').value=g.ahS;$('#gAhE').value=g.ahE;$('#gPri').value=g.pri;$('#gDel').classList.toggle('hidden',!id||PRESETS.some(p=>p[0]===id));gVis();$('#gEdit').classList.remove('hidden');$('#gEdit').scrollIntoView({behavior:'smooth'})}
$('#gNew').onclick=()=>openG(null);function nextT(){const v=[...$('#gTimes').querySelectorAll('input')].map(i=>i.value).filter(Boolean);let m;if(v.length){m=(mins(v[v.length-1])+60)%1440}else{const d=new Date();m=(Math.ceil((d.getHours()*60+d.getMinutes())/30)*30)%1440}return String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
$('#gAddT').onclick=()=>$('#gTimes').insertAdjacentHTML('beforeend',timeRow(nextT()));$('#gCancel').onclick=()=>$('#gEdit').classList.add('hidden');
$('#gSave').onclick=()=>{const n=$('#gName').value.trim();if(!n){$('#gName').focus();return}let g=G.find(x=>x.id===editId);if(!g){g={id:'u'+Date.now(),e:'🌱',on:true,fired:{}};G.push(g)}
 Object.assign(g,{name:n,mode:$('#gMode').value,every:Math.max(1,+$('#gEvery').value||30),times:[...$('#gTimes').querySelectorAll('input')].map(i=>i.value).filter(Boolean).sort(),repeat:$('#gRep').value,days:[...document.querySelectorAll('.gDay:checked')].map(c=>+c.value),from:$('#gFrom').value,to:$('#gTo').value,ah:$('#gAh').checked,ahS:$('#gAhS').value||'08:00',ahE:$('#gAhE').value||'21:00',pri:$('#gPri').value,last:Date.now()});
 saveG();renderG();$('#gEdit').classList.add('hidden');toast2('Nudge saved 🌱')};
$('#gDel').onclick=()=>{G=G.filter(x=>x.id!==editId);saveG();renderG();$('#gEdit').classList.add('hidden')};
function gActive(g){const d=new Date(),t=today(),hm=hmNow();if(g.repeat==='weekdays'&&!g.days.includes((d.getDay()+6)%7))return false;if(g.repeat==='range'&&((g.from&&t<g.from)||(g.to&&t>g.to)))return false;if(g.ah&&(g.ahS<=g.ahE?(hm<g.ahS||hm>=g.ahE):(hm<g.ahS&&hm>=g.ahE)))return false;return true}
// skip times already passed on first load
G.forEach(g=>{g.fired=g.fired||{};g.times.forEach(tm=>{if(hmNow()>=tm&&!g.fired[tm])g.fired[tm]=today()})});saveG();
function tickG(){const now=Date.now(),hm=hmNow();let ch=false;G.forEach(g=>{if(!g.on)return;if(g.mode==='interval'){if(now-g.last>=g.every*6e4){g.last=now;ch=true;if(gActive(g))fireG(g)}}else g.times.forEach(tm=>{if(hm>=tm&&g.fired[tm]!==today()){g.fired[tm]=today();ch=true;if(gActive(g))fireG(g)}})});if(ch)saveG()}
function fireG(g){remind((g.e||'🌱')+' '+g.name,g.id==='water'?`Water: ${water().n}/${water().goal} glasses today`:'A gentle nudge for you.',g.pri)}
setInterval(tickG,15000);renderG();
// water
function water(){const w=S.get('water',{goal:8,log:{}});return {goal:w.goal,n:w.log[today()]||0,w}}
function renderWater(){const {goal,n}=water();$('#wCount').textContent=`${n} / ${goal}`+(n>=goal?' 🎉':'');$('#glasses').textContent='💧'.repeat(Math.min(n,goal))+'○'.repeat(Math.max(0,goal-n))+(n>goal?' +'+(n-goal):'');$('#wGoal').value=goal}
function addW(d){const {w}=water();w.log[today()]=Math.max(0,(w.log[today()]||0)+d);S.set('water',w);renderWater();if(d>0&&w.log[today()]===w.goal){chime(true);toast2('Water goal reached! 💧🎉')}}
$('#wPlus').onclick=()=>addW(1);$('#wMinus').onclick=()=>addW(-1);$('#wGoal').onchange=()=>{const {w}=water();w.goal=Math.max(1,Math.min(20,+$('#wGoal').value||8));S.set('water',w);renderWater()};renderWater();
// ===== in-app usage (on-device only: measures time this app is visible, nothing else)
let U=S.get('usage',{on:true,lim:30,log:{},nudged:''}),sess=0,lastTick=Date.now();
$('#uOn').checked=U.on;$('#uLim').value=U.lim;$('#uOn').onchange=()=>{U.on=$('#uOn').checked;S.set('usage',U)};$('#uLim').onchange=()=>{U.lim=Math.max(1,+$('#uLim').value||30);U.nudged='';S.set('usage',U)};
const fmt=s=>s<3600?Math.floor(s/60)+'m':Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m';
function tickU(){const now=Date.now(),dt=Math.min(5,(now-lastTick)/1000);lastTick=now;if(document.visibilityState!=='visible'||pfEnd)return;sess+=dt;U.log[today()]=(U.log[today()]||0)+dt;$('#uSess').textContent=fmt(sess);$('#uDay').textContent=fmt(U.log[today()]);
 if(U.on&&U.log[today()]>=U.lim*60&&U.nudged!==today()){U.nudged=today();remind('📵 Time to put the phone down','You’ve spent '+fmt(U.log[today()])+' in FocusPlay today. Try some phone‑free time?','needed')}}
setInterval(tickU,1000);setInterval(()=>{const k=Object.keys(U.log).sort();while(k.length>60)delete U.log[k.shift()];S.set('usage',U)},10000);
document.addEventListener('visibilitychange',()=>{lastTick=Date.now();S.set('usage',U)});
// phone-free focus timer
let pfEnd=0,pfIv;function pfStop(done){clearInterval(pfIv);pfEnd=0;$('#pfree').classList.add('hidden');if(done){chimes(2,true);remind('🌿 Phone‑free time complete','Lovely. Welcome back.','important')}}
document.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{pfEnd=Date.now()+b.dataset.pf*6e4;$('#pfree').classList.remove('hidden');chime(true);const up=()=>{const s=Math.max(0,Math.round((pfEnd-Date.now())/1000));$('#pfT').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');if(s<=0)pfStop(true)};up();clearInterval(pfIv);pfIv=setInterval(up,500)});
$('#pfStop').onclick=()=>pfStop(false);
// ===== Referral (PROTOTYPE ONLY)
// NOTE: Local-only demo; NOT functional for payouts. Planned reward: $1 credit per friend who buys
// with your code, stacking. Payout = App Store / Google Play gift cards or promo codes issued by the
// developer. Requires a small backend to verify referrals (record code at purchase, validate receipt,
// tally credits per code). Nothing is sent anywhere here; credits stay at $0 locally.
const RA='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
const RC=new RegExp('^FOCUS-['+RA+']{4}-['+RA+']{4}$');
// Random locally; collisions are unlikely (31^8 ≈ 8.5e11) but true per-person uniqueness needs server-side issuance.
function genCode(){const out=[];while(out.length<8){const b=crypto.getRandomValues(new Uint8Array(16));for(const x of b){if(x<248&&out.length<8)out.push(RA[x%31])}}return 'FOCUS-'+out.slice(0,4).join('')+'-'+out.slice(4).join('')}
let REF=S.get('ref',null);
if(!REF){REF={mine:genCode(),friend:''};S.set('ref',REF)}
else if(!RC.test(REF.mine)){REF.oldCode=REF.mine;REF.mine=genCode();S.set('ref',REF)} // migrate legacy FOCUS-XXXX
function renderRef(){$('#myCode').textContent=REF.mine;$('#rCred').textContent='$'+(REF.credits||0);$('#rCnt').textContent=REF.credits||0;if(REF.friend){$('#rFriend').innerHTML=`<p>✓ Friend code applied: <b>${esc(REF.friend)}</b></p>`;}}
const shareTxt=()=>`I use FocusPlay, a calm ADHD-support app. Use my code ${REF.mine} when you buy!`;
async function copyCode(){try{await navigator.clipboard.writeText(REF.mine);toast2('Code copied 📋')}catch(e){toast2('Your code: '+REF.mine)}}
$('#rShare').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'FocusPlay',text:shareTxt()})}catch(e){}}else copyCode()};$('#rCopy').onclick=copyCode;
document.addEventListener('submit',e=>{if(e.target.id!=='rForm')return;e.preventDefault();const v=$('#rIn').value.trim().toUpperCase();if(!RC.test(v)){$('#rMsg').textContent='Codes look like FOCUS-AB2C-DE3F.';return}if(v===REF.mine){$('#rMsg').textContent='That’s your own code 🙂';return}REF.friend=v;S.set('ref',REF);$('#rMsg').textContent='Thanks! Code saved on this device.';renderRef()});renderRef();
// ===== Export / import
$('#exp').onclick=()=>{const d={app:'FocusPlay',version:3,exported:new Date().toISOString(),data:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('fp_'))d.data[k]=localStorage.getItem(k)}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='focusplay-backup-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);$('#bkMsg').textContent='Backup saved to your device.'};
$('#impB').onclick=()=>$('#imp').click();
function askConfirm(msg){return new Promise(res=>{$('#cfMsg').textContent=msg;$('#confirm').classList.remove('hidden');const done=v=>{$('#confirm').classList.add('hidden');$('#cfYes').onclick=$('#cfNo').onclick=null;res(v)};$('#cfYes').onclick=()=>done(true);$('#cfNo').onclick=()=>done(false)})}

$('#imp').onchange=async()=>{const f=$('#imp').files[0];$('#imp').value='';if(!f)return;let d;try{d=JSON.parse(await f.text());if(d.app!=='FocusPlay'||!d.data||typeof d.data!=='object')throw 0}catch(e){$('#bkMsg').textContent='That file isn’t a valid FocusPlay backup.';return}
 const n=Object.keys(d.data).filter(k=>k.startsWith('fp_')).length;if(!await askConfirm(`This backup (${(d.exported||'').slice(0,10)}, ${n} items) will replace everything currently in FocusPlay on this device.`))return;
 window.__imp=true;Object.keys(localStorage).filter(k=>k.startsWith('fp_')).forEach(k=>localStorage.removeItem(k));Object.entries(d.data).forEach(([k,v])=>{if(k.startsWith('fp_')&&typeof v==='string')localStorage.setItem(k,v)});sessionStorage.setItem('fp_imported','1');location.reload()};
if(sessionStorage.getItem('fp_imported')){sessionStorage.removeItem('fp_imported');setTimeout(()=>toast2('Backup restored ✓'),300)}
