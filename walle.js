/* Walle: original cute robot companion + Kids mode (FocusPlay). Original SVG art and synthesized sounds. */
(function(){'use strict';
var F=window.FP;if(!F)return;var $=F.$,$$=F.$$,S=F.S,t=F.t,esc=F.esc,pad=F.pad;
var CFG=Object.assign({wl:'',lv:'beginner',pl:'fr',start:'',seen:{},rem:{word:{n:0,times:['09:00']},phrase:{n:0,times:['12:00']},quote:{n:0,times:['08:00']}},fired:{}},S.get('walle',{}));
function save(){S.set('walle',CFG)}
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// ---------- art (original design: rounded capsule body, screen face with LED eyes, antenna bulb, little arms & wheels)
function botSVG(){return '<svg viewBox="0 0 200 210" class="bot" aria-hidden="true"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="var(--wb,#e8f1ee)"/></linearGradient></defs>'+
'<g class="b-all"><line x1="100" y1="34" x2="100" y2="14" class="b-ln"/><circle cx="100" cy="11" r="7" class="b-bulb"/>'+
'<g class="b-arm b-armL"><rect x="14" y="104" width="22" height="40" rx="11" class="b-limb"/></g><g class="b-arm b-armR"><rect x="164" y="104" width="22" height="40" rx="11" class="b-limb"/></g>'+
'<rect x="30" y="34" width="140" height="150" rx="56" fill="url(#bg1)" class="b-body"/>'+
'<rect x="48" y="58" width="104" height="72" rx="30" class="b-screen"/>'+
'<g class="b-eyes"><g class="b-eye"><ellipse cx="78" cy="94" rx="13" ry="16" class="b-pupil"/><circle cx="82" cy="88" r="4" class="b-glint"/></g><g class="b-eye"><ellipse cx="122" cy="94" rx="13" ry="16" class="b-pupil"/><circle cx="126" cy="88" r="4" class="b-glint"/></g>'+
'<path d="M64 96q14-14 28 0M108 96q14-14 28 0" class="b-happy"/></g>'+
'<ellipse cx="100" cy="120" rx="9" ry="3" class="b-mouth"/><circle cx="60" cy="118" r="7" class="b-blush"/><circle cx="140" cy="118" r="7" class="b-blush"/>'+
'<rect x="82" y="146" width="36" height="10" rx="5" class="b-led"/>'+
'<rect x="56" y="180" width="30" height="20" rx="10" class="b-limb"/><rect x="114" y="180" width="30" height="20" rx="10" class="b-limb"/></g>'+
'<g class="b-hearts"></g></svg>'}
function mount(el){el.innerHTML=botSVG();idle(el);petting(el)}
function idle(el){if(RM)return;(function blink(){setTimeout(function(){el.classList.add('blink');setTimeout(function(){el.classList.remove('blink');blink()},160)},2600+Math.random()*3200)})();
 (function look(){setTimeout(function(){var e=el.querySelector('.b-eyes');if(e){var x=(Math.random()*16-8)|0,y=(Math.random()*6-3)|0;e.style.transform='translate('+x+'px,'+y+'px)'}look()},1800+Math.random()*2600)})()}
function hearts(el,n){var g=el.querySelector('.b-hearts');if(!g||RM)return;for(var i=0;i<(n||3);i++){var h=document.createElementNS('http://www.w3.org/2000/svg','text');h.textContent='♥';h.setAttribute('x',60+Math.random()*80);h.setAttribute('y',60);h.setAttribute('class','b-heart');h.style.animationDelay=(i*.12)+'s';g.appendChild(h);setTimeout(function(x){x.remove()}.bind(null,h),1400)}}
function happy(el){el.classList.remove('happy','wiggle');void el.offsetWidth;el.classList.add('happy','wiggle');hearts(el,3);clearTimeout(el._h);el._h=setTimeout(function(){el.classList.remove('happy','wiggle')},1100)}
// ---------- sounds: original Web Audio synthesis
var A=function(){return F.getAC()};
function tone(f0,f1,dur,type,vol,when){var a=A(),o=a.createOscillator(),g=a.createGain(),t0=a.currentTime+(when||0);o.type=type||'sine';o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
 g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol||.18,t0+.015);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);o.connect(g).connect(a.destination);o.start(t0);o.stop(t0+dur+.02)}
var SFX={chirp:function(){tone(700,1500,.14,'sine',.2);tone(1100,2000,.1,'triangle',.08,.12)},
 trill:function(){for(var i=0;i<6;i++)tone(i%2?1500:1200,i%2?1700:1350,.07,'sine',.15,i*.07)},
 hmm:function(){tone(500,800,.16,'triangle',.16);tone(800,560,.14,'triangle',.14,.17);tone(560,1000,.18,'triangle',.16,.32)},
 boop:function(){tone(420,300,.12,'sine',.22);tone(640,520,.1,'sine',.12,.13)},
 purr:function(){var a=A(),o=a.createOscillator(),l=a.createOscillator(),lg=a.createGain(),g=a.createGain(),t0=a.currentTime;o.type='triangle';o.frequency.value=180;l.frequency.value=22;lg.gain.value=40;l.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.16,t0+.1);g.gain.setValueAtTime(.16,t0+.8);g.gain.exponentialRampToValueAtTime(.0001,t0+1.2);o.connect(g).connect(a.destination);o.start(t0);l.start(t0);o.stop(t0+1.25);l.stop(t0+1.25);tone(900,1300,.12,'sine',.1,1.15)}};
function sfx(n){try{SFX[n]()}catch(e){}}
// ---------- petting: tap = happy, stroke = happy hearts, long-press = purr-beep
function petting(el){var down=0,sx=0,sy=0,dist=0,lp=null,stroked=false;
 el.addEventListener('pointerdown',function(e){down=Date.now();sx=e.clientX;sy=e.clientY;dist=0;stroked=false;clearTimeout(lp);lp=setTimeout(function(){lp='done';el.classList.add('purr');sfx('purr');F.vibrate([20,40,20,40,20]);hearts(el,5);setTimeout(function(){el.classList.remove('purr')},1300)},650)});
 el.addEventListener('pointermove',function(e){if(!down)return;dist+=Math.hypot(e.clientX-sx,e.clientY-sy);sx=e.clientX;sy=e.clientY;if(dist>50){if(lp!=='done')clearTimeout(lp);dist=0;stroked=true;happy(el);sfx('trill')}});
 var end=function(){if(!down)return;var was=lp==='done';clearTimeout(lp);lp=null;down=0;if(!was&&!stroked){happy(el);sfx('chirp');F.vibrate(15);el.dispatchEvent(new CustomEvent('tapbot'))}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',function(){clearTimeout(lp);lp=null;down=0});el.addEventListener('contextmenu',function(e){e.preventDefault()});
 el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();happy(el);sfx('chirp');el.dispatchEvent(new CustomEvent('tapbot'))}})}
// ---------- content (lazy JSON, cached by the service worker after first load)
var WL=['en','fr','es','de','it','pt','ja','zh','ko','ar'],PL=['fr','es','de','it','pt','ja','zh','ko','ar'];
var NAME={en:'English',fr:'Français',es:'Español',de:'Deutsch',it:'Italiano',pt:'Português',ja:'日本語',zh:'中文',ko:'한국어',ar:'العربية'};
var BCP={en:'en-US',fr:'fr-FR',es:'es-ES',de:'de-DE',it:'it-IT',pt:'pt-PT',ja:'ja-JP',zh:'zh-CN',ko:'ko-KR',ar:'ar-SA'};
var cache={};function load(p){return cache[p]||(cache[p]=fetch('walle/'+p).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).catch(function(e){delete cache[p];throw e}))}
function dayIdx(){if(!CFG.start){CFG.start=F.today();save()}var a=new Date(CFG.start+'T00:00:00'),b=new Date(F.today()+'T00:00:00');return Math.max(0,Math.round((b-a)/864e5))}
function idxFor(key,len){var x=(CFG.seen[key]||0);return (dayIdx()+x)%len}
function bump(key){CFG.seen[key]=(CFG.seen[key]||0)+1;save()}
function getWord(){var l=CFG.wl||defWL();return load('words/'+l+'.json').then(function(d){var o=['beginner','intermediate','advanced'],i=o.indexOf(CFG.lv);if(i<0)i=0;var L=[];o.slice(i).concat(o.slice(0,i)).forEach(function(k){L=L.concat(d[k]||[])});return {l:l,x:L[idxFor('w_'+l+'_'+CFG.lv,L.length)]}})}
function getPhrase(){var l=CFG.pl;return load('phrases/'+l+'.json').then(function(d){var i=idxFor('p_'+l,d.length);return {l:l,i:i,x:d[i]}})}
function getQuote(){return load('quotes.json').then(function(d){return {x:d[idxFor('q',d.length)]}})}
function defWL(){var l=F.lang();return WL.indexOf(l)>=0?l:'en'}
// ---------- speech
function speak(text,lang){try{if(!('speechSynthesis' in window))return F.toast(t('wNoTTS'),3000);var u=new SpeechSynthesisUtterance(text);u.lang=BCP[lang]||lang;u.rate=.85;var v=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.replace('_','-').toLowerCase().indexOf(u.lang.slice(0,2).toLowerCase())===0})[0];if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
// ---------- single card: Word / Phrase / Quote, swaps in place (no feed, no history)
var cur='word',seq=0,lis={a:null,b:null};
function lvTag(x,l){if(x.lvl)return x.lvl;return t({beginner:'lvB',intermediate:'lvI',advanced:'lvA'}[CFG.lv])}
function setBtns(a,b){lis.a=a;lis.b=b;$('#wLis').textContent='🔊 '+t('wListen');$('#wLisEx').textContent='🔊 '+t('wListenEx');$('#wLisEx').classList.toggle('hidden',!b);$('#wLis').disabled=!a}
function wordHTML(r){var x=r.x,rtl=r.l==='ar',D=rtl?' dir="rtl"':'';return '<small class="tag">'+esc(NAME[r.l])+' · '+esc(lvTag(x,r.l))+'</small><div class="wword" lang="'+r.l+'"'+D+'>'+esc(x.w)+'</div>'+
 (x.p?'<div class="pron" dir="ltr">'+esc(x.p)+'</div>':'')+'<p class="wmean">'+(x.pos?'<i>'+esc(x.pos)+'</i> ':'')+esc(x.m)+'</p>'+
 (x.e?'<p class="wex"><span lang="'+r.l+'"'+D+'>'+esc(x.e)+'</span>'+(x.er?'<br><small dir="ltr">'+esc(x.er)+'</small>':'')+(x.et?'<br><small>“'+esc(x.et)+'”</small>':'')+'</p>':'')}
function phraseHTML(r){var x=r.x,rtl=r.l==='ar';return '<small class="tag">'+esc(NAME[r.l])+' · '+esc(t('wu_'+x.u))+'</small><div class="wword wphr" lang="'+r.l+'"'+(rtl?' dir="rtl"':'')+'>'+esc(x.p)+'</div>'+(x.r?'<div class="pron" dir="ltr">'+esc(x.r)+'</div>':'')+'<p class="wmean">“'+esc(x.t)+'”</p>'}
function quoteHTML(r){var x=r.x;return '<blockquote lang="en" dir="ltr">“'+esc(x.q)+'”</blockquote><p class="att" dir="ltr">— '+esc(x.a)+(x.s?', <i>'+esc(x.s)+'</i>':'')+'</p>'}
function show(f,more){cur=f;$$('.wseg button').forEach(function(b){var on=b.dataset.f===f;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
 if(more)bump(f==='word'?'w_'+(CFG.wl||defWL())+'_'+CFG.lv:f==='phrase'?'p_'+CFG.pl:'q');
 var my=++seq,body=$('#wBody');body.classList.add('out');var t0=Date.now();
 (f==='word'?getWord():f==='phrase'?getPhrase():getQuote()).then(function(r){if(my!==seq)return;
  var h=f==='word'?wordHTML(r):f==='phrase'?phraseHTML(r):quoteHTML(r);
  setTimeout(function(){if(my!==seq)return;body.innerHTML=h;body.scrollTop=0;body.classList.remove('out');
   if(f==='word')setBtns([r.x.w,r.l],r.x.e?[r.x.e,r.l]:null);else if(f==='phrase')setBtns([r.x.p,r.l],null);else setBtns([r.x.q+' — '+r.x.a,'en'],null)},RM?0:Math.max(0,200-(Date.now()-t0)))
},function(){if(my!==seq)return;body.classList.remove('out');body.innerHTML='<p class="sub">'+esc(t('wNetErr'))+'</p>';setBtns(null,null)})}
function act(c){var f=c.replace('More','');if(['word','phrase','quote'].indexOf(f)<0)f='word';show(f,c!==f);var card=$('.wcard');card.classList.remove('flash');void card.offsetWidth;card.classList.add('flash')}
// ---------- online gating
var probing=false,greeted=false;
function probe(){if(!navigator.onLine)return Promise.resolve(false);return fetch('walle/stats.json?probe='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok},function(){return false})}
function gate(){if(probing)return;probing=true;probe().then(function(ok){probing=false;$('#wOff').classList.toggle('hidden',ok);$('#wOn').classList.toggle('hidden',!ok);if(ok&&!greeted){greeted=true;show(cur)}})}
// ---------- settings & reminders
function fillSel(){$('#wWL').innerHTML=WL.map(function(l){return '<option value="'+l+'">'+NAME[l]+'</option>'}).join('');$('#wWL').value=CFG.wl||defWL();$('#wPL').innerHTML=PL.map(function(l){return '<option value="'+l+'">'+NAME[l]+'</option>'}).join('');$('#wPL').value=CFG.pl;$('#wLv').value=CFG.lv}
function renderRem(){var F3=[['word','wWord'],['phrase','wPhrase'],['quote','wQuote']];
 $('#wRem').innerHTML=F3.map(function(f){var r=CFG.rem[f[0]];return '<div class="wrem"><label><span>'+esc(t(f[1]))+'</span><select data-n="'+f[0]+'" aria-label="'+esc(t('wTimes'))+'"><option value="0">'+esc(t('wOff'))+'</option>'+[1,2,3,4,5].map(function(n){return '<option value="'+n+'">'+esc(t('wNx',{n:n}))+'</option>'}).join('')+'</select></label><div class="times">'+
  r.times.slice(0,r.n).map(function(tm,i){return '<input type="time" data-f="'+f[0]+'" data-i="'+i+'" value="'+tm+'" aria-label="'+esc(t(f[1]))+' '+(i+1)+'">'}).join('')+'</div></div>'}).join('');
 $$('#wRem select').forEach(function(s){var r=CFG.rem[s.dataset.n];s.value=r.n;s.onchange=function(){r.n=+s.value;var dft=['09:00','12:00','15:00','18:00','20:30'];while(r.times.length<r.n)r.times.push(dft[r.times.length]);save();renderRem();askPerm()}});
 $$('#wRem input[type=time]').forEach(function(x){x.onchange=function(){CFG.rem[x.dataset.f].times[+x.dataset.i]=x.value||'09:00';save()}})}
function askPerm(){try{if('Notification' in window&&Notification.permission==='default'&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))Notification.requestPermission()}catch(e){}}
var MSG={word:'wRemW',phrase:'wRemP',quote:'wRemQ'};
window.__walleRem=function(){var L=[];['word','phrase','quote'].forEach(function(f){var r=CFG.rem[f];for(var i=0;i<r.n;i++)L.push({time:r.times[i],title:t('sWalle'),body:t(MSG[f])})});return L};
window.__walleTick=function(hm){var td=F.today(),ch=false;['word','phrase','quote'].forEach(function(f){var r=CFG.rem[f];for(var i=0;i<r.n;i++){var k=f+i+'@'+r.times[i];if(hm>=r.times[i]&&CFG.fired[k]!==td){var first=CFG.fired[k]===undefined;CFG.fired[k]=td;ch=true;if(!first||hm.slice(0,5)===r.times[i])F.remind(t('sWalle'),t(MSG[f]),'needed')}}});if(ch)save()};
// prime fired so reminders already past today don't all fire on first load
(function(){var td=F.today(),d=new Date(),hm=pad(d.getHours())+':'+pad(d.getMinutes());['word','phrase','quote'].forEach(function(f){var r=CFG.rem[f];for(var i=0;i<r.n;i++){var k=f+i+'@'+r.times[i];if(CFG.fired[k]===undefined&&hm>=r.times[i])CFG.fired[k]=td}})})();
// ---------- PIN (PBKDF2-SHA256, random salt, stored locally only)
function rnd(n){var a=new Uint8Array(n);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(b){return b.toString(16).padStart(2,'0')}).join('')}
function hash(pin,salt){var enc=new TextEncoder();if(!(window.crypto&&crypto.subtle))return Promise.resolve(fallbackHash(pin+salt));return crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:120000,hash:'SHA-256'},k,256)}).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return x.toString(16).padStart(2,'0')}).join('')})}
function fallbackHash(s){var h=2166136261;for(var r=0;r<5000;r++)for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return 'f'+h.toString(16)}
var K=Object.assign({on:false,salt:'',h:'',fails:0,until:0},S.get('kids',{}));function saveK(){S.set('kids',K)}
function setPin(pin){var salt=rnd(16);return hash(pin,salt).then(function(h){K.salt=salt;K.h=h;K.fails=0;K.until=0;saveK()})}
function checkPin(pin){return hash(pin,K.salt).then(function(h){return h===K.h})}
// keypad dialog: mode = set | unlock | change
var P={mode:'',buf:'',first:'',step:0,cb:null};
function pinOpen(mode,cb){P={mode:mode,buf:'',first:'',step:0,cb:cb};$('#pinChk').classList.add('hidden');$('#pinPad').classList.remove('hidden');$('#pinDots').classList.remove('hidden');$('#pinF').classList.toggle('hidden',mode==='set');pinTitle();$('#pinErr').textContent='';$('#pinDlg').classList.remove('hidden');dots();cool()}
function pinTitle(){var m=P.mode,s=P.step;$('#pinT').textContent=m==='set'?(s?t('pinAgain'):t('pinSetT')):m==='change'?(s===0?t('pinCurrent'):s===1?t('pinSetT'):t('pinAgain')):t('pinEnter');$('#pinM').textContent=m==='set'&&!s||m==='change'&&s===1?t('pinSetM'):''}
function dots(){$$('#pinDots i').forEach(function(d,i){d.classList.toggle('on',i<P.buf.length)})}
function pinClose(){$('#pinDlg').classList.add('hidden');P.cb=null}
function cool(){var left=Math.ceil((K.until-Date.now())/1000);if(left>0){$('#pinErr').textContent=t('pinWait',{s:left});$('#pinPad').classList.add('locked');clearTimeout(cool._t);cool._t=setTimeout(cool,1000);return true}$('#pinPad').classList.remove('locked');if(/\d/.test($('#pinErr').textContent)&&K.until)$('#pinErr').textContent='';return false}
function key(k){if(cool())return;if(k==='del'){P.buf=P.buf.slice(0,-1);dots();return}if(P.buf.length>=4)return;P.buf+=k;dots();sfx('boop');if(P.buf.length===4)setTimeout(submit,120)}
function submit(){var v=P.buf;P.buf='';dots();var m=P.mode;
 var newPin=function(){if(P.step===(m==='set'?0:1)){P.first=v;P.step++;pinTitle();return}if(v!==P.first){$('#pinErr').textContent=t('pinMismatch');P.step=m==='set'?0:1;pinTitle();sfx('hmm');return}setPin(v).then(function(){F.toast(t('pinSaved'),2500);var cb=P.cb;pinClose();cb&&cb(true)})};
 if(m==='set'||(m==='change'&&P.step>0))return newPin();
 checkPin(v).then(function(ok){if(ok){K.fails=0;K.until=0;saveK();if(m==='change'){P.step=1;pinTitle();$('#pinErr').textContent='';return}var cb=P.cb;pinClose();cb&&cb(true)}else{K.fails++;if(K.fails>=5){K.fails=0;K.until=Date.now()+30000}saveK();$('#pinErr').textContent=t('pinWrong',{n:5-K.fails});sfx('hmm');F.vibrate(80);$('#pinDots').classList.remove('no');void $('#pinDots').offsetWidth;$('#pinDots').classList.add('no');cool()}})}
function forgot(){var a=6+(Math.random()*4|0),b=6+(Math.random()*4|0);P.ans=a*b;$('#pinQ').textContent=t('pinCheckM',{a:a,b:b});$('#pinT').textContent=t('pinCheckT');$('#pinM').textContent='';$('#pinErr').textContent='';$('#pinA').value='';$('#pinW').value='';$('#pinChk').classList.remove('hidden');$('#pinPad').classList.add('hidden');$('#pinDots').classList.add('hidden');$('#pinF').classList.add('hidden');$('#pinA').focus()}
function chkGo(){if(+$('#pinA').value===P.ans&&$('#pinW').value.trim().toUpperCase()==='RESET'){var cb=P.cb;K.until=0;K.fails=0;saveK();pinOpen('set',function(){cb&&cb(true)});return}$('#pinErr').textContent=t('pinCheckBad');sfx('hmm');forgot()}
// ---------- Kids mode
var rec=null,stream=null,kBusy=false;
function kidsOn(){K.on=true;saveK();document.body.classList.add('kidsmode');$('#kids').classList.remove('hidden');$('#kMsg').textContent=t('kTalk');try{history.pushState({kids:1},'')}catch(e){}sfx('trill');happy($('#kBot'))}
function kidsOff(){K.on=false;saveK();stopMic();document.body.classList.remove('kidsmode');$('#kids').classList.add('hidden')}
window.addEventListener('popstate',function(){if(K.on){try{history.pushState({kids:1},'')}catch(e){}}});
function stopMic(){try{if(rec&&rec.state==='recording')rec.stop()}catch(e){}if(stream){stream.getTracks().forEach(function(x){x.stop()});stream=null}}
function micExplain(){return new Promise(function(res){if(S.get('micOk',false))return res(true);var d=$('#card');$('#cardT').textContent=t('kMicT');$('#cardM').textContent=t('kMicM');var ok=$('#cardOk'),old=ok.textContent,oh=ok.onclick,bd=d.querySelector('.badge');if(bd)bd.style.display='none';ok.textContent=t('kMicOk');d.classList.remove('hidden');ok.onclick=function(){d.classList.add('hidden');if(bd)bd.style.display='';ok.textContent=old;ok.onclick=oh;S.set('micOk',true);res(true)}})}
function talk(){if(kBusy){if(rec&&rec.state==='recording')rec.stop();return}if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){$('#kMsg').textContent=t('kMicNo');return}
 micExplain().then(function(){return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}).then(function(s){stream=s;kBusy=true;var ac=A(),src=ac.createMediaStreamSource(s),an=ac.createAnalyser();an.fftSize=512;src.connect(an);
  var chunks=[],mime=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].filter(function(m){return window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m)})[0];
  rec=new MediaRecorder(s,mime?{mimeType:mime}:undefined);rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
  var bot=$('#kBot'),started=Date.now(),heard=0,quiet=0,buf=new Uint8Array(an.fftSize);$('#kMsg').textContent=t('kListening');$('#kTalk').classList.add('rec');bot.classList.add('listen');
  rec.start();var hard=setTimeout(function(){if(rec&&rec.state==='recording')rec.stop()},8500);
  (function vad(){if(!rec||rec.state!=='recording')return;an.getByteTimeDomainData(buf);var m=0;for(var i=0;i<buf.length;i++)m=Math.max(m,Math.abs(buf[i]-128));if(m>18){heard=Date.now();quiet=0}var el=Date.now()-started;
   if(el>8000||(heard&&Date.now()-heard>1300&&el>900)||(!heard&&el>6000)){rec.stop();return}requestAnimationFrame(vad)})();
  rec.onstop=function(){clearTimeout(hard);$('#kTalk').classList.remove('rec');bot.classList.remove('listen');stopMic();var blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});chunks=[];
   blob.arrayBuffer().then(function(ab){return new Promise(function(r,j){ac.decodeAudioData(ab,r,j)})}).then(function(b){playBack(b)}).catch(function(){kBusy=false;$('#kMsg').textContent=t('kTalk')})};
  }).catch(function(){kBusy=false;$('#kMsg').textContent=t('kMicNo');sfx('hmm')})}
function playBack(b){var ac=A(),s=ac.createBufferSource(),an=ac.createAnalyser(),g=ac.createGain(),bot=$('#kBot'),mouth=bot.querySelector('.b-mouth');s.buffer=b;s.playbackRate.value=1.7;an.fftSize=256;g.gain.value=1.2;
 // light robot sparkle: tremolo
 var lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=30;lg.gain.value=.25;lfo.connect(lg).connect(g.gain);
 s.connect(g);g.connect(an);an.connect(ac.destination);$('#kMsg').textContent='🎶';bot.classList.add('talk');var d=new Uint8Array(an.fftSize),on=true;
 (function mv(){if(!on)return;an.getByteTimeDomainData(d);var m=0;for(var i=0;i<d.length;i++)m=Math.max(m,Math.abs(d[i]-128));if(mouth)mouth.style.transform='scaleY('+(1+Math.min(5,m/12))+')';requestAnimationFrame(mv)})();
 s.onended=function(){on=false;lfo.stop();if(mouth)mouth.style.transform='';bot.classList.remove('talk');kBusy=false;$('#kMsg').textContent=t('kTalk');happy(bot);sfx('chirp')};sfx('chirp');setTimeout(function(){lfo.start();s.start()},250)}
// parent lock: long-press 1.5 s reveals keypad
function lockBtn(){var b=$('#kLock'),tm=null;var go=function(){b.classList.remove('hold');pinOpen('unlock',function(ok){if(ok){kidsOff();try{history.back()}catch(e){}}})};
 b.addEventListener('pointerdown',function(){b.classList.add('hold');tm=setTimeout(go,1500)});['pointerup','pointerleave','pointercancel'].forEach(function(e){b.addEventListener(e,function(){clearTimeout(tm);b.classList.remove('hold')})});
 b.addEventListener('click',function(e){e.preventDefault();F.toast(t('pinHintLP'),2500)});b.addEventListener('contextmenu',function(e){e.preventDefault()})}
// native Android back button
(function(){var C=window.Capacitor,App=C&&C.Plugins&&C.Plugins.App;if(!App||!App.addListener)return;App.addListener('backButton',function(e){if(K.on)return;if(e&&e.canGoBack)history.back();else App.exitApp()})})();
// ---------- init
function init(){mount($('#kBot'));
$('#kBot').addEventListener('tapbot',function(){});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!K.on||$('#pinDlg').classList.contains('hidden')===false)pinClose()}});
 $$('.wseg button').forEach(function(b){b.onclick=function(){if(b.dataset.f!==cur)show(b.dataset.f)}});
 $('#wNext').onclick=function(){show(cur,1)};
 $('#wLis').onclick=function(){if(lis.a)speak(lis.a[0],lis.a[1])};$('#wLisEx').onclick=function(){if(lis.b)speak(lis.b[0],lis.b[1])};
 $('#wGear').onclick=function(){F.openSettings&&F.openSettings('walle')};
 $('#wRetry').onclick=gate;
 $('#wWL').onchange=function(){CFG.wl=$('#wWL').value;save();if(greeted&&cur==='word')show('word')};$('#wLv').onchange=function(){CFG.lv=$('#wLv').value;save();if(greeted&&cur==='word')show('word')};$('#wPL').onchange=function(){CFG.pl=$('#wPL').value;save();if(greeted&&cur==='phrase')show('phrase')};
 $$('nav button').forEach(function(b){b.addEventListener('click',function(){if(b.dataset.t==='walle')gate()})});
 $('#kidsGo').onclick=function(){if(!K.h)pinOpen('set',function(ok){if(ok)kidsOn()});else kidsOn()};
 $('#kTalk').onclick=talk;lockBtn();
 $('#pinPad').innerHTML=['1','2','3','4','5','6','7','8','9','','0','del'].map(function(k){return k?'<button type="button" data-k="'+k+'" aria-label="'+(k==='del'?'⌫':k)+'">'+(k==='del'?'⌫':k)+'</button>':'<span></span>'}).join('');
 $$('#pinPad button').forEach(function(b){b.onclick=function(){key(b.dataset.k)}});
 document.addEventListener('keydown',function(e){if($('#pinDlg').classList.contains('hidden')||!$('#pinChk').classList.contains('hidden'))return;if(/^\d$/.test(e.key))key(e.key);else if(e.key==='Backspace')key('del')});
 $('#pinX').onclick=pinClose;$('#pinF').onclick=forgot;$('#pinChkGo').onclick=chkGo;
 $('#pinChg').onclick=function(){if(!K.h)pinOpen('set');else pinOpen('change')};
 F.onLang(function(){fillSel();if(greeted)show(cur);$('#wGear').setAttribute('aria-label',t('sWalle'));renderRem();$('#pinChg').textContent=K.h?t('pinChange'):t('pinSet');if(K.on)$('#kMsg').textContent=t('kTalk')});fillSel();renderRem();$('#pinChg').textContent=K.h?t('pinChange'):t('pinSet');
 if(K.on){document.body.classList.add('kidsmode');$('#kids').classList.remove('hidden');try{history.pushState({kids:1},'')}catch(e){}}
 if($('#tab-walle').classList.contains('active'))gate()}
init();
window.Walle={speak:speak,sfx:sfx,act:act};
})();
