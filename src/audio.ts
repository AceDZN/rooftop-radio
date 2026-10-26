export class RadioAudio {
  muted=false;private context:AudioContext|null=null;private wind:GainNode|null=null;private windOn=false;
  unlock(){if(!this.context){this.context=new AudioContext();const c=this.context,noise=c.createBuffer(1,c.sampleRate,c.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=c.createBufferSource(),filter=c.createBiquadFilter();source.buffer=noise;source.loop=true;filter.type='bandpass';filter.frequency.value=700;filter.Q.value=.6;this.wind=c.createGain();this.wind.gain.value=0;source.connect(filter);filter.connect(this.wind);this.wind.connect(c.destination);source.start();}if(this.context.state==='suspended')void this.context.resume();}
  flight(gliding:boolean){const active=gliding&&!this.muted;if(active!==this.windOn&&this.context&&this.wind){this.windOn=active;this.wind.gain.setTargetAtTime(active?.028:0,this.context.currentTime,.16);}}
  tone(type:'jump'|'land'|'tune'|'success'|'recover'){
    if(this.muted||!this.context)return;const c=this.context,now=c.currentTime;
    const notes=type==='success'?[392,494,587,784]:type==='tune'?[440,660]:type==='jump'?[240,360]:type==='recover'?[310,220]:[100];
    notes.forEach((n,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=type==='land'?'sine':'triangle';o.frequency.setValueAtTime(n,now+i*.085);g.gain.setValueAtTime(0,now+i*.085);g.gain.linearRampToValueAtTime(type==='land'?.13:.045,now+i*.085+.012);g.gain.exponentialRampToValueAtTime(.001,now+i*.085+.22);o.connect(g);g.connect(c.destination);o.start(now+i*.085);o.stop(now+i*.085+.25);});
  }
}
