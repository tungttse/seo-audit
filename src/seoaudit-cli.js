#! /usr/bin/env node

'use strict';
const fs = require('fs');

const argv = require('yargs')
            .usage('Usage: $0 --file [file path] OR $0 -stream [file path]')
            .example('$0 --file foo.html', 'Parse foo.html and show SEO errors')
            .option('file', {
                alias: 'f',
                describe: 'A valid HTML file path'
            })
            .option('stream', {
                alias: 's',
                describe: 'A valid HTML file path to stream content'
            })
            .option('config', {
                alias: 'c',
                describe: 'Rule config',
                default: '{}'
            })
            .option('out', {
                alias: 'o',
                describe: 'Program output. --out file OR --out console OR --out stream',
                choices: ['console', 'file', 'stream'],
                default: 'console'
            })
            .option('outfile', {
                alias: 'of',
                describe: 'file output path. --outfile filepath',
                default: 'result.txt'
            })
            .alias('h', 'help')
            .help('h').argv;

const SeoAudit = require('./seoaudit');

let outputPath = argv.outfile ? argv.outfile : 'result.txt'
const seoAudit = new SeoAudit(argv.config, argv.out, outputPath);

if (argv.stream) {
    const s = fs.createReadStream(argv.stream);
    seoAudit.parseStream(s);
} else if (argv.file) {
    parser.parseFile(argv.file);
} else {
    console.log("Usage: seoaudit --file [file path] OR index.js --stream [file path]");
}
