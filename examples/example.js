var _ = require('lodash');
var PcapWriter = require('../index');

run();

function run() {
  var pcapWriter = new PcapWriter('./test.pcap', 1500, 105);
  pcapWriter.close();
  console.log('all done');
}
