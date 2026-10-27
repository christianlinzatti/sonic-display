import json, subprocess, pathlib, time, sys
root=pathlib.Path(__file__).resolve().parents[1]
scripts=json.loads((root/'package.json').read_text())['scripts']
begin,end=map(int,sys.argv[1:3])
names=[f'test:v{i}' for i in range(begin,end+1) if f'test:v{i}' in scripts]
assert len(names)==end-begin+1,(len(names),names)
log=root/f'V517-REGRESSIONS-{begin}-{end}.txt'
with log.open('w') as f:
 for n in names:
  t=time.monotonic()
  p=subprocess.run(scripts[n],cwd=root,shell=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=50)
  f.write(f'===== {n} exit={p.returncode} secs={time.monotonic()-t:.2f} =====\n{p.stdout}\n');f.flush()
  if p.returncode:
   print(n,'FAILED:\n',p.stdout[-3000:],flush=True);sys.exit(p.returncode)
  print(n,'PASS',flush=True)
print(f'PASS {len(names)} tests ({begin}–{end})',flush=True)
