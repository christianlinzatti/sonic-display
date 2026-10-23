#!/usr/bin/env python3
"""Visual QA helper. Requires `pip install playwright` and a Chromium browser.

Default visits a running *local* Sonic Display. For a reproducible layout-only
fixture run --fixture. Never uploads a screenshot, token or song data.

Limitations: DOM rectangles and browser animation timing are measurable; neither
asserts actual GLB facial visibility, physical Raspberry Pi FPS nor lip sync.
"""
import argparse, json, pathlib, sys, shutil

PARSER=argparse.ArgumentParser()
PARSER.add_argument('--url', default='http://127.0.0.1:3000',help='Running local Sonic Display URL')
PARSER.add_argument('--fixture',action='store_true',help='Use static HTML with no real GLB/Spotify playback')
PARSER.add_argument('--output',default='v465-browser-quality-report.json')
PARSER.add_argument('--screenshots',default='',help='Optional output folder for PNG screenshots')
PARSER.add_argument('--sizes',default='1024x600,800x480,1280x800')
PARSER.add_argument('--chromium',default='',help='Optional Chromium executable path')
PARSER.add_argument('--headed',action='store_true',help='Show Chrome (e.g. for manual Spotify login on localhost)')
PARSER.add_argument('--settle-ms',type=int,default=220,help='Wait after navigation before measuring (use with --headed)')
PARSER.add_argument('--seconds',type=float,default=1.0,help='Browser animation-frame sample (0 skips; NOT WebGL FPS)')
PARSER.add_argument('--sides',default='right,left',help='Fixture only: comma-separated lyric sides')

def main():
 args=PARSER.parse_args()
 try:from playwright.sync_api import sync_playwright
 except ImportError:
  print('Install: python -m pip install playwright && python -m playwright install chromium',file=sys.stderr)
  return 2
 fixture=pathlib.Path(__file__).resolve().parents[1]/'tests/fixtures/v465-visual-layout.html'
 url=args.url
 if not args.fixture and not (url.startswith('http://127.0.0.1:') or url.startswith('http://localhost:')):
  print('This smoke-test supports local development servers only.',file=sys.stderr);return 2
 outputs=[]
 with sync_playwright() as p:
  try:
   options={'headless':not args.headed,'args':['--no-sandbox']}
   if args.chromium: options['executable_path']=args.chromium
   elif shutil.which('chromium'):options['executable_path']=shutil.which('chromium')
   browser=p.chromium.launch(**options)
  except Exception as e:
   print('Chromium launch failed:',str(e)[:350],file=sys.stderr);return 2
  try:
   for size in args.sizes.split(','):
    for side in (args.sides.split(',') if args.fixture else ['unchanged']):
     width,height=map(int,size.lower().split('x'))
     if width<320 or height<280:raise ValueError('Viewport too small for QA')
     page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce')
     errors=[]
     page.on('pageerror',lambda e:errors.append(str(e)[:300]))
     try:
      if args.fixture:
       markup=fixture.read_text(encoding='utf-8').replace('immersive-side-right', 'immersive-side-'+side)
       stylesheet=(fixture.parents[2]/'app/globals.css').read_text(encoding='utf-8')
       markup=markup.replace('<link rel="stylesheet" href="../../app/globals.css"/>', '<style>'+stylesheet+'</style>')
       page.set_content(markup,wait_until='domcontentloaded',timeout=15000)
      else:page.goto(url,wait_until='domcontentloaded',timeout=15000)
      page.wait_for_timeout(max(0,min(args.settle_ms,120000)))
      snapshot=page.evaluate('''() => {
        const rect=(sel)=>{ const el=document.querySelector(sel);if(!el)return null;
          const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,
            clipped:el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2};};
        return {stage:rect('.immersive-stage'),overlay:rect('.immersive-lyrics-overlay'),
          lyric:rect('.immersive-lyrics-overlay .lyrics'),
          line:rect('.immersive-lyrics-overlay .lyric.active'),
          canvasCount:document.querySelectorAll('canvas').length,
          labelCount:document.querySelectorAll('[data-v441-slot]').length,
          visualMode:document.querySelector('[data-v465-visual-mode]')?.getAttribute('data-v465-visual-mode')??null};
      }''')
      stage,overlay=snapshot['stage'],snapshot['overlay']
      safe=bool(stage and overlay and overlay['w']>0 and overlay['h']>0 and
        overlay['x']>=stage['x']-1 and overlay['y']>=stage['y']-1 and
        overlay['x']+overlay['w']<=stage['x']+stage['w']+1 and
        overlay['y']+overlay['h']<=stage['y']+stage['h']+1)
      snapshot.update({'viewport':size,'side':side,'fixture':args.fixture,'hasLyricsOverlay':bool(overlay),
        'overlayWithinStage':safe,'errors':errors})
      if args.seconds>0:
       snapshot['browserRafSample']=page.evaluate('''async duration=>{
         return await new Promise(resolve=>{
          let start=null,prev=null,frames=0,total=0,max=0;
          function tick(t){ if(start===null)start=t;if(prev!==null){let delta=t-prev;total+=delta;max=Math.max(max,delta);}
            prev=t;frames++;if(t-start>=duration){resolve({frames,averageMs:frames>1?total/(frames-1):null,maxMs:max});}
            else requestAnimationFrame(tick); }requestAnimationFrame(tick);
         });}''',min(args.seconds,20)*1000)
      if args.screenshots:
       folder=pathlib.Path(args.screenshots);folder.mkdir(parents=True,exist_ok=True)
       page.screenshot(path=str(folder/('v465-'+size+'-'+side+'.png')),full_page=False)
     except Exception as exc:
      snapshot={'viewport':size,'side':side,'error':str(exc)[:350],'fixture':args.fixture,'overlayWithinStage':False}
     outputs.append(snapshot);page.close()
  finally:browser.close()
 report={'kind':'layout-only fixture' if args.fixture else 'live DOM inspection',
  'note':'Does not establish GLB quality, singer identity or Raspberry Pi FPS.',
  'url':'local fixture' if args.fixture else url,'screens':outputs}
 out=pathlib.Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'report':str(out),'screens':[(item['viewport'],item['side'],item['overlayWithinStage']) for item in outputs]},ensure_ascii=False))
 if args.fixture:return 0 if all(s.get('overlayWithinStage') for s in outputs) else 1
 return 0 if all('error' not in s and s.get('hasLyricsOverlay') and s.get('overlayWithinStage') for s in outputs) else 1

if __name__=='__main__':raise SystemExit(main())
