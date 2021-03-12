# SeoAudit
## Node.js package to audit SEO for HTML content.

#### Installation

Install globally using [npm](https://www.npmjs.com/):

```bash
npm install -g seoaudit
```

To install the latest version locally and save it in your package's package.json file:

```bash
npm install --save seoaudit
```

#### Usage & Examples

```
var SeoAudit = require('seoaudit');

//simple HTML file parsing and printing the result to console
var seoAudit = new SeoAudit({}, "console");
seoAudit.parseFile("input.html");


//input stream and parse data by reading stream and printing the result to console
var fs = require('fs');
var seoAudit = new SeoAudit({}, "console");
var s = fs.createReadStream("input.html");
seoAudit.parseStream(s);

//simple HTML file parsing and write audit result to output file
var seoAudit = new SeoAudit({}, "file", "output.txt");
seoAudit.parseFile("input.html");

//simple HTML file parsing and get result to write stream
var seoAudit = new SeoAudit({}, "stream");
var wStream = seoAudit.outputWriteStream;
wStream.write = function(data, _, done) {
    console.log(data);
    done();
}
seoAudit.parseFile("input.html");

//Override, Define new rules and match conditions
var seoAudit = new SeoAudit({
    "strong": {
        "query": "strong",
        "conditions": [
            {
                "self": {
                    "condition": "length.to.be.below",
                    "args": 5 //Override default rule condition
                },
                "error": "There are more than 5 <strong> tag in HTML"
            }
        ]
    },
    "custom": { //define custom rule
        "tag": "head",
        "conditions": [
            {
                "children": {
                    "condition": "to.containSubset",
                    "args": [{
                        "name": "meta",
                        "attribs": {
                            "name": "robots"
                        }
                    }]
                },
                "error": "<head> without <meta name='robots' ... /> tag"
            }
        ]
    }
}, "console");
seoAudit.parseFile("input.html");
```

#### CommandLine Usage

```bash
seoaudit --file [input file path] OR --stream [file path] --outfile [result file path in case output type is file]
```

#### Dependencies
 [assume](https://github.com/bigpipe/assume): an expect inspired assertion library who's sole purpose is to create a working and human readable assert library for browsers and node. The library is designed to work with different assertion styles.  
[chai](http://www.chaijs.com/): a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.  
[chai-subset](https://github.com/debitoor/chai-subset): "containSubset" object properties matcher for Chai assertion library.  
[cheerio](https://github.com/cheeriojs/cheerio): parse html content to Jquery object.  
[htmlparser](https://github.com/tautologistics/node-htmlparser): parse html content to DOM object.  
[lodash](https://github.com/lodash/lodash): javaScript utility library.  
[sprintf-js](https://github.com/alexei/sprintf.js): formatted string.  
[yargs](https://github.com/yargs/yargs): helps to build interactive command line tools, by parsing arguments and generating an elegant user interface.  

#### License

MIT
