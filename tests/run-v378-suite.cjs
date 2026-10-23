const fs=require('fs');const {spawnSync}=require('child_process');const pkg=require('../package.json');
const args=process.argv.slice(2);const lo=Number(args[0]||0),hi=Number(args[1]||Infinity);
const cmds=pkg.scripts['verify:offline'].split(' && ').map(s=>s.replace(/^npm run /,''));
const results=[];for(let i=lo;i<Math.min(hi,cmds.length);i++){
 const label=cmds[i],cmd=pkg.scripts[label];if(!cmd){results.push({index:i,label,ok:false,error:'Unknown npm script'});continue;}
 const r=spawnSync('sh',['-c',cmd],{encoding:'utf8',timeout:17000,env:{...process.env,NODE_NO_WARNINGS:'1'}});
 const ok=r.status===0;
 results.push({index:i,label,ok,output:ok?null:(r.stderr||r.stdout||'').slice(-1300)});
 if(!ok)process.stdout.write(`FAIL ${i}/${cmds.length} ${label}: ${results.at(-1).output}\n`);
 if((i+1)%20===0)console.log(`Checked ${i+1}/${cmds.length}`);
}
fs.writeFileSync(`/mnt/data/v378-suite-${lo}-${hi}.json`,JSON.stringify({total:cmds.length,pass:results.filter(x=>x.ok).length,fail:results.filter(x=>!x.ok).length,results},null,2));
console.log('SUMMARY',JSON.stringify({total:cmds.length,checked:results.length,passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length}));
if(results.some(x=>!x.ok))process.exitCode=1;
