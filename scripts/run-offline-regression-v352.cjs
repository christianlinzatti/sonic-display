// Lightweight local regression runner. Invokes the same commands as verify:offline,
// but collects every failure instead of stopping at the first failing legacy check.
const {spawnSync}=require('node:child_process');
const pkg=require('../package.json');
const names=[...pkg.scripts['verify:offline'].matchAll(/npm run (\S+)/g)].map(x=>x[1]);
const failures=[];
for(const name of names){
 const command=pkg.scripts[name];if(!command){failures.push([name,'unknown command']);continue;}
 const result=spawnSync('bash',['-lc',command],{cwd:process.cwd(),encoding:'utf8',timeout:30000});
 if(result.status!==0){failures.push([name,((result.stdout||'')+'\n'+(result.stderr||'')).slice(-1700)]);console.log('FAIL',name);}else console.log('PASS',name);
}
console.log(`SUMMARY ${names.length-failures.length}/${names.length} commands passed`);
if(failures.length){for(const [name,msg] of failures)console.log('\n==',name,'==\n',msg);process.exitCode=1;}
