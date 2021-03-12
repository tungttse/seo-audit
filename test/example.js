const SeoAudit = require('./../src/seoaudit.js');
var fs = require('fs');

const filePath = __dirname + "/test.html";

// var seoAudit = new SeoAudit({}, "console");
// var s = fs.createReadStream(filePath);
// seoAudit.parseStream(s);

var seoAudit = new SeoAudit({}, "stream");
var wStream = seoAudit.outputWriteStream;
wStream.write = function(data, _, done) {
    console.log(data);
    // done();
}
seoAudit.parseFile(filePath);
