'use strict';
/** V967 AWS Lambda Alexa Custom Skill. Only install on Lambda with an Alexa Skills Kit
 * trigger with Skill ID verification ENABLED. Never expose this handler via Vercel HTTP.
 * The Lambda REST call is HMAC authenticated; the Lambda never holds Spotify tokens or accesses Spotify or hardware directly.
 */
const {createHmac,randomUUID}=require('node:crypto');
const voiceV1008=require('./voice-v1008.cjs');
const ACTIONS={
 LikeArtistIntent:'artist-follow',UnlikeArtistIntent:'artist-unfollow',
 ArenaIntent:'arena',FestivalIntent:'festival',ClubIntent:'club',CalmIntent:'calm',
 StopShowIntent:'stop',VirtualFxOnIntent:'fx-on',VirtualFxOffIntent:'fx-off',
 StageZoneIntent:'zone-stage',BackdropZoneIntent:'zone-backdrop',AudienceZoneIntent:'zone-audience',AllZonesIntent:'zone-all',
 WarmMoodIntent:'mood-warm',CoolMoodIntent:'mood-cool',NeonMoodIntent:'mood-neon',AutoMoodIntent:'mood-auto',
 BeamsEffectIntent:'effect-beams',FogEffectIntent:'effect-fog',ConfettiEffectIntent:'effect-confetti',
 StreamersEffectIntent:'effect-streamers',AutoEffectIntent:'effect-auto',EffectsOffIntent:'effect-off',
 RapPresetIntent:'preset-rap',HardtekkPresetIntent:'preset-hardtekk',RockPresetIntent:'preset-rock',
 CinemaPresetIntent:'preset-cinema',AutoPresetIntent:'preset-auto',
 GoveeArenaIntent:'govee-arena',GoveeFestivalIntent:'govee-festival',
 GoveeClubIntent:'govee-club',GoveeCalmIntent:'govee-calm',
 GoveeDimIntent:'govee-dim',GoveeAutoIntent:'govee-auto'
};
const labels={'artist-follow':'Künstler folgen','artist-unfollow':'Künstler entfolgen',arena:'Arena',festival:'Festival',club:'Club',calm:'ruhige Konzertatmosphäre',
 stop:'gestoppte Konzertautomatik','fx-on':'virtuelle Effekte','fx-off':'virtuelle Effekte aus',
 'zone-stage':'Bühnenbeleuchtung','zone-backdrop':'LED-Hintergrund','zone-audience':'Publikumsbeleuchtung','zone-all':'gesamte Bühne',
 'mood-warm':'warme Lichtstimmung','mood-cool':'kühle Lichtstimmung','mood-neon':'Neon-Lichtstimmung','mood-auto':'automatische Lichtfarben',
 'effect-beams':'virtuelle Lichtkegel','effect-fog':'virtueller Nebel','effect-confetti':'virtuelles Konfetti',
 'effect-streamers':'virtuelle Luftschlangen','effect-auto':'automatische Bühneneffekte','effect-off':'abgeschaltete Zusatzeffekte',
 'preset-rap':'filmische Deutschrap Konzertkulisse','preset-hardtekk':'Hardtekk-Reaktor',
 'preset-rock':'Rock-Arena','preset-cinema':'Cinematic-Night-Atmosphäre','preset-auto':'Smart-Konzertautomatik',
 'govee-arena':'Govee-Arena-Lichtstimmung','govee-festival':'Govee-Festival-Lichtstimmung',
 'govee-club':'Govee-Club-Lichtstimmung','govee-calm':'ruhiges Govee-Raumlicht',
 'govee-dim':'gedämpftes Govee-Raumlicht','govee-auto':'Govee-Musikautomatik'};
function reply(text,shouldEndSession=true){
 return {version:'1.0',response:{outputSpeech:{type:'PlainText',text},shouldEndSession}};
}
function validEndpoint(raw){
 try{const url=new URL(raw);
  return url.protocol==='https:'&&url.username===''&&url.password===''&&
   !['localhost','127.0.0.1','0.0.0.0','::1'].includes(url.hostname)&&
   url.port===''&&url.pathname==='/'&&url.search===''&&url.hash==='';}
 catch{return false;}
}
async function handler(event){
 const skill=process.env.ALEXA_SKILL_ID||'';
 const allowed=process.env.ALEXA_ALLOWED_USER_ID||'';
 const secret=process.env.ALEXA_BRIDGE_SECRET||'';
 const origin=process.env.SONIC_DISPLAY_ORIGIN||'';
 const incomingSkill=event?.session?.application?.applicationId||event?.context?.System?.application?.applicationId;
 const incomingUser=event?.session?.user?.userId||event?.context?.System?.user?.userId;
 const now=Date.now();
 const time=Date.parse(event?.request?.timestamp||'');
 if(!skill.startsWith('amzn1.ask.skill.')||!allowed||secret.length<32||!validEndpoint(origin))
  return reply('Die Sonic Display Alexa Verbindung ist noch nicht vollständig eingerichtet.');
 if(incomingSkill!==skill||incomingUser!==allowed||!Number.isFinite(time)||Math.abs(now-time)>150000)
  return reply('Für diese Alexa Identität ist Sonic Display nicht freigeschaltet.');
 if(event?.request?.type==='LaunchRequest')return reply('Sonic Display ist bereit. Sage zum Beispiel: starte den Festivalmodus.',false);
 const intent=event?.request?.intent?.name;
 if(event?.request?.type!=='IntentRequest')return reply('Sonic Display unterstützt Konzertmodi und virtuelle Effekte.');
 if(intent==='AllCommandsIntent')return reply('Alle Sprachbefehle findest du in Sonic Display unter Einstellungen, Alexa, Alexa-Hilfe. Dort kannst du auch nach Befehlen suchen. Du kannst Konzertmodi, Bühnenbereiche, virtuelle Effekte, Govee-Raumlicht, Künstler und die Anzeige steuern.',false);
 if(intent==='AMAZON.HelpIntent')return reply('Die vollständige Befehlsliste findest du auf dem Display in Einstellungen, Alexa, Alexa-Hilfe. Du kannst auch sagen: bitte like den Künstler, bitte allen Künstlern folgen, folge ich diesem Künstler schon oder letzte Künstleraktion rückgängig. Für die Anzeige: Lyrics ausblenden, Avatar wechseln oder ruhige Darstellung. Sage zum Beispiel: starte Festival, beleuchte das Publikum, aktiviere Neon, zeige virtuellen Nebel starte den Hardtekk-Reaktor, aktiviere die Rock-Arena, nutze Govee Festival Raumlicht oder beende die Konzertautomatik.',false);
 if(intent==='AMAZON.CancelIntent'||intent==='AMAZON.StopIntent')return reply('Bis bald.');
 if(voiceV1008.COMMANDS[intent]||voiceV1008.CHOICES[intent]||intent==='SelectArtistIntent'||intent==='LastVoiceResultIntent')return voiceV1008.runVoiceV1008(event,{origin,secret});
 if(intent==='StatusIntent')return reply('Der Alexa Skill ist eingerichtet. Ob das Display den nächsten Befehl übernimmt, siehst du im Konzertstudio.');
 if(!Object.hasOwn(ACTIONS,intent))return reply('Diesen Bühnenbefehl kenne ich noch nicht.');
 const raw=JSON.stringify({command:ACTIONS[intent]});
 const stamp=String(now),nonce=randomUUID();
 const sig=createHmac('sha256',secret).update(`${stamp}.${nonce}.${raw}`).digest('hex');
 try{
  const result=await fetch(new URL('/api/alexa/command',origin),{
   method:'POST',headers:{'Content-Type':'application/json','x-sonic-timestamp':stamp,
    'x-sonic-nonce':nonce,'x-sonic-signature':sig},body:raw,signal:AbortSignal.timeout(4500)});
  if(!result.ok)return reply('Sonic Display konnte den Befehl nicht annehmen. Bitte prüfe die Verbindung.');
  const response=await result.json();
  if(response?.queued!==true)return reply('Sonic Display hat den Befehl nicht bestätigt.');
  if(ACTIONS[intent]==='artist-follow'||ACTIONS[intent]==='artist-unfollow')return reply('Die Künstleranfrage wurde an dein Sonic Display gesendet. Das geöffnete Display führt sie bei freigegebener Künstlersteuerung aus und zeigt den bestätigten Spotify-Status.');
  return reply(`${labels[ACTIONS[intent]]} wurde an Sonic Display gesendet. Das Display übernimmt den Befehl nur bei entsprechender Freigabe und aktiver Verbindung.`);
 }catch{return reply('Sonic Display ist gerade nicht erreichbar.');}
}
exports.handler=handler;
exports._internals={ACTIONS,validEndpoint,reply};
