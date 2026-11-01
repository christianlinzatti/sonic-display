'use client';
/** Offline-only analyzer: reads user-selected JSON, no upload or persistence. */
import {useState} from 'react';
import {reviewMotionRunsV781,type MotionReviewV781} from '@/services/monitoring/motionSmoothnessV781';
export function MotionSmoothnessReviewV781(){
 const [review,setReview]=useState<MotionReviewV781|null>(null),[error,setError]=useState('');
 const open=async(file:File|undefined)=>{
  setReview(null);setError('');if(!file)return;
  if(file.size>20*1024*1024){setError('Maximal 20 MB JSON erlaubt');return}
  try{
   const data=JSON.parse(await file.text());setReview(reviewMotionRunsV781(Array.isArray(data)?data:data?.runs));
  }catch(e){setError('Ungültige JSON-Datei: '+String(e))}
 };
 return <main style={{padding:24,background:'#0d1628',color:'#f2f7ff',minHeight:'100vh',fontFamily:'system-ui'}}>
  <h1>V781 · Motion Smoothness Review</h1>
  <p>Hier werden ausschließlich <strong>echte V781-Browsermessungen</strong> ausgewertet. Keine automatischen Hardware-Zusagen.</p>
  <p>Sechs Läufe: Cinematic → Balanced → Economy → Economy → Balanced → Cinematic. Jeder enthält zwei Durchläufe aller sechs Bühnen-/Avatar-Szenen.</p>
  <label style={{display:'block',padding:'12px 0'}}>V781-runs.json lokal auswählen <input type="file" accept=".json,application/json" onChange={e=>void open(e.currentTarget.files?.[0])}/></label>
  {error&&<p role="alert">{error}</p>}
  {review&&<section>
   <h2>Status: {review.status==='ready'?'Messdaten vollständig':'Nicht vergleichbar / unvollständig'}</h2>
   {review.issues.map((s,i)=><p role="alert" key={i}>{s}</p>)}
   <p>{review.recommendation}</p>
   {review.rows.length>0&&<div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',width:'100%',fontSize:13}}><thead><tr>
    {['Profil','Bühne','GLBs','P95 Frame ms','Pose-Holds %','P95 Pose-Jerk °','Mund-Holds %','Vokal-MAE','Fußrutschen*','Warnungen'].map(s=><th key={s} style={{padding:8,textAlign:'left'}}>{s}</th>)}
   </tr></thead><tbody>{review.rows.map(r=><tr key={r.profile+r.id}>{[r.profile,r.id,r.avatars,r.worstP95FrameMs,r.worstPoseHoldPct,r.worstP95PoseJerkDeg,r.worstMouthHoldPct,r.worstVocalErrorMean,r.footSlipEvents??'nicht messbar',r.warnings.join('; ')||'–'].map((v,i)=><td key={i} style={{padding:8,borderTop:'1px solid #465064'}}>{v}</td>)}</tr>)}</tbody></table></div>}
   <h3>Grenzen</h3>{review.limitations.map(s=><p key={s}>{s}</p>)}
   <p>* Fußrutschen wird aus der Höhe benannter Fußknochen geschätzt. Ohne solche Knochen ausdrücklich nicht messbar.</p>
  </section>}
 </main>;
}
