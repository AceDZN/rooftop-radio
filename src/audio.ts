export class RadioAudio {
  private _muted=false;
  musicVolume=.72;effectsVolume=.75;windVolume=.20;
  musicReady=false;musicError='';
  private context:AudioContext|null=null;
  private music:GainNode|null=null;
  private effects:GainNode|null=null;
  private wind:GainNode|null=null;
  private gliding=false;private reading=false;
  get muted(){return this._muted;}
  set muted(value:boolean){this._muted=value;this.applyMix();}
  unlock(){
    if(!this.context){
      const c=this.context=new AudioContext();
      this.music=c.createGain();this.music.gain.value=0;this.music.connect(c.destination);
      this.effects=c.createGain();this.effects.connect(c.destination);
      this.wind=c.createGain();this.wind.gain.value=0;this.wind.connect(c.destination);
      // Wind is a quiet movement accent, never the background soundtrack.
      const noise=c.createBuffer(1,c.sampleRate,c.sampleRate),data=noise.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      const source=c.createBufferSource(),filter=c.createBiquadFilter();source.buffer=noise;source.loop=true;
      filter.type='bandpass';filter.frequency.value=190;filter.Q.value=.5;source.connect(filter);filter.connect(this.wind);source.start();
      void this.loadScore();this.applyMix();
    }
    if(this.context.state==='suspended')void this.context.resume();
  }
  private async loadScore(){
    try{
      const response=await fetch(new URL('./audio/rooftop-daylight.ogg',document.baseURI));
      if(!response.ok)throw Error(`Music ${response.status}`);
      const buffer=await this.context!.decodeAudioData(await response.arrayBuffer());
      const source=this.context!.createBufferSource();source.buffer=buffer;source.loop=true;source.loopEnd=buffer.duration;
      source.connect(this.music!);source.start();this.musicReady=true;this.applyMix();
    }catch(error){this.musicError=String(error);}
  }
  private applyMix(){
    if(!this.context)return;const now=this.context.currentTime;
    this.music?.gain.setTargetAtTime(this._muted?0:this.musicVolume*(this.reading?.52:1),now,.22);
    this.effects?.gain.setTargetAtTime(this._muted?0:this.effectsVolume,now,.03);
    this.wind?.gain.setTargetAtTime(this._muted||!this.gliding?0:this.windVolume*.012,now,.15);
  }
  setVolume(channel:'music'|'effects'|'wind',value:number){
    this[`${channel}Volume`]=Math.max(0,Math.min(1,value));this.applyMix();
  }
  flight(gliding:boolean,reading=false){if(gliding!==this.gliding||reading!==this.reading){this.gliding=gliding;this.reading=reading;this.applyMix();}}
  diagnostics(){return {ready:this.musicReady,muted:this.muted,context:this.context?.state??'locked',musicVolume:this.musicVolume,effectsVolume:this.effectsVolume,windVolume:this.windVolume,error:this.musicError};}
  tone(type:'jump'|'land'|'bounce'|'tune'|'success'|'recover'|'note'|'burst'){
    if(this.muted||!this.context||!this.effects)return;const c=this.context,now=c.currentTime;
    const notes=type==='note'?[659,880]:type==='burst'?[196,392,784]:type==='success'?[392,494,587,784]:type==='tune'?[440,659]:type==='bounce'?[440,554,659]:type==='jump'?[294,440]:type==='recover'?[330,294]:[100];
    notes.forEach((n,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=type==='land'?'sine':'triangle';o.frequency.setValueAtTime(n,now+i*.075);g.gain.setValueAtTime(0,now+i*.075);g.gain.linearRampToValueAtTime(type==='land'?.13:.065,now+i*.075+.012);g.gain.exponentialRampToValueAtTime(.001,now+i*.075+.20);o.connect(g);g.connect(this.effects!);o.start(now+i*.075);o.stop(now+i*.075+.23);});
  }
}
