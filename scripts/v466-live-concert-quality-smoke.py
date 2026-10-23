#!/usr/bin/env python3
"""Browser QA of the V466 toggle; `--fixture` validates layout only, NOT GLB/FPS.

With a running local Sonic Display and a real GLB stage, use --url, --headed
for Spotify login. Nothing is uploaded or stored outside your output path.
"""
import argparse,json,pathlib,shutil,sys
ap=argparse.ArgumentParser()
ap.add_argument('--url',default='http://127.0.0.1:3000')
ap.add_argument('--fixture',action='store_true',help='Static mock, no real measurements')
ap.add_argument('--headed',action='store_true')
ap.add_argument('--chromium',default='')
ap.add_argument('--seconds',type=float,default=5.0,help='Time with QA panel open, max 120 s')
ap.add_argument('--sizes',default='800x480,1024x600,1280x800')
ap.add_argument('--screenshots',default='')
ap.add_argument('--output',default='v466-concert-quality-smoke.json')
def run():
 args=ap.parse_args()
 if not args.fixture and not (args.url.startswith('http://127.0.0.1:') or args.url.startswith('http://localhost:')):
  print('Nur lokale Sonic-Display-Instanzen.',file=sys.stderr);return 2
 try:from playwright.sync_api import sync_playwright
 except ImportError:
  print('Installiere zuerst playwright und Chromium.',file=sys.stderr);return 2
 base=pathlib.Path(__file__).resolve().parents[1]
 fixture=base/'tests/fixtures/v466-inspector-layout.html'
 reports=[]
 with sync_playwright() as p:
  options={'headless':not args.headed,'args':['--no-sandbox']}
  executable=args.chromium or shutil.which('chromium')
  if executable:options['executable_path']=executable
  browser=p.chromium.launch(**options)
  try:
   for size in args.sizes.split(','):
    width,height=map(int,size.lower().split('x'))
    page=browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)[:250]))
    record={'viewport':size,'fixture':args.fixture}
    try:
     if args.fixture:
      markup=fixture.read_text(encoding='utf8')
      css=(base/'app/globals.css').read_text(encoding='utf8')
      markup=markup.replace('<link rel="stylesheet" href="../../app/globals.css"/>','<style>'+css+'</style>')
      page.set_content(markup,wait_until='domcontentloaded')
     else:page.goto(args.url,wait_until='domcontentloaded',timeout=20000)
     btn=page.get_by_role('button',name='QA',exact=True)
     btn.wait_for(timeout=7000)
     if not args.fixture:btn.click()
     page.wait_for_timeout(int(max(0,min(args.seconds,120))*1000))
     record.update(page.evaluate('''() => {
       const stage=document.querySelector('.three-avatar-stage');const panel=stage?.querySelector('#v466-quality-panel');
       const toggle=stage?.querySelector('.v466-quality-toggle');if(!stage||!panel||!toggle)return {found:false};
       const s=stage.getBoundingClientRect(),p=panel.getBoundingClientRect();
       return {found:true,open:toggle.getAttribute('aria-pressed')==='true',
         panelInsideStage:p.left>=s.left-1&&p.right<=s.right+1&&p.top>=s.top-1&&p.bottom<=s.bottom+1,
         text:panel.innerText.slice(0,550),markerCount:stage.querySelectorAll('.v466-head-marker').length,
         canvasCount:stage.querySelectorAll('canvas').length};
     }'''))
     if args.screenshots:
      path=pathlib.Path(args.screenshots);path.mkdir(exist_ok=True,parents=True)
      page.screenshot(path=str(path/f'v466-{size}.png'))
     record['errors']=errors
     record['pass']=bool(record.get('found') and record.get('open') and record.get('panelInsideStage') and not errors)
    except Exception as exc:
     record.update({'pass':False,'error':str(exc)[:300]})
    reports.append(record)
    page.close()
  finally:browser.close()
 result={'mode':'STATIC fixture – simulated values' if args.fixture else 'LIVE DOM – requires a started GLB stage',
  'warning':'Layout and projected head estimates do not prove visible faces, lip-sync accuracy, GPU times or Raspberry Pi performance.',
  'results':reports}
 out=pathlib.Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'results':[(r['viewport'],r['pass']) for r in reports],'file':str(out)},ensure_ascii=False))
 return 0 if all(r['pass'] for r in reports) else 1
if __name__=='__main__':raise SystemExit(run())
