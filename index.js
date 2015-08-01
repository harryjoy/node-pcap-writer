/**
 * The Pcap writer.
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');

var GlobalHeader = require('./lib/header/globalhdr');
var PacketHeader = require('./lib/header/packethdr');
var Constants = require('./lib/constants');

/**
 * Initialize new pcap writer.
 * Also writes Global header in the file.
 * @param {String} file  Name of the file to be crated with file path.
 */
function PcapWriter(file, snaplen, linktype) {
  this._fs = fs.createWriteStream(file);
  var options = {};
  if (snaplen) { options.snaplen = snaplen; }
  if (linktype) { options.linktype = linktype; }
  // write global header.
  this._fs.write(new Buffer((new GlobalHeader(options)).toString(), Constants.HEADER_ENCODING));
}

/**
 * Write new packet in file
 * @param  {Buffer} pkt Buffer containing data.
 * @param  {Number} ts  Timestamp [optional].
 */
PcapWriter.prototype.writePacket = function(pkt, ts) {
  if (!ts) { // if no timestamp is provided then default to current.
    ts = (new Date()).getTime() * 1000;
  }
  var n = pkt.length;
  var ph = new PacketHeader({
    tv_sec: parseInt(parseInt(ts, Constants.INT_BASE) / Constants.M_SEC, Constants.INT_BASE),
    tv_usec: parseInt(((ts / Constants.M_SEC) - parseInt(ts/Constants.M_SEC, Constants.INT_BASE)) *
      Constants.M_SEC_F, Constants.INT_BASE),
    caplen: n,
    len: n
  });
  // write packet header
  this._fs.write(new Buffer(ph.toString(), Constants.HEADER_ENCODING));
  // write packet data
  this._fs.write(pkt);
};

/**
 * Close file stream.
 */
PcapWriter.prototype.close = function() {
  return this._fs.end();
};

module.exports = PcapWriter;
