/** V722 Personal Music Insights. Pure, read-only aggregation of existing V717–V721
 * analyses. All claims are limited to OBSERVED Last.fm scrobbles, not listening time.
 * Calendar periods follow the viewer's local timezone and the last archived play.
 */
import type {LastFmEventV706} from './lastfm-history-v706';
import {lastFmMilestonesV717} from './lastfm-milestones-v717';
import {buildLastFmTasteStoryV718} from './lastfm-taste-story-v718';
import {buildLastFmDiscoveryTimelineV720} from './lastfm-discovery-timeline-v720';
import {buildLastFmArtistDashboardV721} from './lastfm-artist-dashboard-v721';
import {moveMonthV716} from './lastfm-history-calendar-v716';

export type V722Period={month:string;plays:number;observed:boolean};
export type V722Artist={artist:string;plays:number;year:number;firstAt:string};
export type V722Insight={
 total:number; artists:number; activeDays:number; observedYears:number; firstDay:string|null; lastDay:string|null;
 longestStreak:{start:string;end:string;days:number}|null;
 peakDay:{day:string;plays:number}|null; peakMonth:{month:string;plays:number}|null;
 topArtist:{artist:string;plays:number;year:number}|null;
 topSong:{artist:string;title:string;plays:number}|null;
 months:V722Period[];
 rising:{artist:string;plays:number;gain:number;year:number}[];
 loyal:{artist:string;plays:number;years:number;year:number}[];
 comebacks:{artist:string;returnDay:string;gapDays:number}[];
 discoveries:V722Artist[];
 firstObservedYear:number|null; lastObservedYear:number|null;
 comparable:boolean; currentWindow:{from:string;to:string;plays:number}|null;
 previousWindow:{from:string;to:string;plays:number}|null;
 hasUnobservedPeriods:boolean;
};

const safeYear=(value:string|null)=>value?Number(value.slice(0,4)):0;

export function buildLastFmPersonalInsightsV722(events:readonly LastFmEventV706[],now=new Date()):V722Insight{
 const source=Array.isArray(events)?events:[];
 const validNow=Number.isFinite(now.getTime())?now:new Date(0);
 const milestone=lastFmMilestonesV717(source,validNow);
 const discovery=buildLastFmDiscoveryTimelineV720(source,validNow);
 const story=buildLastFmTasteStoryV718(source,validNow);
 const artistDashboard=buildLastFmArtistDashboardV721(source,validNow);
 const latest=milestone.lastDay;
 const lastMonth=latest?.slice(0,7)??null,firstMonth=milestone.firstDay?.slice(0,7)??null;
 const indexed=new Map(milestone.months.map(m=>[m.month,m.plays]));
 const months:V722Period[]=[];
 if(lastMonth)for(let offset=5;offset>=0;offset--){
  const month=moveMonthV716(lastMonth,-offset);
  if(month)months.push({month,plays:indexed.get(month)??0,observed:Boolean(firstMonth&&month>=firstMonth)});
 }
 const observedYears=story.years.filter(y=>y.plays>0).length;
 const latestYear=safeYear(latest);
 const top=discovery.artists[0];
 const sortedRecent=discovery.artists.slice().sort((a,b)=>b.firstAt.localeCompare(a.firstAt)||a.key.localeCompare(b.key));
 return {
  total:milestone.total,artists:discovery.artists.length,activeDays:milestone.activeDays,observedYears,
  firstDay:milestone.firstDay,lastDay:latest,
  longestStreak:milestone.longestStreak,peakDay:milestone.peakDay,peakMonth:milestone.peakMonth,
  topArtist:top?{artist:top.artist,plays:top.plays,year:top.years[top.years.length-1]??latestYear}:null,
  topSong:milestone.topSong?.title?{artist:milestone.topSong.artist,title:milestone.topSong.title,plays:milestone.topSong.plays}:null,
  months,
  rising:artistDashboard.rising.slice(0,3).map(a=>({artist:a.artist,plays:a.currentPlays,gain:a.shareChange,year:a.years[a.years.length-1]??latestYear})),
  loyal:artistDashboard.loyal.slice(0,3).map(a=>({artist:a.artist,plays:a.plays,years:a.years.length,year:a.years[a.years.length-1]??latestYear})),
  comebacks:artistDashboard.comebacks.slice(0,3).map(c=>({artist:c.artist.artist,returnDay:c.returnDay,gapDays:c.gapDays})),
  discoveries:sortedRecent.slice(0,3).map(a=>({artist:a.artist,plays:a.plays,year:a.firstYear,firstAt:a.firstAt})),
  firstObservedYear:story.firstYear,lastObservedYear:story.latestYear,
  comparable:artistDashboard.comparable,
  currentWindow:artistDashboard.asOf?artistDashboard.current:null,
  previousWindow:artistDashboard.asOf?artistDashboard.previous:null,
  hasUnobservedPeriods:months.some(m=>!m.observed),
 };
}
