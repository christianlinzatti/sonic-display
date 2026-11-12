const {test:base,expect}=require('./fixtures.cjs');
/** Keep virtual capture clocks out of a browser process warmed by WebGL shows.
 * Preserve the real pulse/tempo assertions, project options and runtime guard.
 * This distinct worker fixture gives the audio file its own browser process.
 */
const test=base.extend({
 audioVariant:['default',{scope:'worker',option:true}],
 browser:[async({playwright,browserName,headless,channel,launchOptions,audioVariant},use)=>{
  void audioVariant;
  const browser=await playwright[browserName].launch({headless,...(channel?{channel}:{}),...launchOptions});
  try{await use(browser);}finally{await browser.close();}
 },{scope:'worker'}],
});
module.exports={test,expect};
