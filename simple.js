'use strict';
/* FocusPlay Simple mode: 4 big tiles, big buttons, few words. Reuses app.js data (CR custom reminders, remind(), sounds). */
(function(){
var MODE=S.get('uiMode',''),cur='home',tIv=null,tEnd=0,tSel=5,brIv=null,noise=null,gIv=null,score=0;
var root=$('#simple'),ask=$('#uiAsk');
var BACK='<button type="button" class="sm-back" data-go="home"><span class="sm-arr" aria-hidden="true">←</span><span>'+'{b}'+'</span></button>';
function kidsActive(){return document.body.classList.contains('kidsmode')||!!(S.get('kids',{}).on)}
function syncTheme(){document.documentElement.setAttribute('data-th',(window.TH&&TH.p)||'sage')}
var _ap=applyTheme;applyTheme=function(){_ap();syncTheme()};syncTheme();
function stopAll(){clearInterval(tIv);tIv=null;tEnd=0;clearInterval(brIv);brIv=null;if(gIv&&gIv.stop)gIv.stop();gIv=null;stopNoise()}
function tile(k,e,c){return '<button type="button" class="sm-tile '+c+'" data-go="'+k+'" aria-label="'+esc(t('sm'+k))+'"><span class="sm-ico" aria-hidden="true">'+e+'</span><span class="sm-tl">'+esc(t('sm'+k))+'</span></button>'}
function shell(inner){return '<div class="sm-top"><span class="sm-badge">'+esc(t('smLabel'))+'</span></div>'+inner}
function render(){if(!root)return;stopAll();var h='';
 if(cur==='home')h=shell('<div class="sm-grid">'+tile('Focus','⏳','c1')+tile('Rem','🔔','c2')+tile('Calm','🌙','c3')+tile('Game','🫧','c4')+'</div><button type="button" class="sm-full" id="smFullB">'+esc(t('smFull'))+'</button>');
 else{var b=BACK.replace('{b}',esc(t('smBack')));
  if(cur==='Focus')h=shell(b+'<div class="sm-panel c1"><div class="sm-clock" id="smClock" dir="ltr" role="timer" aria-live="off">'+fmtClock(tSel*60)+'</div><div class="sm-pre">'+[5,15,25].map(function(m){return '<button type="button" data-m="'+m+'" class="'+(m===tSel?'on':'')+'" aria-pressed="'+(m===tSel)+'">'+esc(fmtMin(m))+'</button>'}).join('')+'</div><button type="button" class="sm-go" id="smTGo">▶ '+esc(t('smStart'))+'</button></div>');
  else if(cur==='Rem')h=shell(b+'<div class="sm-panel c2"><ul class="sm-list" id="smList"></ul><button type="button" class="sm-go" id="smAddB">＋ '+esc(t('smAdd'))+'</button><form id="smForm" class="sm-form hidden"><label class="sm-lab"><span>'+esc(t('smName'))+'</span><input id="smName" maxlength="60" required autocomplete="off"></label><label class="sm-lab"><span>'+esc(t('smTime'))+'</span><input id="smTime" type="time" value="09:00" dir="ltr" required></label><button class="sm-go">✓ '+esc(t('smSave'))+'</button></form></div>');
  else if(cur==='Calm')h=shell(b+'<div class="sm-panel c3"><div class="sm-breath" aria-hidden="true"><div class="sm-circle" id="smCirc"></div></div><p class="sm-say" id="smSay" aria-live="polite">'+esc(t('breatheIn'))+'</p><button type="button" class="sm-go" id="smSnd" aria-pressed="false">🎵 '+esc(t('smSound'))+'</button></div>');
  else if(cur==='Game')h=shell(b+'<div class="sm-panel c4"><p class="sm-say"><span aria-hidden="true">🫧 </span><span id="smScore">'+NF(0)+'</span></p><div class="sm-pond" id="smPond" aria-label="'+esc(t('smTap'))+'"></div><p class="sm-hint">'+esc(t('smTap'))+'</p></div>')}
 root.innerHTML=h;$$('[data-go]',root).forEach(function(x){x.onclick=function(){go(x.dataset.go)}});
 if(cur==='home')$('#smFullB').onclick=confirmFull;
 if(cur==='Focus')initTimer();if(cur==='Rem')initRem();if(cur==='Calm')initCalm();if(cur==='Game')initGame();
 var f=root.querySelector(cur==='home'?'.sm-tile':'.sm-back');if(f&&document.activeElement&&root.contains(document.activeElement))f.focus()}
function go(k){cur=k;render();window.scrollTo(0,0);var f=root.querySelector(k==='home'?'[data-go="'+(go.last||'Focus')+'"]':'.sm-back');if(k!=='home')go.last=k;if(f)f.focus({preventScroll:true})}
// timer
function initTimer(){var clk=$('#smClock'),btn=$('#smTGo');
 $$('.sm-pre button',root).forEach(function(b){b.onclick=function(){if(tEnd)return;tSel=+b.dataset.m;render()}});
 var up=function(){var s=Math.max(0,Math.round((tEnd-Date.now())/1000));clk.textContent=fmtClock(s);if(s<=0){clearInterval(tIv);tIv=null;tEnd=0;btn.textContent='▶ '+t('smStart');root.querySelector('.sm-panel').classList.remove('run');remind(t('smDone'),t('pfDoneM'),'important')}};
 btn.onclick=function(){if(tEnd){clearInterval(tIv);tIv=null;tEnd=0;clk.textContent=fmtClock(tSel*60);btn.textContent='▶ '+t('smStart');root.querySelector('.sm-panel').classList.remove('run');return}
  tEnd=Date.now()+tSel*6e4;chime(true);btn.textContent='■ '+t('smStop');root.querySelector('.sm-panel').classList.add('run');up();tIv=setInterval(up,500)}}
// reminders: same store as full app (fp_custom / CR), so notifications keep working
function drawList(){var l=$('#smList');if(!l)return;var mine=CR.map(function(r,i){return{r:r,i:i}}).filter(function(x){return x.r.mode==='time'});
 l.innerHTML=mine.length?mine.map(function(x){return '<li><span class="sm-rt" dir="ltr">'+esc(fmtT(x.r.time))+'</span><span class="sm-rn">'+esc(x.r.name)+'</span><button type="button" class="sm-del" data-d="'+x.r.id+'" aria-label="'+esc(t('smDel')+': '+x.r.name)+'">🗑</button></li>'}).join(''):'<li class="sm-empty">'+esc(t('smNone'))+'</li>';
 $$('[data-d]',l).forEach(function(b){b.onclick=function(){var i=-1;CR.forEach(function(r,j){if(String(r.id)===b.dataset.d)i=j});if(i<0)return;CR.splice(i,1);S.set('custom',CR);renderC();drawList()}})}
function initRem(){drawList();var f=$('#smForm');$('#smAddB').onclick=function(){f.classList.remove('hidden');$('#smAddB').classList.add('hidden');$('#smName').focus()};
 f.onsubmit=function(e){e.preventDefault();var n=$('#smName').value.trim(),tm=$('#smTime').value||'09:00';if(!n)return;CR.push({id:Date.now(),name:n,mode:'time',time:tm,every:60,pri:'important',on:true,last:Date.now(),lastDay:hmNow()>=tm?today():''});S.set('custom',CR);renderC();f.reset();$('#smTime').value='09:00';f.classList.add('hidden');$('#smAddB').classList.remove('hidden');drawList();showToast('✓ '+n,2000)}}
// calm: breathing circle + soft rain-like noise (synthesised, offline)
function initCalm(){var c=$('#smCirc'),s=$('#smSay'),inh=true;var step=function(){c.classList.toggle('in',inh);s.textContent=t(inh?'breatheIn':'breatheOut');inh=!inh};setTimeout(step,60);brIv=setInterval(step,4000);
 var b=$('#smSnd');b.onclick=function(){if(noise){stopNoise();b.setAttribute('aria-pressed','false');b.classList.remove('on');b.textContent='🎵 '+t('smSound');return}startNoise();b.setAttribute('aria-pressed','true');b.classList.add('on');b.textContent='⏸ '+t('smSound')}}
function startNoise(){try{var c=getAC(),len=c.sampleRate*4,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0),last=0;for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.2}
 var n=c.createBufferSource();n.buffer=buf;n.loop=true;var f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=900;var g=c.createGain();g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.35,c.currentTime+1.5);n.connect(f);f.connect(g);g.connect(c.destination);n.start();noise={n:n,g:g,c:c}}catch(e){noise=null}}
function stopNoise(){if(!noise)return;var x=noise;noise=null;try{x.g.gain.linearRampToValueAtTime(0,x.c.currentTime+.6);setTimeout(function(){try{x.n.stop()}catch(e){}},700)}catch(e){}}
// game: tap the bubble
function initGame(){score=0;var stop=bubbleGame($('#smPond'),{label:t('smTap'),onPop:function(n){score+=n;$('#smScore').textContent=NF(score)}});gIv={stop:stop}}
// confirm back to full
function confirmFull(){var d=document.createElement('div');d.className='sm-dlg';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.innerHTML='<div class="sm-dbox"><p class="sm-dq">'+esc(t('smToFullQ'))+'</p><div class="sm-drow"><button type="button" class="sm-no">'+esc(t('smNo'))+'</button><button type="button" class="sm-yes">'+esc(t('smYes'))+'</button></div></div>';document.body.appendChild(d);d.querySelector('.sm-yes').focus();
 d.querySelector('.sm-no').onclick=function(){d.remove();$('#smFullB').focus()};d.querySelector('.sm-yes').onclick=function(){d.remove();setMode('full')}}
function setMode(m){MODE=m;S.set('uiMode',m);S.set('uiAsked',1);apply()}
function apply(){var on=MODE==='simple'&&!kidsActive();document.body.classList.toggle('simplemode',on);root.classList.toggle('hidden',!on);if(on){cur='home';render()}else{stopAll();root.innerHTML=''}var cb=$('#smToggle');if(cb)cb.checked=MODE==='simple';window.scrollTo(0,0)}
// settings toggle
var cb=$('#smToggle');if(cb)cb.onchange=function(){setMode(cb.checked?'simple':'full')};
// first launch / existing users: ask once, gently
function showAsk(){if(!ask||kidsActive())return;ask.classList.remove('hidden');var close=function(m){ask.classList.add('hidden');if(m)setMode(m);else S.set('uiAsked',1)};
 $('#askFull').onclick=function(){close('full')};$('#askSimple').onclick=function(){close('simple')};$('#askLater').onclick=function(){close(null)};setTimeout(function(){$('#askSimple').focus()},50)}
onLang(function(){if(MODE==='simple'&&!root.classList.contains('hidden'))render()});
// watch Kids mode: it always wins
new MutationObserver(function(){var k=document.body.classList.contains('kidsmode');if(k&&document.body.classList.contains('simplemode'))apply();else if(!k&&MODE==='simple'&&root.classList.contains('hidden'))apply()}).observe(document.body,{attributes:true,attributeFilter:['class']});
apply();if(!S.get('uiAsked',0)&&!MODE)setTimeout(showAsk,350);
window.FPSimple={set:setMode,go:go,mode:function(){return MODE}};
})();
