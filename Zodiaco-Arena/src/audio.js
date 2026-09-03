const ambientNotes=[220,293.66,329.63,440,392,329.63,261.63,293.66];

export function createZodiacAudio(){
 let context=null,master=null,ambientTimer=null,step=0,enabled=true;

 function ensure(){
  if(typeof window==="undefined")return null;
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return null;
  if(!context){context=new AudioContextClass();master=context.createGain();master.gain.value=.7;master.connect(context.destination)}
  if(context.state==="suspended")context.resume().catch(()=>{});
  return context;
 }

 function note(frequency,duration=.35,volume=.035,type="sine",delay=0){
  const c=ensure();if(!c||!enabled)return;
  const oscillator=c.createOscillator(),gain=c.createGain(),start=c.currentTime+delay;
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.035);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  oscillator.connect(gain);gain.connect(master);oscillator.start(start);oscillator.stop(start+duration+.03);
 }

 function ambientPulse(){
  if(!enabled)return;
  const root=ambientNotes[step%ambientNotes.length];step++;
  note(root,1.45,.014,"sine");note(root*1.5,1.1,.009,"triangle",.16);note(root*2, .7,.006,"sine",.44);
 }

 function startAmbient(){
  if(!enabled||ambientTimer)return;
  if(!ensure())return;
  ambientPulse();ambientTimer=setInterval(ambientPulse,1850);
 }

 function stopAmbient(){if(ambientTimer)clearInterval(ambientTimer);ambientTimer=null}

 function play(kind="select"){
  if(!enabled)return;startAmbient();
  if(kind===true||kind==="correct"){note(523.25,.18,.055,"triangle");note(659.25,.24,.045,"triangle",.09);note(783.99,.34,.04,"sine",.18);return}
  if(kind===false||kind==="wrong"){note(196,.22,.05,"sawtooth");note(146.83,.34,.035,"triangle",.12);return}
  if(kind==="reveal"){note(293.66,.5,.028,"sine");note(440,.7,.025,"sine",.13);note(587.33,.9,.02,"triangle",.28);return}
  if(kind==="battle"){note(164.81,.12,.05,"square");note(246.94,.2,.045,"triangle",.08);return}
  note(392,.1,.026,"triangle");note(523.25,.14,.018,"sine",.055);
 }

 function setEnabled(value){enabled=!!value;if(!enabled)stopAmbient();else if(context)startAmbient()}
 function destroy(){stopAmbient();context?.close().catch(()=>{});context=null;master=null}
 return{destroy,play,setEnabled,startAmbient,stopAmbient};
}
