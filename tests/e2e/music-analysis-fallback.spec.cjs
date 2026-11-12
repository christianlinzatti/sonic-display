const {test,expect}=require('./audio-fixtures.cjs');
test.use({audioVariant:'fallback'});
require('../fixtures/measuredAudioBrowser.cjs')(test,expect,false);
