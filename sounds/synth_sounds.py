# FocusPlay built-in sounds — synthesized from scratch (no samples), released as CC0 by the author.
import numpy as np, wave, subprocess, os
SR=44100; rng=np.random.default_rng(7)
def T(d): return np.arange(int(SR*d))/SR
def env(t,a=0.005,dec=1.0): return np.minimum(t/a,1)*np.exp(-t/dec)
def tone(f,d,dec,partials=((1,1),),a=0.005):
    t=T(d); return sum(amp*np.sin(2*np.pi*f*m*t) for m,amp in partials)*env(t,a,dec)
def place(buf,x,at):
    i=int(at*SR); buf[i:i+len(x)]+=x[:len(buf)-i]
def out(name,dur,parts):
    b=np.zeros(int(SR*dur))
    for x,at in parts: place(b,x,at)
    fade=int(.05*SR); b[-fade:]*=np.linspace(1,0,fade)
    b=b/np.max(np.abs(b))*0.7
    pcm=(b*32767).astype('<i2')
    with wave.open(name+'.wav','wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',name+'.wav','-c:a','libvorbis','-q:a','4',name+'.ogg'])
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',name+'.wav','-c:a','libmp3lame','-b:a','96k',name+'.mp3'])
def ks(f,d,damp=.996):  # Karplus-Strong pluck
    n=int(SR/f); buf=rng.uniform(-1,1,n); o=np.zeros(int(SR*d))
    for i in range(len(o)):
        o[i]=buf[i%n]; buf[i%n]=damp*.5*(buf[i%n]+buf[(i+1)%n])
    return o*env(T(d),.002,d)
# 1 soft chime (same as the original in-app chime: C5 E5 G5)
out('soft_chime',2.0,[(tone(f,1.8,.45),i*.25) for i,f in enumerate([523.25,659.25,783.99])])
# 2 bubble pop: rising sine blips
def bub(f0,f1,d=.09):
    t=T(d); ph=2*np.pi*np.cumsum(np.linspace(f0,f1,len(t)))/SR; return np.sin(ph)*env(t,.003,.03)
out('bubble_pop',0.7,[(bub(400,1200),0),(bub(600,1600),.16),(bub(500,1400,.12),.34)])
# 3 wind chimes: inharmonic bells, random timing
bell=((1,1),(2.76,.4),(5.4,.2),(8.93,.08))
out('wind_chimes',2.0,[(tone(f,1.6,.5,bell),at) for f,at in [(1046,0),(1318,.18),(1568,.33),(1175,.55),(1760,.7),(1397,.9)]])
# 4 music box: bright plucked high notes
mb=((1,1),(2,.3),(3,.15),(4.2,.08))
out('music_box',1.8,[(tone(f,1.2,.35,mb,.002),i*.22) for i,f in enumerate([1568,1976,2349,1976,2637])])
# 5 kitten bell: tiny jingle bell with shimmer
def jingle(d=.35):
    t=T(d); x=sum(a*np.sin(2*np.pi*f*t) for f,a in [(2900,1),(4100,.6),(5300,.4),(6800,.25)])
    return x*env(t,.002,.08)*(1+.3*np.sin(2*np.pi*28*t))
out('kitten_bell',0.9,[(jingle(),at) for at in (0,.09,.2,.36)])
# 6 gentle harp: plucked arpeggio
out('gentle_harp',2.0,[(ks(f,1.4),i*.13) for i,f in enumerate([392,493.88,587.33,783.99])])
# 7 raindrop: falling-pitch plinks
def drop(f):
    d=.15;t=T(d); ph=2*np.pi*np.cumsum(f*(1+1.5*np.exp(-t/.01)))/SR; return np.sin(ph)*env(t,.001,.04)
out('raindrop',0.9,[(drop(f),at) for f,at in [(1400,0),(1100,.17),(1700,.3),(1250,.52)]])
# 8 marimba: warm wooden mallet
mar=((1,1),(3.93,.25),(9.2,.05))
out('marimba',1.4,[(tone(f,.9,.22,mar,.002),at) for f,at in [(523.25,0),(659.25,.18),(783.99,.36),(1046.5,.6)]])
