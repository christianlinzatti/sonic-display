'use strict';
const fs=require('node:fs'),path=require('node:path');
/** On Windows, PATH's bash can be an unconfigured WSL launcher. Use bundled Git Bash. */
function bashExecutable({platform=process.platform,env=process.env,exists=fs.existsSync}={}){
 if(platform!=='win32')return 'bash';
 for(const folder of new Set([env.ProgramW6432,env.ProgramFiles,env['ProgramFiles(x86)']].filter(Boolean))){
  for(const suffix of ['bin','usr\\bin']){
   const candidate=path.win32.join(folder,'Git',suffix,'bash.exe');if(exists(candidate))return candidate;
  }
 }
 throw Error('Git for Windows Bash is required for Pi shell-script checks; PATH/WSL is not used.');
}
module.exports={bashExecutable};
