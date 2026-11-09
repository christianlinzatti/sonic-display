const {lyrics}=require('./concertMocksV1130.cjs');
const tokens='Jeder Schritt bringt unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen'.split(' ');
const rapText=[...tokens,...tokens].join(' ');
const rapLyrics={provider:'spotify',synced:true,plainText:rapText,lines:[{startMs:8000,endMs:24000,text:rapText,
 words:rapText.split(' ').map((text,i,all)=>({text,startMs:8000+i*16000/all.length,endMs:8000+(i+1)*16000/all.length}))}]};
// Character density also covers fast syllabic/long-word passages.
rapLyrics.lines[0].text=rapText+' '+tokens.join(' ');
rapLyrics.plainText=rapLyrics.lines[0].text;
rapLyrics.lines[0].words=rapLyrics.lines[0].text.split(' ').map((text,i,all)=>({text,startMs:8000+i*16000/all.length,endMs:8000+(i+1)*16000/all.length}));
const malformedLyrics={provider:'spotify',synced:true,plainText:'Fehlerhafte Quelle\nSicher lesbare Zeile\nEin Licht ein Beat wir heben ab',lines:[
 null,{startMs:-3000,endMs:2000,text:'Negative Zeit'},
 {startMs:12000,endMs:15000,text:'Späterer Text'},
 {startMs:8000,endMs:18000,text:'Sicher lesbare Zeile',words:[{text:'Sicher',startMs:9000,endMs:8500},{text:'lesbare',startMs:8200,endMs:8300},{text:'Zeile',startMs:8300,endMs:8400}]},
 {startMs:8000,endMs:9000,text:'Doppelte Zeit'},
 {startMs:1e12,endMs:1e12+1000,text:'Außerhalb des Songs'},
 {startMs:'morgen',endMs:10000,text:'Keine echte Zeit'},
 ...lyrics.lines.filter(l=>l.startMs>=24000),
]};
const tempoEvents=[{at:0,bpm:90},{at:8000,bpm:170},{at:16000,bpm:65},{at:24000,bpm:210},{at:32000,bpm:NaN},{at:40000,bpm:120}];
module.exports={rapLyrics,malformedLyrics,tempoEvents};
