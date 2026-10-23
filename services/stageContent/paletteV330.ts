/** Small dependency-free approximate palette extraction inspired by ColorThief quantization. */
export type ImagePaletteV330={primary:string;secondary:string;glow:string};
const hex=(n:number)=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,"0");
const toHex=(color:number[])=>`#${color.map(hex).join("")}`;
const luminance=(c:number[])=>.2126*c[0]+.7152*c[1]+.0722*c[2];
export function analyzeStagePixelsV330(pixels: ArrayLike<number>): ImagePaletteV330 | null {
  const buckets=new Map<number,{rgb:[number,number,number];count:number;weight:number}>();
  for(let i=0;i+3<pixels.length;i+=4){
    const r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];
    if(![r,g,b,a].every(Number.isFinite)||a<220)continue;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max-min,light=(max+min)/2;
    if(light<22||light>238)continue;
    const key=(r>>4)*256+(g>>4)*16+(b>>4);
    const bucket=buckets.get(key) ?? {rgb:[0,0,0],count:0,weight:0};
    bucket.rgb[0]+=r;bucket.rgb[1]+=g;bucket.rgb[2]+=b;bucket.count++;
    bucket.weight+=.24+.76*(sat/255);
    buckets.set(key,bucket);
  }
  const colors=[...buckets.values()].map(v=>({rgb:v.rgb.map(x=>x/v.count),score:v.weight})).sort((a,b)=>b.score-a.score);
  if(!colors.length)return null;
  const primary=colors[0].rgb;
  const secondary=colors.find(c=>Math.sqrt(c.rgb.reduce((sum,x,i)=>sum+(x-primary[i])**2,0))>95)?.rgb
    ?? primary.map(v=>v*.4);
  const glow=primary.map((v,i)=>Math.min(255,v*.88+(.2126+.7152+.0722)/3*30));
  // Deliberately return primary / secondary as RGB hex to feed the existing stage lights.
  return {primary:toHex(primary),secondary:toHex(secondary),glow:toHex(glow)};
}
export function sampleStageCoverV330(url: string, signal: AbortSignal): Promise<ImagePaletteV330|null> {
  return new Promise(resolve=>{
    if(typeof Image==="undefined"||signal.aborted||!url){resolve(null);return;}
    const image=new Image();image.crossOrigin="anonymous";
    let done=false;
    const finish=(palette:ImagePaletteV330|null)=>{if(done)return;done=true;signal.removeEventListener("abort",abort);image.onload=null;image.onerror=null;resolve(palette);};
    const abort=()=>{image.src="";finish(null);};signal.addEventListener("abort",abort,{once:true});
    image.onerror=()=>finish(null);
    image.onload=()=>{
      try{const canvas=document.createElement("canvas");canvas.width=48;canvas.height=48;
        const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx){finish(null);return;}
        ctx.drawImage(image,0,0,48,48);finish(analyzeStagePixelsV330(ctx.getImageData(0,0,48,48).data));}
      catch{finish(null);}
    };
    image.src=url;
  });
}
