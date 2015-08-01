# node-pcap-writer

A simple pcap writer that helps you to create pcap file from captured packet data in Node JS.

Background
----------
There are reader and parser packages available for pcap in Node JS but not writer so decided to write onde that can help others.

Example
-------
Initialize:
```javascript
var PcapWriter = require('../index');
...
var pcapWriter = new PcapWriter('./test.pcap', 1500, 105);
...
```

This will also write global header. Then for writing data packets:

```javascript
...
pcapWriter.writePacket(packetDataBuffer, timestamp)
...
```

Here packetDataBuffer is [Buffer](https://nodejs.org/api/buffer.html) object of Node JS containig data of packet. 
Timestamp needs to be in seconds.
And then finally close it:

```javascript
...
pcapWriter.close();
...
```

This will close the file write stream so the file can be usable. **Don't forget** to close it when you are done writing all packets.

License
-------
MIT