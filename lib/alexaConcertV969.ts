/** V969 – fixed Alexa Skill commands for complete VIRTUAL concert looks.
 * No free-text commands, playback or external hardware control. */
import type {ConcertSettingsV958,ConcertPresetIdV969} from './ultimateConcertRoadmapV958';
import {selectSmartConcertPresetV969} from './smartConcertPresetsV969';
import {ALEXA_CONCERT_COMMANDS_V968,isAlexaConcertCommandV968,
 canApplyAlexaCommandV968,applyAlexaConcertCommandV968,
 ALEXA_CONCERT_MESSAGES_V968} from './alexaConcertV968';

export const ALEXA_CONCERT_COMMANDS_V969=[...ALEXA_CONCERT_COMMANDS_V968,
 'preset-rap','preset-hardtekk','preset-rock','preset-cinema','preset-auto'] as const;
export type AlexaConcertCommandV969=(typeof ALEXA_CONCERT_COMMANDS_V969)[number];
export type AlexaQueuedCommandV969=Readonly<{id:string;command:AlexaConcertCommandV969;createdAt:number}>;
export function isAlexaConcertCommandV969(command:unknown):command is AlexaConcertCommandV969{
 return typeof command==='string'&&(ALEXA_CONCERT_COMMANDS_V969 as readonly string[]).includes(command);
}
export function canApplyAlexaCommandV969(raw:unknown,enabledSince:number,now:number):raw is AlexaQueuedCommandV969{
 if(!raw||typeof raw!=='object')return false;
 const msg=raw as Partial<AlexaQueuedCommandV969>;
 if(isAlexaConcertCommandV968(msg.command))return canApplyAlexaCommandV968(raw,enabledSince,now);
 return typeof msg.id==='string'&&/^[\da-f-]{36}$/i.test(msg.id)&&
  isAlexaConcertCommandV969(msg.command)&&typeof msg.createdAt==='number'&&
  Number.isSafeInteger(msg.createdAt)&&Number.isSafeInteger(enabledSince)&&Number.isSafeInteger(now)&&
  msg.createdAt>=enabledSince-1000&&msg.createdAt<=now+5000&&now-msg.createdAt<=75000;
}
const presetCommands:Partial<Record<AlexaConcertCommandV969,ConcertPresetIdV969>>={
 arena:'arena',festival:'festival',club:'club',calm:'cinematic',
 'preset-rap':'cinematic','preset-hardtekk':'hardtekk','preset-rock':'rock',
 'preset-cinema':'cinematic','preset-auto':'auto'
};
export function applyAlexaConcertCommandV969(settings:ConcertSettingsV958,command:AlexaConcertCommandV969):ConcertSettingsV958{
 const selection=presetCommands[command];
 if(selection){
  const prior=isAlexaConcertCommandV968(command)?applyAlexaConcertCommandV968(settings,command):settings;
  return selectSmartConcertPresetV969(prior,selection);
 }
 if(command==='stop')return {...applyAlexaConcertCommandV968(settings,command),concertPresetV969:'off'};
 if(isAlexaConcertCommandV968(command))return applyAlexaConcertCommandV968(settings,command);
 // exhaustive denylist fallback, normally unreachable after the strict command validation
 return settings;
}
export const ALEXA_CONCERT_MESSAGES_V969:Readonly<Record<AlexaConcertCommandV969,string>>={
 ...ALEXA_CONCERT_MESSAGES_V968,
 'preset-rap':'filmische Deutschrap-Kulisse','preset-hardtekk':'Hardtekk-Reaktor',
 'preset-rock':'Rock-Arena','preset-cinema':'Cinematic-Night-Konzert','preset-auto':'genreabhängige Smart-Show'
};
