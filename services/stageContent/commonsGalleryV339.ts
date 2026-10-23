/** V339 – conservatively select reusable, artist-matched Wikimedia Commons photos. */
export interface CommonsPhotoV339 {url:string;credit:string;descriptionUrl:string;license:string;}
type Obj=Record<string,unknown>;
const record=(value:unknown):value is Obj=>!!value&&typeof value==='object'&&!Array.isArray(value);
const field=(value:unknown)=>typeof value==='string'?value.trim():'';
const plain=(value:string)=>value.replace(/<[^>]*>/g,' ').replace(/&(?:amp|quot|lt|gt|nbsp);/g,' ').replace(/\s+/g,' ').trim().slice(0,140);
const safeHttps=(value:unknown):string=>{try{const url=new URL(field(value));return url.protocol==='https:'?url.href:'';}catch{return '';}};
const canonical=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function commonsSearchUrlV339(artist:string):string{
 const p=new URLSearchParams({action:'query',generator:'search',gsrsearch:`"${artist}" concert`,gsrnamespace:'6',gsrlimit:'24',prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'960',format:'json',formatversion:'2'});
 return `https://commons.wikimedia.org/w/api.php?${p.toString()}`;
}
export function selectCommonsPhotosV339(data:unknown,artist:string,max=8):CommonsPhotoV339[]{
 if(!record(data)||!record(data.query)||!Array.isArray(data.query.pages))return [];
 const name=canonical(artist);
 if(name.length<3)return [];
 const result:CommonsPhotoV339[]=[];
 for(const page of data.query.pages){
  if(!record(page)||!Array.isArray(page.imageinfo)||!record(page.imageinfo[0]))continue;
  const file=field(page.title);
  if(!canonical(file).includes(name))continue;
  if(/\.(svg|gif|pdf|webm|ogg|tif|tiff)$/i.test(file)||/logo|signature|autograph|map|poster|cover art|album cover|icon/i.test(file))continue;
  const info=page.imageinfo[0];const metadata=record(info.extmetadata)?info.extmetadata:{};
  const meta=(key:string)=>record(metadata[key])?field(metadata[key].value):'';
  const license=plain(meta('LicenseShortName'));
  const licenseUrl=safeHttps(meta('LicenseUrl'));
  if(!license||(!/^(CC BY|CC0|Public domain|PD\b)/i.test(license) && !/creativecommons\.org\/(licenses|publicdomain)/.test(licenseUrl)))continue;
  if(meta('NonFree')==='True')continue;
  const width=Number(info.width)||0,height=Number(info.height)||0;
  if((width>0&&width<350)||(height>0&&height<250))continue;
  const url=safeHttps(info.thumburl)||safeHttps(info.url);
  const descriptionUrl=safeHttps(info.descriptionurl);
  if(!url||!descriptionUrl)continue;
  const author=plain(meta('Artist')||meta('Credit')||'Wikimedia Commons');
  if(result.some(p=>p.descriptionUrl===descriptionUrl||p.url===url))continue;
  result.push({url,descriptionUrl,license,credit:`${author} · ${license}`.slice(0,180)});
  if(result.length>=Math.min(12,Math.max(1,max)))break;
 }
 return result;
}
