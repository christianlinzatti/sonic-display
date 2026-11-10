'use strict';
const {createHmac,randomUUID}=require('node:crypto');
const COMMANDS={LikeArtistIntent:'artist-follow',UnlikeArtistIntent:'artist-unfollow',FollowAllArtistsIntent:'artist-follow-all',ArtistStatusIntent:'artist-status',UndoArtistIntent:'artist-undo',
 FollowPrimaryArtistIntent:'artist-follow-primary',UnfollowPrimaryArtistIntent:'artist-unfollow-primary',LyricsOnIntent:'lyrics-on',LyricsOffIntent:'lyrics-off',NextAvatarIntent:'avatar-next',CalmDisplayIntent:'display-calm',NormalDisplayIntent:'display-normal',GoveePowerOnIntent:'govee-power-on',GoveePowerOffIntent:'govee-power-off',GoveeFixtureOnIntent:'govee-power-on',GoveeFixtureOffIntent:'govee-power-off',GoveeGroupOnIntent:'govee-power-on',GoveeGroupOffIntent:'govee-power-off',GoveeMusicSyncStartIntent:'govee-sync-start',GoveeMusicSyncPauseIntent:'govee-sync-pause',FullConcertStartIntent:'concert-show-start',FullConcertStopIntent:'concert-show-stop',ConcertSceneCalmIntent:'concert-scene-calm',ConcertSceneIntenseIntent:'concert-scene-intense',ConcertSceneFinaleIntent:'concert-scene-finale',GoveeBrightnessIntent:'govee-brightness',GoveeColorIntent:'govee-color',StatusIntent:'connection-status'};
const CHOICES={SelectFirstArtistIntent:1,SelectSecondArtistIntent:2,SelectThirdArtistIntent:3};
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9]{10,32}$/.test(v);
function validSelection(v){return v?.kind==='selection'&&['artist-follow','artist-unfollow','artist-status'].includes(v.action)&&id(v.trackId)&&Array.isArray(v.choices)&&v.choices.length>=2&&v.choices.length<=10&&v.choices.every(c=>id(c?.id)&&typeof c.name==='string'&&c.name.length<=120)&&typeof v.text==='string'&&v.text.length<=1200;}
function output(result){
 if(result?.kind==='selection'&&validSelection(result))return {version:'1.0',sessionAttributes:{voiceArtistSelection:result},response:{outputSpeech:{type:'PlainText',text:result.text},reprompt:{outputSpeech:{type:'PlainText',text:'Sage zum Beispiel Nummer eins oder Nummer zwei.'}},shouldEndSession:false}};
 const text=result&&['complete','error'].includes(result.kind)&&typeof result.text==='string'&&result.text.length<=1200?result.text:'Die Anfrage wurde gesendet. Sobald das Display sie verarbeitet hat, kannst du nach dem letzten Ergebnis fragen.';
 return {version:'1.0',sessionAttributes:{},response:{outputSpeech:{type:'PlainText',text},shouldEndSession:true}};
}
async function runVoiceV1008(event,{origin,secret,fetcher=fetch,clock=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms))}){
 const deadline=clock()+6000;const intent=event?.request?.intent?.name;
 const send=async(body)=>{
  const raw=JSON.stringify(body),stamp=String(clock()),nonce=randomUUID();
  const signature=createHmac('sha256',secret).update(`${stamp}.${nonce}.${raw}`).digest('hex');
  const r=await fetcher(new URL('/api/alexa/voice',origin),{method:'POST',headers:{'Content-Type':'application/json','x-sonic-timestamp':stamp,'x-sonic-nonce':nonce,'x-sonic-signature':signature},body:raw,signal:AbortSignal.timeout(Math.max(1,Math.min(1800,deadline-clock())))});
  if(!r.ok)throw Error('Relay unavailable');return r.json();
 };
 try{
  if(intent==='LastVoiceResultIntent'){const data=await send({read:'latest'});return data.result?output(data.result):output({kind:'error',text:'Noch kein Ergebnis verfügbar. Prüfe, ob dein Display sichtbar geöffnet und mit Spotify verbunden ist.'});}
  let command=COMMANDS[intent],target,goveeTarget,goveeLook;
  if(intent==='GoveeBrightnessIntent'){
   const raw=String(event?.request?.intent?.slots?.GoveeBrightness?.value??'');
   if(!/^(?:[1-9]|[1-9][0-9]|100)$/.test(raw))return output({kind:'error',text:'Bitte eine Helligkeit von eins bis einhundert Prozent angeben.'});
   goveeLook={brightness:Number(raw)};
  }
  if(intent==='GoveeColorIntent'){
   const raw=String(event?.request?.intent?.slots?.GoveeColor?.value||'').trim().toLocaleLowerCase('de-DE');
   const accepted={rot:'red',blau:'blue',grün:'green',gruen:'green',violett:'violet',lila:'violet',türkis:'cyan',tuerkis:'cyan',orange:'amber',weiß:'white',weiss:'white',warmweiß:'warmwhite',warmweiss:'warmwhite'};
   const color=Object.hasOwn(accepted,raw)?accepted[raw]:undefined;
   if(!color)return output({kind:'error',text:'Bitte Rot, Blau, Grün, Violett, Türkis, Orange, Weiß oder Warmweiß wählen.'});
   goveeLook={color};
  }
  if(['GoveeFixtureOnIntent','GoveeFixtureOffIntent'].includes(intent)){
   const value=String(event?.request?.intent?.slots?.FixtureNumber?.value||'');
   const number=Number(value);
   if(!/^[1-4]$/.test(value)||!Number.isSafeInteger(number))return output({kind:'error',text:'Bitte eine Govee-Lampe von eins bis vier angeben.'});
   goveeTarget={fixtureNumber:number};
  }
  if(['GoveeGroupOnIntent','GoveeGroupOffIntent'].includes(intent)){
   const value=String(event?.request?.intent?.slots?.GoveeZone?.value||'').trim().toLocaleLowerCase('de-DE');
   const groups={bühne:'wall',buehne:'wall',bühnenlicht:'wall',wand:'wall',ambient:'ambient',hintergrund:'ambient',neon:'neon',rhythmus:'rhythm',rhythm:'rhythm',bass:'rhythm'};
   const groupRole=groups[value];
   if(!groupRole)return output({kind:'error',text:'Diese Lichtgruppe kenne ich nicht. Nutze Bühne, Ambient, Neon oder Rhythmus.'});
   goveeTarget={groupRole};
  }
  if(intent==='SelectArtistIntent'||CHOICES[intent]){
   let selection=event?.session?.attributes?.voiceArtistSelection;
   if(!validSelection(selection))selection=(await send({read:'latest'})).result;
   if(!validSelection(selection))return output({kind:'error',text:'Bitte frage zuerst nach dem aktuellen Künstler. Danach kannst du eine Nummer auswählen.'});
   const raw=event?.request?.intent?.slots?.ArtistNumber?.value;
   const number=CHOICES[intent]||(typeof raw==='string'&&/^\d+$/.test(raw)?Number(raw):0);
   if(!Number.isSafeInteger(number)||number<1||number>selection.choices.length)return output(selection);
   command=selection.action;target={artistId:selection.choices[number-1].id,trackId:selection.trackId};
  }
  if(!command)return null;
  const queued=await send({command,...(target?{target}:{}),...(goveeTarget?{goveeTarget}:{}),...(goveeLook?{goveeLook}:{})});
  if(queued.queued!==true)return output({kind:'error',text:'Sonic Display hat die Anfrage nicht angenommen.'});
  if(typeof queued.id!=='string')return output(null);
  for(let tries=0;tries<12&&clock()<deadline-100;tries++){
   const data=await send({read:queued.id});if(data.result)return output(data.result);
   if(clock()<deadline-350)await sleep(250);
  }
  return output(null);
 }catch{return output({kind:'error',text:'Sonic Display ist gerade nicht erreichbar oder noch nicht fertig. Frage später nach dem letzten Ergebnis und prüfe die Verbindung auf dem Display.'});}
}
exports.COMMANDS=COMMANDS;exports.CHOICES=CHOICES;exports.runVoiceV1008=runVoiceV1008;exports.validSelection=validSelection;
