/**
 * The Pcap writer.
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');
var process = require('process');

var GlobalHeader = require('./lib/header/globalhdr');
var PacketHeader = require('./lib/header/packethdr');
var Constants = require('./lib/constants');

/**
 * Write `data` to a `stream`. if the buffer is full will block
 * until it's flushed and ready to be written again.
 * [see](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback)
 */
function lowWrite(stream, data) {
  return new Promise((resolve, reject) => {
    if (stream.write(data)) {
      process.nextTick(resolve);
    } else {
      stream.once("drain", () => {
        stream.off("error", reject);
        resolve();
      });
      stream.once("error", reject);
     }
  });
}

/**
 * Initialize new pcap writer.
 * Also writes Global header in the file.
 * @param {String} file  Name of the file to be crated with file path.
 */
function PcapWriter(file, snaplen, linktype) {
  this._fs = fs.createWriteStream(file);
  this._fs.on('error', (err) => {
    this.error = err;
  });
  var options = {};
  if (snaplen) { options.snaplen = snaplen; }
  if (linktype) { options.linktype = linktype; }
  // write global header.
  lowWrite(this._fs, new Buffer((new GlobalHeader(options)).toString(), Constants.HEADER_ENCODING));
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

  if(undefined == this.error) {
    // write packet header
    lowWrite(this._fs, new Buffer(ph.toString(), Constants.HEADER_ENCODING));
    // write packet data
    lowWrite(this._fs, pkt);
  }
  else {
    throw this.error;
  }
};

/**
 * Close file stream.
 */
PcapWriter.prototype.close = function() {
  return this._fs.end();
};

module.exports = PcapWriter;
