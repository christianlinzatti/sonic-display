'use strict';
/** Official Govee LAN UDP commands. No third-party dependency, no cloud access. */
const net = require('node:net');
const SCAN_ADDRESS = '239.255.255.250';
const SCAN_PORT = 4001;
const REPLY_PORT = 4002;
const COMMAND_PORT = 4003;

function isPrivateIPv4(ip) {
  if (typeof ip !== 'string' || net.isIP(ip) !== 4) return false;
  const p = ip.split('.').map(Number);
  return p[0] === 10 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168);
}
function integer(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new TypeError(`Expected number ${min}..${max}`);
  }
  return Math.round(value);
}
function rgb(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('RGB must be an object');
  return {r:integer(value.r,0,255),g:integer(value.g,0,255),b:integer(value.b,0,255)};
}
function message(cmd, data) { return Buffer.from(JSON.stringify({msg:{cmd,data}}),'utf8'); }
function scan() { return message('scan',{account_topic:'reserve'}); }
function status() { return message('devStatus',{}); }
function command(action, value) {
  if (action === 'power') {
    if (typeof value !== 'boolean') throw new TypeError('power requires a boolean');
    return [message('turn',{value:value ? 1 : 0})];
  }
  if (action === 'brightness') return [message('brightness',{value:integer(value,1,100)})];
  if (action === 'color') return [message('colorwc',{color:rgb(value),colorTemInKelvin:0})];
  if (action === 'temperature') return [message('colorwc',{color:{r:0,g:0,b:0},colorTemInKelvin:integer(value,2000,9000)})];
  if (action === 'look') {
    if (!value || typeof value !== 'object') throw new TypeError('look requires color and brightness');
    return [message('colorwc',{color:rgb(value.color),colorTemInKelvin:0}),
      message('brightness',{value:integer(value.brightness,1,100)})];
  }
  throw new TypeError('Unsupported Govee action');
}
function parseReply(raw, remoteIp) {
  try {
    if (!isPrivateIPv4(remoteIp) || raw.length > 4096) return null;
    const msg=JSON.parse(raw.toString('utf8'))?.msg;
    if (!msg || !['scan','devStatus'].includes(msg.cmd) || !msg.data || typeof msg.data !== 'object') return null;
    const data=msg.data;
    if (msg.cmd === 'scan') {
      // Trust the sender, not an arbitrary IP embedded inside the UDP payload.
      const name=typeof data.deviceName==='string' ? data.deviceName.slice(0,100) : '';
      const sku=typeof data.sku==='string' ? data.sku.slice(0,40) : '';
      const device=typeof data.device==='string' ? data.device.slice(0,100) : '';
      return {type:'scan',ip:remoteIp,sku,name,device};
    }
    const result={type:'devStatus',ip:remoteIp};
    if (data.onOff === 0 || data.onOff === 1) result.on=Boolean(data.onOff);
    if (typeof data.brightness==='number' && data.brightness>=0 && data.brightness<=100) result.brightness=data.brightness;
    if (data.color && typeof data.color==='object') {
      try {result.color=rgb(data.color);} catch { /* discard malformed color */ }
    }
    return result;
  } catch { return null; }
}
module.exports={SCAN_ADDRESS,SCAN_PORT,REPLY_PORT,COMMAND_PORT,isPrivateIPv4,integer,rgb,scan,status,command,parseReply};
