'use strict';
var SUPPORT_EMAIL='charithdabarera@gmail.com';
var $=function(s){return document.querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var S={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('fp_'+k));return v==null?d:v}catch(e){return d}},set:function(k,v){if(window.__imp)return;try{localStorage.setItem('fp_'+k,JSON.stringify(v))}catch(e){}}};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var pad=function(n){return String(n).padStart(2,'0')};
// ===== feature detection
var HAS={notif:'Notification' in window,vibrate:typeof navigator.vibrate==='function',share:typeof navigator.share==='function',audio:!!(window.AudioContext||window.webkitAudioContext),sw:'serviceWorker' in navigator,clip:!!(navigator.clipboard&&navigator.clipboard.writeText),seg:typeof Intl!=='undefined'&&typeof Intl.Segmenter==='function'};
function vibrate(p){if(HAS.vibrate){try{navigator.vibrate(p)}catch(e){}}}
// ===== i18n
var L=window.I18N,LANG='en';
function pickLang(){var s=S.get('lang','');if(s&&L.dict[s])return s;var ls=navigator.languages||[navigator.language||'en'];for(var i=0;i<ls.length;i++){var c=String(ls[i]).toLowerCase();if(L.dict[c])return c;var b=c.split('-')[0];if(b==='zh')return 'zh';if(b==='fil'||b==='tl')return 'fil';if(b==='ms'||b==='in')return b==='in'?'id':'ms';if(L.dict[b])return b}return 'en'}
function t(k,v){var d=L.dict[LANG],s=(d&&d[k]!=null)?d[k]:L.dict.en[k];if(s==null){if(window.__i18nMissing)window.__i18nMissing.push(LANG+':'+k);return k}if(v)s=s.replace(/\{(\w+)\}/g,function(m,n){return v[n]!=null?v[n]:m});return s}
var NF=function(n,o){try{return new Intl.NumberFormat(LANG,o).format(n)}catch(e){return String(n)}};
function fmtT(hm){if(!hm)return '';var p=hm.split(':'),d=new Date();d.setHours(+p[0],+p[1],0,0);try{return new Intl.DateTimeFormat(LANG,{hour:'numeric',minute:'2-digit'}).format(d)}catch(e){return hm}}
function fmtDate(s){var d=new Date(s);if(isNaN(d))return s;try{return new Intl.DateTimeFormat(LANG,{dateStyle:'medium',timeStyle:'short'}).format(d)}catch(e){return d.toLocaleString()}}
function fmtDay(s){if(!s)return '…';var d=new Date(s+'T12:00');if(isNaN(d))return s;try{return new Intl.DateTimeFormat(LANG,{month:'short',day:'numeric'}).format(d)}catch(e){return s}}
function fmtMin(m){m=Math.max(0,Math.floor(m));var h=Math.floor(m/60),r=m%60;try{var fh=new Intl.NumberFormat(LANG,{style:'unit',unit:'hour',unitDisplay:'narrow'}),fm=new Intl.NumberFormat(LANG,{style:'unit',unit:'minute',unitDisplay:'narrow'});return h?fh.format(h)+' '+fm.format(r):fm.format(r)}catch(e){return h?h+'h '+r+'m':r+'m'}}
function fmtClock(s){return NF(Math.floor(s/60))+':'+NF(s%60,{minimumIntegerDigits:2})}
var DAYNAMES=[];function dayNames(){DAYNAMES=[];for(var i=0;i<7;i++){var d=new Date(2024,0,1+i);try{DAYNAMES.push(new Intl.DateTimeFormat(LANG,{weekday:'short'}).format(d))}catch(e){DAYNAMES.push(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i])}}}
function graphemes(w){if(HAS.seg){try{return Array.from(new Intl.Segmenter(LANG,{granularity:'grapheme'}).segment(w),function(x){return x.segment})}catch(e){}}
 var m=w.match(/(?:\P{M}(?:\u094D|\u09CD|\u0DCA\u200D?|\u0BCD)?\p{M}*)/gu);/* fallback: base char + combining marks */ return m||Array.from(w)}
function applyStatic(){var info=L.langs[LANG];document.documentElement.lang=info.bcp||LANG;document.documentElement.dir=info.dir;
 $$('[data-tx]').forEach(function(e){e.textContent=t(e.getAttribute('data-tx'))});$$('[data-ih]').forEach(function(e){e.innerHTML=t(e.getAttribute('data-ih'))});$$('[data-ip]').forEach(function(e){e.placeholder=t(e.getAttribute('data-ip'))});
 $$('select.pri').forEach(function(s){var v=s.value;s.innerHTML=['needed','important','urgent'].map(function(k){return '<option value="'+k+'">'+t('p_'+k)+'</option>'}).join('');if(v)s.value=v});
 $$('[data-test]').forEach(function(b){b.textContent=t('test',{p:t('p_'+b.getAttribute('data-test'))})});
 $$('[data-pf]').forEach(function(b){b.textContent=fmtMin(+b.getAttribute('data-pf'))});
 $('#gDaysL').innerHTML=DAYNAMES.map(function(d,i){return '<label class="chip"><input type="checkbox" value="'+i+'" class="gDay">'+esc(d)+'</label>'}).join('');}
var renderers=[];function onLang(f){renderers.push(f)}
function setLang(l,save){LANG=L.dict[l]?l:'en';if(save)S.set('lang',LANG);dayNames();var keep=$$('.gDay:checked').map(function(c){return +c.value});applyStatic();$$('.gDay').forEach(function(c){c.checked=keep.indexOf(+c.value)>=0});renderers.forEach(function(f){f()})}
// ===== tabs
$$('nav button').forEach(function(b){b.onclick=function(){$$('nav button').forEach(function(x){x.classList.toggle('on',x===b)});$$('.tab').forEach(function(s){s.classList.toggle('active',s.id==='tab-'+b.dataset.t)});window.scrollTo(0,0)}});
onLang(function(){var h=new Date().getHours();$('#greet').textContent=t(h<12?'greetM':h<18?'greetA':'greetE')});
// ===== audio
var ac=null;function getAC(){ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended'&&ac.resume)ac.resume();return ac}
function synthChime(){try{var c=getAC(),t0=c.currentTime;[523.25,659.25,783.99].forEach(function(f,i){var o=c.createOscillator(),g=c.createGain(),s=t0+i*.25;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,s);g.gain.linearRampToValueAtTime(.18,s+.05);g.gain.exponentialRampToValueAtTime(.001,s+1.8);o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+2)})}catch(e){}}
// ===== sounds: built-in (sounds/*.mp3, synthesized, CC0) + user sounds in IndexedDB
var SNDS=['soft_chime','bubble_pop','wind_chimes','music_box','kitten_bell','gentle_harp','raindrop','marimba'],SNDK=['needed','important','urgent','gentle'];
var SEL=Object.assign({needed:'soft_chime',important:'soft_chime',urgent:'soft_chime',gentle:'soft_chime'},S.get('sounds',{})),MY=S.get('mysnd',[]),BUF={},DUR={};
function sndName(id){if(id.indexOf('u:')===0){var m=MY.filter(function(x){return 'u:'+x.id===id})[0];return m?m.name:t('sndMissing')}return t('s_'+id)}
function idb(mode,fn){return new Promise(function(res,rej){if(!window.indexedDB)return rej(new Error('noidb'));var r=indexedDB.open('focusplay',1);r.onupgradeneeded=function(){r.result.createObjectStore('snd')};r.onerror=function(){rej(r.error)};r.onsuccess=function(){var db=r.result,tx=db.transaction('snd',mode),q=fn(tx.objectStore('snd'));tx.oncomplete=function(){db.close();res(q&&q.result)};tx.onerror=tx.onabort=function(){db.close();rej(tx.error)}}})}
function decode(ab){var c=getAC();return new Promise(function(res,rej){var p=c.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)})}
function loadBuf(id){if(BUF[id])return Promise.resolve(BUF[id]);var src=id.indexOf('u:')===0?idb('readonly',function(st){return st.get(id.slice(2))}).then(function(b){if(!b)throw new Error('missing');return b.arrayBuffer?b.arrayBuffer():new Response(b).arrayBuffer()}):fetch('sounds/'+id+'.mp3').then(function(r){if(!r.ok)throw new Error(r.status);return r.arrayBuffer()});
 return src.then(decode).then(function(b){BUF[id]=b;DUR[id]=b.duration;return b})}
function playId(id){if(!HAS.audio)return Promise.resolve(0);try{getAC()}catch(e){return Promise.resolve(0)}return loadBuf(id).then(function(b){var c=getAC(),n=c.createBufferSource(),g=c.createGain();g.gain.value=.9;n.buffer=b;n.connect(g);g.connect(c.destination);n.start();window.__lastPlayed=id;return b.duration}).catch(function(){window.__lastPlayed='synth';synthChime();return 2})}
function chime(force,key){if(S.get('rem',{}).snd===false&&force!==true)return;if(!HAS.audio)return;playId(SEL[key||'important']||'soft_chime')}
function chimes(n,force,key){var id=SEL[key||'important']||'soft_chime',d=DUR[id]||2;if(d>2.5)n=1;var gap=Math.max(900,d*1000+150);for(var i=0;i<n;i++)setTimeout(function(){chime(force,key)},i*gap)}
document.addEventListener('pointerdown',function un(){if(HAS.audio&&!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}document.removeEventListener('pointerdown',un)});
// ===== games
var timer,cleanup=function(){},curGame=null;var area=$('#gameArea'),body=$('#gBody');
var sh=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,x=a[i];a[i]=a[j];a[j]=x}return a};
var GLEN={short:120,medium:300,long:600},glen=S.get('glen','medium'),paused=false,sessS=0,GP=function(){return paused};
function playLog(){var p=S.get('playlog',{});return p}
function addPlay(sec){var p=playLog();p[today()]=(p[today()]||0)+sec;var k=Object.keys(p).sort();while(k.length>30)delete p[k.shift()];S.set('playlog',p);sessS+=sec;showSess()}
function showSess(){var el=$('#gSess');if(el)el.textContent=t('sessT',{a:fmtClock(Math.floor(playLog()[today()]||0)),b:fmtClock(Math.floor(sessS))})}
function endGame(msg){clearInterval(timer);cleanup();cleanup=function(){};paused=false;$('#gPause').classList.add('hidden');area.classList.remove('paused');body.innerHTML='<p class="center endmsg">'+esc(msg||t('niceWork'))+'</p><div class="row"><button class="primary" id="gAgain">'+esc(t('playAgain'))+'</button></div>';$('#gAgain').onclick=function(){startGame(curGame)};$('#gTimer').textContent=t('done');chime(true)}
function lvlMsg(n){showToast(t('lvlUp')+' · '+t('level',{n:NF(n)}),1600)}
function startGame(i){var g=games[i];curGame=i;clearInterval(timer);cleanup();cleanup=function(){};paused=false;area.classList.remove('paused');$('#gPause').classList.remove('hidden');$('#gPause').textContent='⏸ '+t('pause');area.classList.remove('hidden');$('#gTitle').textContent=g.e+' '+t('g'+i+'n');var left=GLEN[glen]||300;window.__gLeft=function(){return left};var show=function(){$('#gTimer').textContent='⏱ '+fmtClock(left)};show();timer=setInterval(function(){if(paused)return;left--;addPlay(1);show();if(left<=0)endGame(t('timeUp'))},1000);g.f();if(area.scrollIntoView)area.scrollIntoView({behavior:'smooth'})}
$('#gPause').onclick=function(){paused=!paused;area.classList.toggle('paused',paused);$('#gPause').textContent=paused?'▶ '+t('resume'):'⏸ '+t('pause')};
function renderLen(){$('#gLen').innerHTML='<span>'+esc(t('gameLen'))+'</span>'+['short','medium','long'].map(function(k){return '<button type="button" class="'+(k===glen?'on':'')+'" data-len="'+k+'">'+esc(t('len_'+k))+'</button>'}).join('');$$('#gLen button').forEach(function(b){b.onclick=function(){glen=b.dataset.len;S.set('glen',glen);renderLen();renderGames()}});showSess()}
onLang(renderLen);
var games=[
{e:'🧠',t:120,f:function(){var lv=0,round=function(){lv++;var EM=Array.from('🌸🍃🌙⭐🐢🍓🦋🍀🐝🌈'),np=Math.min(10,4+lv*2);if(lv>1)lvlMsg(lv);var c=sh(EM.slice(0,np).reduce(function(a,x){return a.concat([x,x])},[]));var open=[],found=0,lock=false;body.innerHTML='<div class="mem">'+c.map(function(x,i){return '<button data-i="'+i+'" aria-label="'+esc(t('card'))+'"></button>'}).join('')+'</div>';
 $$('.mem button',body).forEach(function(b){b.onclick=function(){var i=+b.dataset.i;if(lock||b.classList.contains('up')||b.classList.contains('ok'))return;b.textContent=c[i];b.classList.add('up');open.push(b);if(open.length===2){lock=true;var a=open[0],z=open[1];setTimeout(function(){if(c[a.dataset.i]===c[z.dataset.i]){a.className=z.className='ok';found++}else{a.className=z.className='';a.textContent=z.textContent=''}open=[];lock=false;if(found===np)setTimeout(round,500)},650)}}})};round()}},
{e:'🫧',t:90,f:function(){body.innerHTML='<div class="bub" id="bub"></div><p class="center sub">'+esc(t('breatheHint'))+'</p>';var inh=true,b=$('#bub');var step=function(){b.classList.toggle('in',inh);b.textContent=t(inh?'breatheIn':'breatheOut');inh=!inh};setTimeout(step,50);var iv=setInterval(step,4000);cleanup=function(){clearInterval(iv)}}},
{e:'🎯',t:60,f:function(){var score=0,miss=0,to;body.innerHTML='<p class="center">'+t('tapHint')+'</p><button class="target" id="tg"></button><p class="center" id="sc"></p>';var tg=$('#tg'),cols=['#a9c6e8','#f4b6a6','#c9b8e8','#f3d9a4'],green=false,t0=0;var sc=function(){$('#sc').textContent=t('score',{s:NF(score),m:NF(miss)})};sc();
 var next=function(){green=Math.random()<.4;tg.style.background=green?'#7fae98':cols[Math.random()*4|0];tg.textContent=t(green?'tapNow':'notYet');t0=Date.now();to=setTimeout(next,900+Math.random()*900)};
 tg.onclick=function(){if(green){score++;tg.textContent=NF(Date.now()-t0)+' ms ✓';green=false}else miss++;sc()};next();cleanup=function(){clearTimeout(to)}}},
{e:'🔤',t:120,f:function(){var W=sh(t('_words').split('|')),wi=0,sol=0;var round=function(){if(wi>=W.length)return endGame(t('solved',{n:NF(sol)}));var w=W[wi],G=graphemes(w),Lt=sh(G);if(Lt.join('')===w&&G.length>1)Lt=Lt.slice().reverse();var ans=[];
  body.innerHTML='<p class="center sub">'+esc(t('wordOf',{i:NF(wi+1),n:NF(W.length)}))+'</p><div class="ans" id="ans">&nbsp;</div><div class="letters">'+Lt.map(function(c,i){return '<button data-i="'+i+'">'+esc(c)+'</button>'}).join('')+'</div><div class="row"><button class="soft" id="rs">'+esc(t('reset'))+'</button><button class="soft" id="sk">'+esc(t('skip'))+'</button></div>';
  $$('.letters button',body).forEach(function(b){b.onclick=function(){ans.push(Lt[+b.dataset.i]);b.disabled=true;b.style.opacity=.3;$('#ans').textContent=ans.join('');if(ans.length===G.length){if(ans.join('')===w){sol++;$('#ans').textContent='✓ '+w}else $('#ans').textContent='✗ '+w;wi++;setTimeout(round,1000)}}});$('#rs').onclick=round;$('#sk').onclick=function(){wi++;round()}};round()}},
{e:'🧺',t:90,f:function(){var F=['🍎','🍌','🍇','🍓','🍐','🍑'],N=['🌲','🌻','🍁','🌵','🌷','🍄'],items=sh(F.concat(N)),i=0,ok=0;var r=function(){if(i>=items.length){showToast(t('sorted',{a:NF(ok),b:NF(items.length)}),2000);items=sh(items);i=0;ok=0}body.innerHTML='<p class="center sub">'+NF(i+1)+' / '+NF(items.length)+'</p><div class="item">'+items[i]+'</div><div class="sortbins"><button id="bf">'+esc(t('fruit'))+'</button><button id="bn">'+esc(t('nature'))+'</button></div>';var pick=function(f){if((F.indexOf(items[i])>=0)===f)ok++;i++;r()};$('#bf').onclick=function(){pick(true)};$('#bn').onclick=function(){pick(false)}};r()}},
{e:'🔢',f:function(){var lv=0,next=1,N,t0;var round=function(){lv++;if(lv>1)lvlMsg(lv);var n=Math.min(6,2+lv);N=n*n;next=1;t0=Date.now();var nums=sh(Array.from({length:N},function(_,i){return i+1}));
  body.innerHTML='<p class="center sub" id="schH">'+esc(t('schHint',{n:NF(N)}))+'</p><div class="schulte" style="grid-template-columns:repeat('+n+',1fr)">'+nums.map(function(x){return '<button data-n="'+x+'">'+NF(x)+'</button>'}).join('')+'</div>';
  $$('.schulte button',body).forEach(function(b){b.onclick=function(){if(GP())return;if(+b.dataset.n===next){b.classList.add('ok');next++;if(next>N){$('#schH').textContent='✓ '+NF(Math.round((Date.now()-t0)/1000))+' s';setTimeout(round,900)}}else{b.classList.add('no');setTimeout(function(){b.classList.remove('no')},300)}}})};round()}},
{e:'🎵',f:function(){var C=['#f4b6a6','#a9c6e8','#9fd3b5','#f3d9a4'],F=[392,494,587,698],seq=[],inp=0,busy=true,to=[];
  body.innerHTML='<p class="center" id="smM"></p><div class="simon">'+C.map(function(c,i){return '<button data-p="'+i+'" style="background:'+c+'"></button>'}).join('')+'</div><p class="center sub" id="smL"></p>';
  var pads=$$('.simon button',body),beep=function(i){try{var c=getAC(),o=c.createOscillator(),g=c.createGain();o.frequency.value=F[i];g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.35);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.4)}catch(e){}},
  flash=function(i){pads[i].classList.add('lit');beep(i);to.push(setTimeout(function(){pads[i].classList.remove('lit')},280))},
  play=function(){busy=true;inp=0;$('#smM').textContent=t('simWatch');$('#smL').textContent=t('level',{n:NF(seq.length)});var sp=Math.max(320,700-seq.length*35);seq.forEach(function(p,k){to.push(setTimeout(function(){flash(p)},600+k*sp))});to.push(setTimeout(function(){busy=false;$('#smM').textContent=t('simGo')},600+seq.length*sp))},
  grow=function(){seq.push(Math.random()*4|0);play()};
  pads.forEach(function(b){b.onclick=function(){if(busy||GP())return;var p=+b.dataset.p;flash(p);if(p===seq[inp]){inp++;if(inp===seq.length){busy=true;to.push(setTimeout(grow,700))}}else{busy=true;$('#smM').textContent=t('simOops');to.push(setTimeout(play,1100))}}});
  seq=[Math.random()*4|0,Math.random()*4|0];play();cleanup=function(){to.forEach(clearTimeout)}}},
{e:'🔍',f:function(){var P=[['🙂','🙃'],['🌕','🌖'],['🍏','🍎'],['🐱','🐯'],['⭐','🌟'],['🌷','🌹'],['🐟','🐠'],['☁️','⛅'],['🍪','🥠'],['🐻','🐼']],lv=0,found=0;var round=function(){lv=Math.floor(found/3)+1;var n=Math.min(7,3+lv),pr=P[Math.random()*P.length|0],k=Math.random()*n*n|0;
  body.innerHTML='<p class="center sub">'+esc(t('oddHint'))+' · '+esc(t('level',{n:NF(lv)}))+'</p><div class="odd" style="grid-template-columns:repeat('+n+',1fr)">'+Array.from({length:n*n},function(_,i){return '<button data-k="'+(i===k?1:0)+'">'+(i===k?pr[1]:pr[0])+'</button>'}).join('')+'</div>';
  $$('.odd button',body).forEach(function(b){b.onclick=function(){if(GP())return;if(b.dataset.k==='1'){b.classList.add('ok');var before=Math.floor(found/3);found++;if(Math.floor(found/3)>before)lvlMsg(Math.floor(found/3)+1);setTimeout(round,450)}else{b.classList.add('no');setTimeout(function(){b.classList.remove('no')},300)}}})};round()}},
{e:'✏️',f:function(){var lv=0;var round=function(){lv++;if(lv>1)lvlMsg(lv);var k=[5,6,7,8,9,10,12][Math.min(lv-1,6)],star=lv%2===1,pts=[],m=star?k*2:k,rot=Math.random()*Math.PI;for(var i=0;i<m;i++){var a=rot+i/m*Math.PI*2,r=star&&i%2?22:42;pts.push([50+r*Math.cos(a),50+r*Math.sin(a)])}
  var nx=0,hue=Math.random()*360|0;body.innerHTML='<p class="center sub">'+esc(t('dotHint'))+'</p><svg class="dots" viewBox="0 0 100 100"><polyline id="dl" fill="none" stroke="hsl('+hue+',55%,60%)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" points=""/><polygon id="dfill" fill="hsla('+hue+',60%,75%,0)" points=""/>'+pts.map(function(p,i){return '<g data-i="'+i+'"><circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.2" fill="var(--card)" stroke="var(--g)" stroke-width=".8"/><text x="'+p[0].toFixed(1)+'" y="'+(p[1]+1.6).toFixed(1)+'" font-size="4.4" text-anchor="middle" fill="var(--ink)">'+NF(i+1)+'</text></g>'}).join('')+'</svg>';
  var line=[],dl=$('#dl');$$('.dots g',body).forEach(function(g){g.onclick=function(){if(GP())return;var i=+g.getAttribute('data-i');if(i!==nx){g.classList.add('no');setTimeout(function(){g.classList.remove('no')},300);return}g.classList.add('ok');line.push(pts[i].join(','));nx++;if(nx===m){line.push(pts[0].join(','));var f=$('#dfill');f.setAttribute('points',line.join(' '));f.style.transition='fill 1s';setTimeout(function(){f.setAttribute('fill','hsla('+hue+',60%,75%,.6)')},30);setTimeout(round,1800)}dl.setAttribute('points',line.join(' '))}})};round()}},
{e:'🧩',f:function(){var lv=0;var gen=function(n){var bh=n===4?2:2,bw=n===4?2:3,base=[];for(var r=0;r<n;r++){base.push([]);for(var c=0;c<n;c++)base[r].push(((r%bh)*bw+Math.floor(r/bh)+c)%n+1)}
   var perm=sh(Array.from({length:n},function(_,i){return i+1}));base=base.map(function(row){return row.map(function(v){return perm[v-1]})});
   var bands=sh(Array.from({length:n/bh},function(_,i){return i})),rows=[];bands.forEach(function(b){sh(Array.from({length:bh},function(_,i){return b*bh+i})).forEach(function(r){rows.push(base[r])})});return rows};
  var round=function(){lv++;if(lv>1)lvlMsg(lv);var n=lv<=2?4:6,sol=gen(n),holes=n===4?5+lv*2:10+lv*2,cells=[];sol.forEach(function(row,r){row.forEach(function(v,c){cells.push({r:r,c:c,v:v,g:true,u:0})})});sh(cells).slice(0,Math.min(holes,n*n-n)).forEach(function(x){x.g=false});var sel=null;
   var draw=function(){body.innerHTML='<p class="center sub">'+esc(t('sudHint',{n:NF(n)}))+'</p><div class="sudoku s'+n+'" style="grid-template-columns:repeat('+n+',1fr)">'+cells.map(function(x,i){var bw=n===4?2:3,bh=2;return '<button data-i="'+i+'" class="'+(x.g?'giv':'')+(sel===i?' sel':'')+(x.c%bw===bw-1&&x.c<n-1?' br':'')+(x.r%bh===bh-1&&x.r<n-1?' bb':'')+'" style="order:'+(x.r*n+x.c)+'">'+(x.g?NF(x.v):x.u?NF(x.u):'')+'</button>'}).join('')+'</div><div class="pad">'+Array.from({length:n},function(_,i){return '<button data-v="'+(i+1)+'">'+NF(i+1)+'</button>'}).join('')+'<button data-v="0">⌫</button></div>';
    $$('.sudoku button',body).forEach(function(b){b.onclick=function(){if(GP())return;var x=cells[+b.dataset.i];if(x.g)return;sel=+b.dataset.i;draw()}});
    $$('.pad button',body).forEach(function(b){b.onclick=function(){if(GP()||sel==null)return;cells[sel].u=+b.dataset.v;var ok=cells.every(function(x){return x.g||x.u===x.v});draw();if(ok){showToast('✓',900);setTimeout(round,900)}}})};draw()};round()}},
{e:'🧱',f:function(){var lv=0;var round=function(){lv++;if(lv>1)lvlMsg(lv);var n=lv<=2?3:4,N=n*n,b=Array.from({length:N},function(_,i){return (i+1)%N}),e=N-1,moves=0,last=-1;
  var nb=function(i){var r=[];if(i%n)r.push(i-1);if(i%n<n-1)r.push(i+1);if(i>=n)r.push(i-n);if(i<N-n)r.push(i+n);return r};
  for(var k=0;k<10+lv*12;k++){var o=nb(e).filter(function(x){return x!==last}),m=o[Math.random()*o.length|0];b[e]=b[m];b[m]=0;last=e;e=m}
  var solved=function(){for(var i=0;i<N-1;i++)if(b[i]!==i+1)return false;return true};if(solved())return round();
  var draw=function(){body.innerHTML='<p class="center sub">'+esc(t('slideHint',{n:NF(N-1)}))+' · '+esc(t('moves',{n:NF(moves)}))+'</p><div class="slide" style="grid-template-columns:repeat('+n+',1fr)">'+b.map(function(v,i){return v?'<button data-i="'+i+'">'+NF(v)+'</button>':'<span></span>'}).join('')+'</div>';
   $$('.slide button',body).forEach(function(x){x.onclick=function(){if(GP())return;var i=+x.dataset.i;if(nb(i).indexOf(e)<0)return;b[e]=b[i];b[i]=0;e=i;moves++;draw();if(solved()){showToast('✓ '+t('moves',{n:NF(moves)}),1200);setTimeout(round,1200)}}})};draw()};round()}}];
function renderGames(){$('#gameList').innerHTML=games.map(function(g,i){return '<button data-g="'+i+'"><b>'+g.e+'</b>'+esc(t('g'+i+'n'))+'<small>'+esc(t('g'+i+'d'))+' · '+esc(fmtMin((GLEN[glen]||300)/60))+'</small></button>'}).join('');$$('#gameList button').forEach(function(b){b.onclick=function(){startGame(+b.dataset.g)}});if(curGame!=null&&!area.classList.contains('hidden'))$('#gTitle').textContent=games[curGame].e+' '+t('g'+curGame+'n')}
onLang(renderGames);
var lastG=-1;$('#surprise').onclick=function(){var i;do{i=Math.random()*games.length|0}while(i===lastG);lastG=i;startGame(i)};
$('#gExit').onclick=function(){clearInterval(timer);cleanup();paused=false;area.classList.remove('paused');area.classList.add('hidden');curGame=null};
// ===== wants
var ld=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())},today=function(){return ld(new Date())};
function streak(){var days=S.get('doneDays',[]),n=0,d=new Date();if(days.indexOf(today())<0)d.setDate(d.getDate()-1);while(days.indexOf(ld(d))>=0){n++;d.setDate(d.getDate()-1)}return n}
function renderW(){var w=S.get('wants',[]);$('#wList').innerHTML=w.length?w.map(function(x,i){return '<li class="'+(x.done?'done':'')+'"><button class="ck" data-i="'+i+'" aria-label="'+esc(t('done'))+'">'+(x.done?'✓':'')+'</button><span>'+esc(x.t)+'</span><button class="del" data-d="'+i+'" aria-label="'+esc(t('del'))+'">✕</button></li>'}).join(''):'<p class="sub">'+esc(t('wantEmpty'))+'</p>';
 var dn=w.filter(function(x){return x.done&&x.at===today()}).length;$('#streak').textContent=t('streak',{s:NF(streak()),d:NF(dn)});
 $$('#wList .ck').forEach(function(b){b.onclick=function(){var w=S.get('wants',[]),x=w[b.dataset.i];x.done=!x.done;x.at=x.done?today():null;S.set('wants',w);if(x.done){var d=S.get('doneDays',[]);if(d.indexOf(today())<0)d.push(today());S.set('doneDays',d.slice(-400));chime(true)}renderW()}});
 $$('#wList .del').forEach(function(b){b.onclick=function(){var w=S.get('wants',[]);w.splice(b.dataset.d,1);S.set('wants',w);renderW()}})}
$('#wForm').onsubmit=function(e){e.preventDefault();var v=$('#wIn').value.trim();if(!v)return;var w=S.get('wants',[]);w.unshift({t:v,done:false});S.set('wants',w);$('#wIn').value='';renderW()};
$('#wClear').onclick=function(){S.set('wants',S.get('wants',[]).filter(function(x){return !x.done}));renderW()};onLang(renderW);
// ===== routine
var R=S.get('routine',null);if(!R){R={sleep:8,ess:2,days:[0,1,2,3,4,5,6].map(function(i){return{on:i<5,s:'09:00',e:'17:00'}})}}if(R.ess==null)R.ess=2;
var mins=function(s){var p=s.split(':');return +p[0]*60+ +p[1]};
function renderR(){$('#sleep').value=R.sleep;$('#ess').value=R.ess;$('#days').innerHTML=R.days.map(function(d,i){return '<div class="day"><div class="row"><b>'+esc(DAYNAMES[i])+'</b><input type="time" data-i="'+i+'" data-k="s" value="'+d.s+'" '+(d.on?'':'disabled')+' aria-label="'+esc(t('lWork'))+' 1"><input type="time" data-i="'+i+'" data-k="e" value="'+d.e+'" '+(d.on?'':'disabled')+' aria-label="'+esc(t('lWork'))+' 2"><label class="off"><input type="checkbox" data-i="'+i+'" data-k="on" '+(d.on?'checked':'')+'>'+esc(t('work'))+'</label></div></div>'}).join('');
 $$('#days input').forEach(function(x){x.onchange=function(){var d=R.days[x.dataset.i];if(x.dataset.k==='on')d.on=x.checked;else d[x.dataset.k]=x.value;S.set('routine',R);renderR()}});bars()}
function bars(){var ES=+R.ess||0;$('#bars').innerHTML=R.days.map(function(d,i){var w=0;if(d.on&&d.s&&d.e){w=(mins(d.e)-mins(d.s))/60;if(w<0)w+=24}var sl=Math.min(+R.sleep||0,24),me=Math.max(0,24-sl-w-ES),p=function(x){return (x/24*100).toFixed(1)+'%'};
 return '<div class="blabel"><b>'+esc(DAYNAMES[i])+'</b><span>'+esc(t('meTime',{h:NF(me,{maximumFractionDigits:1,minimumFractionDigits:1})}))+'</span></div><div class="bar"><div class="sl" style="width:'+p(sl)+'"></div><div class="wk" style="width:'+p(Math.min(w,24-sl))+'"></div><div class="es" style="width:'+p(Math.min(ES,Math.max(0,24-sl-w)))+'"></div><div class="me" style="width:'+p(me)+'"></div></div>'}).join('')}
$('#sleep').onchange=function(){R.sleep=Math.max(0,Math.min(16,+$('#sleep').value||0));S.set('routine',R);renderR()};
$('#ess').onchange=function(){R.ess=Math.max(0,Math.min(12,+$('#ess').value||0));S.set('routine',R);renderR()};onLang(renderR);
// ===== reminders
var M=Object.assign({brOn:true,brMin:50,brPri:'needed',wdOn:true,wdTime:'21:30',wdPri:'important',snd:true,wdDay:''},S.get('rem',{}));M.lastBr=Date.now();
function hmNow(){var d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())}
function save(){S.set('rem',M);nextInfo()}
function initRem(){['brOn','wdOn','snd'].forEach(function(k){$('#'+k).checked=M[k];$('#'+k).onchange=function(){M[k]=$('#'+k).checked;if(k==='brOn')M.lastBr=Date.now();save()}});
 ['brPri','wdPri','wdTime'].forEach(function(k){$('#'+k).value=M[k];$('#'+k).onchange=function(){M[k]=$('#'+k).value;save()}});$('#brMin').value=M.brMin;$('#brMin').onchange=function(){M.brMin=Math.max(5,+$('#brMin').value||50);M.lastBr=Date.now();save()}}
function permInfo(){if(!HAS.notif){$('#permStat').textContent=t('permNo');$('#perm').disabled=true;return}var p=Notification.permission;$('#permStat').textContent=t('permSt',{p:t('perm_'+p)})+(p==='granted'?' ✓':t('permFb'))}
$('#perm').onclick=function(){if(!HAS.notif)return permInfo();try{var r=Notification.requestPermission(function(){permInfo()});if(r&&r.then)r.then(permInfo,permInfo)}catch(e){permInfo()}};
function notify(title,msg,o){if(!HAS.notif||Notification.permission!=='granted')return;var opt=Object.assign({body:msg,icon:'icon-192.png',badge:'icon-192.png',lang:LANG,dir:L.langs[LANG].dir},o);
 var fallback=function(){try{var n=new Notification(title,opt)}catch(e){}};if(HAS.sw&&navigator.serviceWorker.getRegistration){navigator.serviceWorker.getRegistration().then(function(r){if(r&&r.showNotification)r.showNotification(title,opt).catch(fallback);else fallback()},fallback)}else fallback()}
var toastT,urgLoop,urgCur=null;
function showToast(m,ms){var el=$('#toast');$('#toastMsg').textContent=m;el.classList.remove('hidden');el.style.animation='none';void el.offsetHeight;el.style.animation='';clearTimeout(toastT);toastT=setTimeout(function(){el.classList.add('hidden')},ms||5000)}
function remind(title,msg,pri,src){pri=pri||'needed';var sk=src==='gentle'?'gentle':pri;
 if(pri==='needed'){chimes(1,false,sk);showToast(title+' — '+msg,5000);if(document.visibilityState!=='visible')notify(title,msg,{tag:'fp-n',silent:true})}
 else if(pri==='important'){chimes(2,false,sk);$('#cardT').textContent=title;$('#cardM').textContent=msg;$('#card').classList.remove('hidden');notify(title,msg,{tag:'fp-i'})}
 else{urgCur={title:title,msg:msg,src:src};$('#urgT').textContent=title;$('#urgM').textContent=msg;$('#urgent').classList.remove('hidden');clearInterval(urgLoop);chimes(2,true,sk);urgLoop=setInterval(function(){chimes(2,true,sk)},4000);vibrate([400,200,400,200,400]);notify('⚠ '+title,msg,{tag:'fp-u',requireInteraction:true,vibrate:[400,200,400,200,400],renotify:true})}}
$('#toast').onclick=function(){$('#toast').classList.add('hidden')};$('#cardOk').onclick=function(){$('#card').classList.add('hidden')};
function ackUrg(){clearInterval(urgLoop);vibrate(0);$('#urgent').classList.add('hidden');if(HAS.sw&&navigator.serviceWorker.getRegistration)navigator.serviceWorker.getRegistration().then(function(r){if(r&&r.getNotifications)r.getNotifications({tag:'fp-u'}).then(function(l){l.forEach(function(n){n.close()})})}).catch(function(){})}
$('#urgDone').onclick=function(){ackUrg();urgCur=null};
$('#urgSnooze').onclick=function(){ackUrg();var c=urgCur;urgCur=null;if(c)setTimeout(function(){remind(c.title,c.msg,'urgent',c.src)},5*6e4);showToast(t('snoozed'),3000)};
$$('[data-test]').forEach(function(b){b.onclick=function(){chime(true);var p=b.getAttribute('data-test');if(p==='urgent')remind(t('testUT'),t('testUM'),p);else if(p==='important')remind(t('brkT'),t('testM'),p);else remind(t('testNT'),t('testM'),p)}});
// custom task reminders
var CR=S.get('custom',[]);
$('#cMode').onchange=function(){var e=$('#cMode').value==='every';$('#cTimeL').classList.toggle('hidden',e);$('#cEveryL').classList.toggle('hidden',!e)};
$('#cForm').onsubmit=function(e){e.preventDefault();var n=$('#cName').value.trim();if(!n)return;CR.push({id:Date.now(),name:n,mode:$('#cMode').value,time:$('#cTime').value||'12:00',every:Math.max(1,+$('#cEvery').value||60),pri:$('#cPri').value,on:true,last:Date.now(),lastDay:hmNow()>=($('#cTime').value||'12:00')?today():''});S.set('custom',CR);$('#cName').value='';renderC()};
function renderC(){$('#cList').innerHTML=CR.length?CR.map(function(r,i){return '<li class="rm lv-'+r.pri+'"><span>'+esc(r.name)+'<small>'+esc((r.mode==='time'?t('dailyAt',{t:fmtT(r.time)}):t('everyN',{n:NF(r.every)}))+' · '+t('p_'+r.pri)+(r.on?'':' · '+t('paused')))+'</small></span><select data-p="'+i+'" class="pri" aria-label="'+esc(t('priority'))+'"></select><button class="del" data-o="'+i+'" aria-label="'+esc(t('paused'))+'">'+(r.on?'⏸':'▶')+'</button><button class="del" data-d="'+i+'" aria-label="'+esc(t('del'))+'">✕</button></li>'}).join(''):'<p class="sub">'+esc(t('taskEmpty'))+'</p>';
 $$('#cList [data-p]').forEach(function(s){s.innerHTML=['needed','important','urgent'].map(function(k){return '<option value="'+k+'">'+esc(t('p_'+k))+'</option>'}).join('');s.value=CR[s.dataset.p].pri;s.onchange=function(){CR[s.dataset.p].pri=s.value;S.set('custom',CR);renderC()}});
 $$('#cList [data-o]').forEach(function(b){b.onclick=function(){var r=CR[b.dataset.o];r.on=!r.on;r.last=Date.now();S.set('custom',CR);renderC()}});
 $$('#cList [data-d]').forEach(function(b){b.onclick=function(){CR.splice(b.dataset.d,1);S.set('custom',CR);renderC()}})}
onLang(renderC);
function nextInfo(){var p=[];if(M.brOn)p.push(t('nextBr',{n:NF(Math.max(0,Math.ceil((M.lastBr+M.brMin*6e4-Date.now())/6e4)))}));if(M.wdOn)p.push(t('wdAt',{t:fmtT(M.wdTime)}));$('#nextR').textContent=p.join(' · ')||t('remOff')}
onLang(nextInfo);onLang(permInfo);
function isWork(){var d=R.days[(new Date().getDay()+6)%7];if(!d.on)return false;var n=mins(hmNow()),s=mins(d.s),e=mins(d.e);return s<=e?n>=s&&n<e:n>=s||n<e}
CR.forEach(function(r){if(r.mode==='time'&&!r.lastDay&&hmNow()>=r.time)r.lastDay=today()});if(!M.wdDay&&hmNow()>=M.wdTime)M.wdDay=today();
setInterval(function(){var now=Date.now(),hm=hmNow();
 if(M.brOn&&now-M.lastBr>=M.brMin*6e4){M.lastBr=now;if(isWork())remind(t('brkT'),t('brkM',{n:NF(M.brMin)}),M.brPri)}
 if(M.wdOn&&hm>=M.wdTime&&M.wdDay!==today()){M.wdDay=today();remind(t('wdT'),t('wdM'),M.wdPri)}
 var ch=false;CR.forEach(function(r){if(!r.on)return;if(r.mode==='every'&&now-r.last>=r.every*6e4){r.last=now;ch=true;remind(r.name,t('repMsg'),r.pri)}else if(r.mode==='time'&&hm>=r.time&&r.lastDay!==today()){r.lastDay=today();ch=true;remind(r.name,t('schedMsg',{t:fmtT(r.time)}),r.pri)}});if(ch)S.set('custom',CR);save()},15000);
// ===== themes
var PAL={sage:{bg:'#f6f3ee',card:'#ffffff',ink:'#3d4a4a',mute:'#7c8786',g:'#8fb9a8',soft:'#eef1ef',field:'#fbfaf8',line:'#e6e1da',nav:'rgba(255,255,255,.94)'},
ocean:{bg:'#eef4f8',card:'#ffffff',ink:'#2f4356',mute:'#74889a',g:'#6fa3c8',soft:'#e5eef5',field:'#f7fafc',line:'#d8e4ee',nav:'rgba(255,255,255,.94)'},
sunset:{bg:'#fbf1ea',card:'#ffffff',ink:'#5a3f3a',mute:'#98817a',g:'#e7997e',soft:'#f7e9e1',field:'#fdf8f5',line:'#efdcd1',nav:'rgba(255,255,255,.94)'},
lavender:{bg:'#f4f1fa',card:'#ffffff',ink:'#443d56',mute:'#878099',g:'#a693d1',soft:'#ece7f6',field:'#faf9fd',line:'#e1daf0',nav:'rgba(255,255,255,.94)'},
forest:{bg:'#eff3ec',card:'#ffffff',ink:'#2f3f2f',mute:'#778773',g:'#6f9a6a',soft:'#e4ece1',field:'#f8faf6',line:'#d6e1d2',nav:'rgba(255,255,255,.94)'},
dark:{bg:'#1c2023',card:'#262b2f',ink:'#e6ebe8',mute:'#9aa3a0',g:'#7fb3a0',soft:'#30363a',field:'#2c3135',line:'#3a4145',nav:'rgba(38,43,47,.94)'}};
var TH=S.get('theme',{p:'sage',accent:''});
function mix(hex,f,to){var n=parseInt(hex.slice(1),16),m=to?parseInt(to.slice(1),16):0;return '#'+[16,8,0].map(function(s){var a=(n>>s)&255,b=(m>>s)&255;return Math.round(a*(1-f)+b*f).toString(16).padStart(2,'0')}).join('')}
function applyTheme(){var p=PAL[TH.p]||PAL.sage,r=document.documentElement.style;Object.keys(p).forEach(function(k){r.setProperty('--'+k,p[k])});var acc=TH.accent||p.g;r.setProperty('--g',acc);r.setProperty('--gi',TH.p==='dark'?acc:mix(acc,.28));r.setProperty('--gsoft',mix(acc,.82,p.card));var m=$('meta[name=theme-color]');if(m)m.content=acc;$('#accent').value=acc;renderPal()}
function renderPal(){$('#pal').innerHTML=Object.keys(PAL).map(function(k){var v=PAL[k];return '<button data-p="'+k+'" class="'+(k===TH.p?'on':'')+'" style="background:'+v.bg+';color:'+v.ink+'"><span class="sw"><i style="background:'+v.g+'"></i><i style="background:'+v.card+';border:1px solid '+v.line+'"></i><i style="background:'+v.ink+'"></i></span>'+esc(t('th_'+k))+'</button>'}).join('');
 $$('#pal button').forEach(function(b){b.onclick=function(){TH.p=b.dataset.p;TH.accent='';S.set('theme',TH);applyTheme()}})}
$('#accent').oninput=function(){TH.accent=$('#accent').value;S.set('theme',TH);applyTheme()};$('#accReset').onclick=function(){TH.accent='';S.set('theme',TH);applyTheme()};onLang(renderPal);
// ===== suggestion box
var rating=0;function stars(){$('#stars').innerHTML=[1,2,3,4,5].map(function(n){return '<button type="button" data-s="'+n+'" class="'+(n<=rating?'on':'')+'" aria-label="'+n+'/5">★</button>'}).join('');$$('#stars button').forEach(function(b){b.onclick=function(){rating=rating===+b.dataset.s?0:+b.dataset.s;stars()}})}stars();
var STK={Upgrade:'stUp',Downgrade:'stDown',Improvement:'stImp',Bug:'stBug'};
function saveSug(){var v=$('#sText').value.trim();if(!v){if($('#sText').reportValidity)$('#sText').reportValidity();return null}var s={t:v,type:$('#sType').value,rating:rating,at:new Date().toISOString(),lang:LANG,sent:false};var Ls=S.get('sugs',[]);Ls.unshift(s);S.set('sugs',Ls);$('#sText').value='';rating=0;stars();renderS();return s}
function mail(s){location.href='mailto:'+SUPPORT_EMAIL+'?subject='+encodeURIComponent('FocusPlay '+s.type+' suggestion')+'&body='+encodeURIComponent('Type: '+s.type+'\nRating: '+(s.rating?s.rating+'/5':'-')+'\nLanguage: '+(s.lang||LANG)+'\nDate: '+s.at+'\n\n'+s.t)}
function markSent(i){var Ls=S.get('sugs',[]);if(Ls[i]){Ls[i].sent=true;S.set('sugs',Ls);renderS()}}
$('#sForm').onsubmit=function(e){e.preventDefault();if(saveSug())showToast(t('sugSaved'),3000)};
$('#sSend').onclick=function(){var s=saveSug();if(s){markSent(0);mail(s)}};
function renderS(){var Ls=S.get('sugs',[]);$('#sList').innerHTML=Ls.length?Ls.map(function(s,i){return '<li><span><b>'+esc(t(STK[s.type]||'stImp'))+'</b>'+(s.rating?' · '+'★'.repeat(s.rating):'')+'<br>'+esc(s.t)+'<small>'+esc(fmtDate(s.at))+(s.sent?' · '+esc(t('sent')):'')+'</small></span><button class="del" data-m="'+i+'" aria-label="'+esc(t('saveSend'))+'">✉️</button><button class="del" data-x="'+i+'" aria-label="'+esc(t('del'))+'">✕</button></li>'}).join(''):'<p class="sub">'+esc(t('sugEmpty'))+'</p>';
 $$('#sList [data-m]').forEach(function(b){b.onclick=function(){var s=S.get('sugs',[])[b.dataset.m];markSent(+b.dataset.m);mail(s)}});
 $$('#sList [data-x]').forEach(function(b){b.onclick=function(){var Ls=S.get('sugs',[]);Ls.splice(b.dataset.x,1);S.set('sugs',Ls);renderS()}})}
onLang(renderS);
// ===== Gentle nudges
var PRESETS=[['water','💧',60],['stretch','🙆',45],['eyes','👀',20],['posture','🪑',30],['breath','🌬️',90],['phone','📵',120]];
var G=S.get('gentle',null);
if(!G){G=PRESETS.map(function(p){return{id:p[0],e:p[1],name:'',on:p[0]==='water'||p[0]==='eyes',mode:'interval',every:p[2],times:['10:00','15:00'],repeat:'always',days:[0,1,2,3,4],from:'',to:'',ah:true,ahS:'08:00',ahE:'21:00',pri:'needed',last:Date.now(),fired:{}}});S.set('gentle',G)}
var isPreset=function(id){return PRESETS.some(function(p){return p[0]===id})};
// migrate: preset names stored as English text before i18n -> use translated label
G.forEach(function(g){g.last=Date.now();g.fired=g.fired||{};if(isPreset(g.id)&&g.name&&!g.custom)g.name=''});
var gName=function(g){return g.name||(isPreset(g.id)?t('pr_'+g.id):'')};
var saveG=function(){S.set('gentle',G)},editId=null;
function gDesc(g){var m=g.mode==='interval'?t('everyN',{n:NF(g.every)}):t('at',{t:g.times.map(fmtT).join(', ')||'—'});var r=g.repeat==='always'?t('always'):g.repeat==='weekdays'?g.days.map(function(d){return DAYNAMES[d]}).join(' '):(fmtDay(g.from)+' → '+fmtDay(g.to));return m+' · '+r+(g.ah?' · '+fmtT(g.ahS)+'–'+fmtT(g.ahE):'')+' · '+t('p_'+g.pri)}
function renderG(){$('#gList').innerHTML=G.map(function(g){return '<li class="gn lv-'+g.pri+'" data-e="'+g.id+'"><span class="em">'+(g.e||'🌱')+'</span><span>'+esc(gName(g))+'<small>'+esc(gDesc(g))+'</small></span><input type="checkbox" data-t="'+g.id+'" '+(g.on?'checked':'')+' aria-label="'+esc(gName(g))+'"></li>'}).join('');
 $$('#gList [data-t]').forEach(function(c){c.onclick=function(e){e.stopPropagation()};c.onchange=function(){var g=G.filter(function(x){return x.id===c.dataset.t})[0];g.on=c.checked;g.last=Date.now();saveG()}});
 $$('#gList li').forEach(function(l){l.onclick=function(){openG(l.dataset.e)}});if(editId!==undefined&&!$('#gEdit').classList.contains('hidden'))$('#gEdT').textContent=t(editId?'editNudge':'newNudgeT')}
function timeRow(v){return '<div class="row"><input type="time" value="'+v+'"><button class="del" type="button" aria-label="'+esc(t('del'))+'">✕</button></div>'}
$('#gTimes').addEventListener('click',function(e){if(e.target.classList.contains('del'))e.target.parentNode.remove()});
function gVis(){$('#gEvL').classList.toggle('hidden',$('#gMode').value!=='interval');$('#gTimesL').classList.toggle('hidden',$('#gMode').value!=='times');$('#gDaysL').classList.toggle('hidden',$('#gRep').value!=='weekdays');$('#gRangeL').classList.toggle('hidden',$('#gRep').value!=='range');$('#gAhL').classList.toggle('hidden',!$('#gAh').checked)}
['#gMode','#gRep','#gAh'].forEach(function(s){$(s).onchange=gVis});
function openG(id){editId=id;var g=G.filter(function(x){return x.id===id})[0]||{e:'🌱',name:'',mode:'interval',every:30,times:['12:00'],repeat:'always',days:[0,1,2,3,4],from:today(),to:today(),ah:false,ahS:'08:00',ahE:'21:00',pri:'needed'};
 $('#gEdT').textContent=t(id?'editNudge':'newNudgeT');$('#gName').value=gName(g);$('#gMode').value=g.mode;$('#gEvery').value=g.every;$('#gTimes').innerHTML=g.times.map(timeRow).join('');$('#gRep').value=g.repeat;$$('.gDay').forEach(function(c){c.checked=g.days.indexOf(+c.value)>=0});$('#gFrom').value=g.from;$('#gTo').value=g.to;$('#gAh').checked=g.ah;$('#gAhS').value=g.ahS;$('#gAhE').value=g.ahE;$('#gPri').value=g.pri;$('#gDel').classList.toggle('hidden',!id||isPreset(id));gVis();$('#gEdit').classList.remove('hidden');if($('#gEdit').scrollIntoView)$('#gEdit').scrollIntoView({behavior:'smooth'})}
function nextT(){var v=$$('#gTimes input').map(function(i){return i.value}).filter(Boolean),m;if(v.length){m=(mins(v[v.length-1])+60)%1440}else{var d=new Date();m=(Math.ceil((d.getHours()*60+d.getMinutes())/30)*30)%1440}return pad(m/60|0)+':'+pad(m%60)}
$('#gNew').onclick=function(){openG(null)};$('#gAddT').onclick=function(){$('#gTimes').insertAdjacentHTML('beforeend',timeRow(nextT()))};$('#gCancel').onclick=function(){$('#gEdit').classList.add('hidden')};
$('#gSave').onclick=function(){var n=$('#gName').value.trim();if(!n){$('#gName').focus();return}var g=G.filter(function(x){return x.id===editId})[0];if(!g){g={id:'u'+Date.now(),e:'🌱',on:true,fired:{}};G.push(g)}
 var custom=!isPreset(g.id)||n!==t('pr_'+g.id);Object.assign(g,{name:custom?n:'',custom:custom&&isPreset(g.id),mode:$('#gMode').value,every:Math.max(1,+$('#gEvery').value||30),times:$$('#gTimes input').map(function(i){return i.value}).filter(Boolean).sort(),repeat:$('#gRep').value,days:$$('.gDay:checked').map(function(c){return +c.value}),from:$('#gFrom').value,to:$('#gTo').value,ah:$('#gAh').checked,ahS:$('#gAhS').value||'08:00',ahE:$('#gAhE').value||'21:00',pri:$('#gPri').value,last:Date.now()});
 saveG();renderG();$('#gEdit').classList.add('hidden');showToast(t('nudgeSaved'),3000)};
$('#gDel').onclick=function(){G=G.filter(function(x){return x.id!==editId});saveG();renderG();$('#gEdit').classList.add('hidden')};
function gActive(g){var d=new Date(),td=today(),hm=hmNow();if(g.repeat==='weekdays'&&g.days.indexOf((d.getDay()+6)%7)<0)return false;if(g.repeat==='range'&&((g.from&&td<g.from)||(g.to&&td>g.to)))return false;if(g.ah&&(g.ahS<=g.ahE?(hm<g.ahS||hm>=g.ahE):(hm<g.ahS&&hm>=g.ahE)))return false;return true}
G.forEach(function(g){g.times.forEach(function(tm){if(hmNow()>=tm&&!g.fired[tm])g.fired[tm]=today()})});saveG();
function fireG(g){remind((g.e||'🌱')+' '+gName(g),g.id==='water'?t('waterMsg',{n:NF(water().n),g:NF(water().goal)}):t('gentleMsg'),g.pri,'gentle')}
setInterval(function(){var now=Date.now(),hm=hmNow(),ch=false;G.forEach(function(g){if(!g.on)return;if(g.mode==='interval'){if(now-g.last>=g.every*6e4){g.last=now;ch=true;if(gActive(g))fireG(g)}}else g.times.forEach(function(tm){if(hm>=tm&&g.fired[tm]!==today()){g.fired[tm]=today();ch=true;if(gActive(g))fireG(g)}})});if(ch)saveG()},15000);
onLang(renderG);
// water
function water(){var w=S.get('water',{goal:8,log:{}});return{goal:w.goal,n:w.log[today()]||0,w:w}}
function renderWater(){var x=water();$('#wCount').textContent=NF(x.n)+' / '+NF(x.goal)+(x.n>=x.goal?' 🎉':'');$('#glasses').textContent='💧'.repeat(Math.min(x.n,x.goal))+'○'.repeat(Math.max(0,x.goal-x.n))+(x.n>x.goal?' +'+NF(x.n-x.goal):'');$('#wGoal').value=x.goal}
function addW(d){var w=water().w;w.log[today()]=Math.max(0,(w.log[today()]||0)+d);S.set('water',w);renderWater();if(d>0&&w.log[today()]===w.goal){chime(true);showToast(t('waterGoal'),3000)}}
$('#wPlus').onclick=function(){addW(1)};$('#wMinus').onclick=function(){addW(-1)};$('#wGoal').onchange=function(){var w=water().w;w.goal=Math.max(1,Math.min(20,+$('#wGoal').value||8));S.set('water',w);renderWater()};onLang(renderWater);
// ===== in-app usage (on-device only: time this app is visible)
var U=Object.assign({on:true,lim:30,log:{},nudged:''},S.get('usage',{})),sess=0,lastTick=Date.now(),pfEnd=0,pfIv;
$('#uOn').checked=U.on;$('#uLim').value=U.lim;$('#uOn').onchange=function(){U.on=$('#uOn').checked;S.set('usage',U)};$('#uLim').onchange=function(){U.lim=Math.max(1,+$('#uLim').value||30);U.nudged='';S.set('usage',U)};
function showU(){$('#uSess').textContent=fmtMin(sess/60);$('#uDay').textContent=fmtMin((U.log[today()]||0)/60)}
function tickU(){var now=Date.now(),dt=Math.min(5,(now-lastTick)/1000);lastTick=now;if(document.visibilityState!=='visible'||pfEnd)return;sess+=dt;U.log[today()]=(U.log[today()]||0)+dt;showU();
 if(U.on&&U.log[today()]>=U.lim*60&&U.nudged!==today()){U.nudged=today();remind(t('paT'),t('paM',{t:fmtMin(U.log[today()]/60)}),'needed')}}
setInterval(tickU,1000);setInterval(function(){var k=Object.keys(U.log).sort();while(k.length>60)delete U.log[k.shift()];S.set('usage',U)},10000);
document.addEventListener('visibilitychange',function(){lastTick=Date.now();S.set('usage',U)});onLang(showU);
function pfStop(done){clearInterval(pfIv);pfEnd=0;$('#pfree').classList.add('hidden');if(done){chimes(2,true);remind(t('pfDoneT'),t('pfDoneM'),'important')}}
$$('[data-pf]').forEach(function(b){b.onclick=function(){pfEnd=Date.now()+b.getAttribute('data-pf')*6e4;$('#pfree').classList.remove('hidden');chime(true);var up=function(){var s=Math.max(0,Math.round((pfEnd-Date.now())/1000));$('#pfT').textContent=fmtClock(s);if(s<=0)pfStop(true)};up();clearInterval(pfIv);pfIv=setInterval(up,500)}});
$('#pfStop').onclick=function(){pfStop(false)};
// ===== Referral (PROTOTYPE ONLY)
// NOTE: Local-only demo; NOT functional for payouts. Planned reward: $1 credit per friend who buys
// with your code, stacking. Payout = App Store / Google Play gift cards or promo codes issued by the
// developer. Requires a small backend to verify referrals (record code at purchase, validate receipt,
// tally credits per code). Nothing is sent anywhere here; credits stay at $0 locally.
var RA='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
var RC=new RegExp('^FOCUS-['+RA+']{4}-['+RA+']{4}$');
// Random locally; collisions are unlikely (31^8 ≈ 8.5e11) but true per-person uniqueness needs server-side issuance.
function genCode(){var out=[];while(out.length<8){var b=crypto.getRandomValues(new Uint8Array(16));for(var i=0;i<b.length;i++){if(b[i]<248&&out.length<8)out.push(RA[b[i]%31])}}return 'FOCUS-'+out.slice(0,4).join('')+'-'+out.slice(4).join('')}
var REF=S.get('ref',null);
if(!REF){REF={mine:genCode(),friend:''};S.set('ref',REF)}else if(!RC.test(REF.mine)){REF.oldCode=REF.mine;REF.mine=genCode();S.set('ref',REF)} // migrate legacy FOCUS-XXXX
var USD=function(n){return NF(n,{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:0})};
var refMsgKey='';
function renderRef(){$('#myCode').textContent=REF.mine;$('#refP').innerHTML=t('refP',{amt:'<b>'+esc(USD(1))+'</b>'});$('#rCred').textContent=USD(REF.credits||0);$('#rCnt').textContent=NF(REF.credits||0);
 if(REF.friend)$('#rFriend').innerHTML='<p>'+esc(t('codeApplied',{c:''}))+'<b dir="ltr">'+esc(REF.friend)+'</b></p>';$('#rMsg').textContent=refMsgKey?t(refMsgKey):''}
onLang(renderRef);
function copyCode(){if(HAS.clip){navigator.clipboard.writeText(REF.mine).then(function(){showToast(t('copied'),3000)},function(){showToast(t('yourCode',{c:REF.mine}),5000)})}else showToast(t('yourCode',{c:REF.mine}),5000)}
$('#rShare').onclick=function(){if(HAS.share){navigator.share({title:'FocusPlay',text:t('shareTxt',{c:REF.mine})}).catch(function(){})}else copyCode()};$('#rCopy').onclick=copyCode;
document.addEventListener('submit',function(e){if(e.target.id!=='rForm')return;e.preventDefault();var v=$('#rIn').value.trim().toUpperCase();if(!RC.test(v))refMsgKey='badCode';else if(v===REF.mine)refMsgKey='ownCode';else{REF.friend=v;S.set('ref',REF);refMsgKey='codeSaved'}renderRef()});
// ===== Export / import
$('#exp').onclick=function(){var d={app:'FocusPlay',version:4,exported:new Date().toISOString(),data:{}};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k.indexOf('fp_')===0)d.data[k]=localStorage.getItem(k)}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='focusplay-backup-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);$('#bkMsg').textContent=t('bkSaved')};
$('#impB').onclick=function(){$('#imp').click()};
function askConfirm(msg){return new Promise(function(res){$('#cfMsg').textContent=msg;$('#confirm').classList.remove('hidden');var done=function(v){$('#confirm').classList.add('hidden');$('#cfYes').onclick=$('#cfNo').onclick=null;res(v)};$('#cfYes').onclick=function(){done(true)};$('#cfNo').onclick=function(){done(false)}})}
function readFile(f){return f.text?f.text():new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=rej;r.readAsText(f)})}
$('#imp').onchange=function(){var f=$('#imp').files[0];$('#imp').value='';if(!f)return;readFile(f).then(function(txt){var d=JSON.parse(txt);if(d.app!=='FocusPlay'||!d.data||typeof d.data!=='object')throw 0;
 var n=Object.keys(d.data).filter(function(k){return k.indexOf('fp_')===0}).length;return askConfirm(t('replaceM',{d:fmtDay((d.exported||'').slice(0,10)),n:NF(n)})).then(function(ok){if(!ok)return;window.__imp=true;Object.keys(localStorage).filter(function(k){return k.indexOf('fp_')===0}).forEach(function(k){localStorage.removeItem(k)});Object.keys(d.data).forEach(function(k){var v=d.data[k];if(k.indexOf('fp_')===0&&typeof v==='string')localStorage.setItem(k,v)});sessionStorage.setItem('fp_imported','1');location.reload()})}).catch(function(){$('#bkMsg').textContent=t('bkBad')})};
// ===== language picker
function renderLangSel(){$('#lang').innerHTML=Object.keys(L.langs).map(function(k){return '<option value="'+k+'"'+(k===LANG?' selected':'')+'>'+L.langs[k].name+'</option>'}).join('')}
$('#lang').onchange=function(){setLang($('#lang').value,true)};onLang(renderLangSel);
// ===== boot
applyTheme();setLang(pickLang(),false);initRem();
if(sessionStorage.getItem('fp_imported')){sessionStorage.removeItem('fp_imported');setTimeout(function(){showToast(t('restored'),3000)},300)}
if(HAS.sw&&location.protocol!=='file:'){(function(){var sw=navigator.serviceWorker,hadCtl=!!sw.controller,reloading=false;
 sw.addEventListener('controllerchange',function(){if(!hadCtl||reloading)return;var last=+sessionStorage.getItem('fp_swReload')||0;if(Date.now()-last<15000)return;reloading=true;sessionStorage.setItem('fp_swReload',Date.now());sessionStorage.setItem('fp_updated','1');location.reload()});
 sw.register('sw.js',{updateViaCache:'none'}).then(function(reg){var up=function(){try{reg.update().catch(function(){})}catch(e){}};up();document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')up()});if(reg.waiting&&sw.controller)reg.waiting.postMessage('skipWaiting')}).catch(function(){})})()}
if(sessionStorage.getItem('fp_updated')){sessionStorage.removeItem('fp_updated');setTimeout(function(){showToast(t('updated'),3500)},400)}

// ===== sounds UI
function saveSel(){S.set('sounds',SEL)}
function sndOpts(cur){return '<optgroup label="'+esc(t('sndBuiltIn'))+'">'+SNDS.map(function(id){return '<option value="'+id+'"'+(id===cur?' selected':'')+'>'+esc(t('s_'+id))+'</option>'}).join('')+'</optgroup>'+(MY.length?'<optgroup label="'+esc(t('sndMine'))+'">'+MY.map(function(m){var v='u:'+m.id;return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</optgroup>':'')}
function renderPick(){$$('.sndPick').forEach(function(box){box.innerHTML=SNDK.map(function(k){return '<div class="row sndrow"><label style="flex:1"><span>'+esc(t(k==='gentle'?'sndGentle':'p_'+k))+'</span><select data-sk="'+k+'">'+sndOpts(SEL[k])+'</select></label><button type="button" class="soft small" data-pv="'+k+'" aria-label="'+esc(t('sndPrev'))+'">▶</button></div>'}).join('');
 $$('select[data-sk]',box).forEach(function(x){x.onchange=function(){SEL[x.dataset.sk]=x.value;saveSel();renderPick();playId(x.value)}});
 $$('[data-pv]',box).forEach(function(b){b.onclick=function(){playId(SEL[b.dataset.pv]||'soft_chime')}})})}
function renderSnd(){$('#sndList').innerHTML=SNDS.map(function(id){return '<li class="row"><span style="flex:1">'+esc(t('s_'+id))+'</span><button type="button" class="soft small" data-play="'+id+'" aria-label="'+esc(t('sndPrev'))+'">▶ '+esc(t('sndPrev'))+'</button></li>'}).join('');
 $('#myList').innerHTML=MY.length?MY.map(function(m){return '<li class="row"><input value="'+esc(m.name)+'" maxlength="30" data-ren="'+m.id+'" aria-label="'+esc(t('sndName'))+'" style="flex:1"><button type="button" class="soft small" data-play="u:'+m.id+'" aria-label="'+esc(t('sndPrev'))+'">▶</button><button type="button" class="del" data-sdel="'+m.id+'" aria-label="'+esc(t('del'))+'">✕</button></li>'}).join(''):'<li class="sub">'+esc(t('sndNone'))+'</li>';
 $$('[data-play]').forEach(function(b){b.onclick=function(){playId(b.dataset.play)}});
 $$('[data-ren]').forEach(function(x){x.onchange=function(){var m=MY.filter(function(y){return y.id===x.dataset.ren})[0];if(m){m.name=x.value.trim().slice(0,30)||m.name;S.set('mysnd',MY);renderPick()}}});
 $$('[data-sdel]').forEach(function(b){b.onclick=function(){var id=b.dataset.sdel;idb('readwrite',function(st){return st.delete(id)}).catch(function(){});MY=MY.filter(function(y){return y.id!==id});delete BUF['u:'+id];S.set('mysnd',MY);SNDK.forEach(function(k){if(SEL[k]==='u:'+id)SEL[k]='soft_chime'});saveSel();renderSnd();renderPick()}});renderPick()}
function wavFrom(buf,secs){var sr=22050,len=Math.floor(Math.min(buf.duration,secs)*sr),Off=window.OfflineAudioContext||window.webkitOfflineAudioContext;
 var oc=new Off(1,len,sr),n=oc.createBufferSource();n.buffer=buf;n.connect(oc.destination);n.start();
 return new Promise(function(res){var p=oc.startRendering();if(p&&p.then)p.then(res);else oc.oncomplete=function(e){res(e.renderedBuffer)}}).then(function(r){var d=r.getChannelData(0),fade=Math.min(d.length,sr/20);for(var i=0;i<fade;i++)d[d.length-1-i]*=i/fade;var ab=new ArrayBuffer(44+d.length*2),v=new DataView(ab),w=function(o,str){for(var i=0;i<str.length;i++)v.setUint8(o+i,str.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+d.length*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,d.length*2,true);
  for(var j=0;j<d.length;j++)v.setInt16(44+j*2,Math.max(-1,Math.min(1,d[j]))*32767,true);return new Blob([ab],{type:'audio/wav'})})}
var SND_MAX_B=2*1024*1024,SND_MAX_S=10;
$('#sndAddB').onclick=function(){$('#sndFile').click()};
$('#sndFile').onchange=function(){var f=this.files&&this.files[0],msg=$('#sndMsg');this.value='';if(!f)return;
 if(!/^audio\//.test(f.type||'')&&!/\.(mp3|wav|ogg|oga|m4a|aac)$/i.test(f.name)){msg.textContent=t('sndBad');return}
 if(f.size>SND_MAX_B){msg.textContent=t('sndTooBig');return}
 if(MY.length>=10){msg.textContent=t('sndFull');return}
 var trimmed=false;msg.textContent='…';
 (f.arrayBuffer?f.arrayBuffer():new Response(f).arrayBuffer()).then(function(ab){return decode(ab.slice(0))}).then(function(buf){if(buf.duration>SND_MAX_S+.05){trimmed=true;return wavFrom(buf,SND_MAX_S)}return f},function(){throw new Error('bad')})
 .then(function(blob){var id='s'+Date.now().toString(36),name=(f.name||'').replace(/\.[^.]+$/,'').slice(0,30)||t('sndMine');return idb('readwrite',function(st){return st.put(blob,id)}).then(function(){MY.push({id:id,name:name});S.set('mysnd',MY);renderSnd();msg.textContent=trimmed?t('sndTrim'):t('sndAdded');playId('u:'+id)})})
 .catch(function(e){msg.textContent=e&&e.message==='bad'?t('sndBad'):t('sndFail')})};
onLang(renderSnd);renderSnd();
// ===== native notifications (Capacitor). Web behaviour unchanged when not native.
(function(){var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;var LN=C.Plugins&&C.Plugins.LocalNotifications;if(!LN)return;
 var PLAT=C.getPlatform&&C.getPlatform(),granted=false,tmr=null,WINDOW_D=3,CAP=60;
 notify=function(){};// native notifications are pre-scheduled below; in-app cards still show while open
 function prLabel(p){var o=$('#cPri option[value="'+p+'"]');return o?o.textContent:p}
 // Android channels can't change sound after creation -> one versioned channel per priority+built-in sound: fp2-<pri>-<sound>
 var IMP={needed:2,important:3,urgent:4},made={};
 function nativeSnd(id){return SNDS.indexOf(id)>=0?id:'soft_chime'}// user sounds can't be bundled into res/raw -> nearest built-in (soft chime) when app is closed
 function chId(pri,sk){return 'fp2-'+pri+'-'+nativeSnd(SEL[sk]||'soft_chime')}
 function chans(L){if(PLAT!=='android')return Promise.resolve();var need={};(L||[]).forEach(function(x){need[x.ch]=x});
  return Promise.all(Object.keys(need).filter(function(id){return !made[id]}).map(function(id){var p=id.split('-'),pri=p[1],snd=p.slice(2).join('-');made[id]=1;return LN.createChannel({id:id,name:prLabel(pri)+' · '+t('s_'+snd),importance:IMP[pri],sound:snd+'.ogg',vibration:pri==='urgent',lights:pri==='urgent',visibility:1}).catch(function(){})}))
   .then(function(){return LN.listChannels?LN.listChannels().then(function(r){return Promise.all((r.channels||[]).filter(function(c){return /^fp-/.test(c.id)||(/^fp2-/.test(c.id)&&!need[c.id])}).map(function(c){delete made[c.id];return LN.deleteChannel({id:c.id}).catch(function(){})}))}).catch(function(){}):null})}
 function hmAt(d){return pad(d.getHours())+':'+pad(d.getMinutes())}
 function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
 function at(day,hm){var p=hm.split(':'),d=new Date(day);d.setHours(+p[0],+p[1],0,0);return d}
 function workAt(d){var w=R.days[(d.getDay()+6)%7];if(!w.on)return false;var n=mins(hmAt(d)),s=mins(w.s),e=mins(w.e);return s<=e?n>=s&&n<e:n>=s||n<e}
 function gOk(g,d){var td=ymd(d),hm=hmAt(d);if(g.repeat==='weekdays'&&g.days.indexOf((d.getDay()+6)%7)<0)return false;if(g.repeat==='range'&&((g.from&&td<g.from)||(g.to&&td>g.to)))return false;if(g.ah&&(g.ahS<=g.ahE?(hm<g.ahS||hm>=g.ahE):(hm<g.ahS&&hm>=g.ahE)))return false;return true}
 function build(){var now=Date.now(),end=now+WINDOW_D*864e5,L=[],days=[];for(var i=0;i<=WINDOW_D;i++){var d=new Date();d.setDate(d.getDate()+i);d.setHours(0,0,0,0);days.push(d)}
  var fx=false,sk0=null,add=function(ts,title,body,pri){pri=pri||'needed';var sk=sk0||pri;if(ts>now+5e3&&ts<=end)L.push({ts:ts,title:title,body:body,pri:pri,fx:fx,ch:chId(pri,sk),snd:nativeSnd(SEL[sk]||'soft_chime')})};
  var every=function(from,minutes,cb){fx=false;var st=Math.max(1,minutes)*6e4,ts=from+st;if(ts<now)ts+=Math.ceil((now-ts)/st)*st;for(var n=0;ts<=end&&n<2000;ts+=st,n++)cb(ts)};
  if(M.brOn)every(M.lastBr,M.brMin,function(ts){if(workAt(new Date(ts)))add(ts,t('brkT'),t('brkM',{n:NF(M.brMin)}),M.brPri)});
  if(M.wdOn)days.forEach(function(d){fx=true;add(+at(d,M.wdTime),t('wdT'),t('wdM'),M.wdPri)});
  CR.forEach(function(r){if(!r.on)return;if(r.mode==='every')every(r.last||now,r.every,function(ts){add(ts,r.name,t('repMsg'),r.pri)});else if(r.mode==='time')days.forEach(function(d){fx=true;add(+at(d,r.time),r.name,t('schedMsg',{t:fmtT(r.time)}),r.pri)})});
  sk0='gentle';(G||[]).forEach(function(g){if(!g.on)return;var ti=(g.e||'🌱')+' '+gName(g),bo=t('gentleMsg');if(g.mode==='interval')every(g.last||now,g.every,function(ts){if(gOk(g,new Date(ts)))add(ts,ti,bo,g.pri)});else days.forEach(function(d){fx=true;g.times.forEach(function(tm){var x=at(d,tm);if(gOk(g,x))add(+x,ti,bo,g.pri)})})});
  // keep fixed-time/urgent ones first (OS limit ~64 pending on iOS), fill remaining slots with soonest interval nudges
  sk0=null;var rank=function(x){return x.fx||x.pri==='urgent'?0:1};L.sort(function(a,b){return rank(a)-rank(b)||a.ts-b.ts});L=L.slice(0,CAP);L.sort(function(a,b){return a.ts-b.ts});return L}
 function resched(){if(!granted)return Promise.resolve();return LN.getPending().then(function(p){return p.notifications.length?LN.cancel({notifications:p.notifications.map(function(n){return{id:n.id}})}):null}).then(function(){var L=build();return chans(L).then(function(){if(!L.length)return;
  return LN.schedule({notifications:L.map(function(x,i){var u=x.pri==='urgent';return{id:1000+i,title:(u?'⚠ ':'')+x.title,body:x.body,schedule:{at:new Date(x.ts),allowWhileIdle:true},channelId:x.ch,sound:x.snd+'.wav',smallIcon:'ic_stat_focusplay',iconColor:'#8fb9a8',autoCancel:true,ongoing:false,extra:{pri:x.pri},threadIdentifier:'fp-'+x.pri,interruptionLevel:u?'timeSensitive':x.pri==='needed'?'passive':'active'}})})})}).catch(function(e){console.warn('LN',e)})}
 function later(){clearTimeout(tmr);tmr=setTimeout(resched,800)}
 var KEYS={rem:1,custom:1,gentle:1,routine:1,lang:1,sounds:1},sig={};var oset=S.set;S.set=function(k,v){oset.call(S,k,v);if(!KEYS[k])return;var j;try{j=JSON.stringify(v,function(a,b){return a==='wdDay'||a==='fired'||a==='lastDay'?undefined:b})}catch(e){}if(j!==sig[k]){sig[k]=j;later()}};
 permInfo=function(){LN.checkPermissions().then(function(r){granted=r.display==='granted';$('#perm').disabled=false;$('#permStat').textContent=t('permSt',{p:t('perm_'+(granted?'granted':r.display==='denied'?'denied':'default'))})+(granted?' ✓':t('permFb'))}).catch(function(){})};onLang(permInfo);onLang(later);
 $('#perm').onclick=function(){LN.requestPermissions().then(function(r){granted=r.display==='granted';permInfo();return resched()}).catch(permInfo)};
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')later()});
 LN.checkPermissions().then(function(r){granted=r.display==='granted';permInfo();if(r.display==='prompt'||r.display==='prompt-with-rationale')return LN.requestPermissions().then(function(q){granted=q.display==='granted';permInfo()})}).then(resched).catch(function(){});
 window.__fpResched=resched;
})();
