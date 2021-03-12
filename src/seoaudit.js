'use strict';

const fs          = require('fs');
const cheerio     = require('cheerio');
const sprintf     = require("sprintf-js").sprintf;
const stream      = require('stream');
const Readable    = require('stream').Readable;
const Writable    = require('stream').Writable;
const _           = require('lodash');

//load default rules
const defaultRules = require("../config/rules.json");
const RulesHandler = require('./rules');

/**
 * Main class, Hanle input/output
 */
class SeoAudit {

    /**
     * seoaudit constructor
     * @param {String} config customize configuration
     * @param {Object} output console/steam/file
     */
    constructor(config, output, filePathOutput = ""){
        this.rules = JSON.parse(JSON.stringify(defaultRules));
        this.ruleHandler = new RulesHandler();
        this.filePathOutput = filePathOutput;

        let me = this;

        _.forEach(this.rules, function(value, key) {
            let conditions = [];
            me.rules[key].conditions.forEach(con => {
                conditions.push(Object.assign(con, me.rules));
            });
            me.rules[key].conditions = conditions;
            me.rules[key].findElements = me.ruleHandler.findElements;
            me.rules[key].parse = me.ruleHandler.parse;
            me.rules[key].failCount = me.ruleHandler.failCount;
        });

        if (typeof config === "string") config = JSON.parse(config);
        this.output = (output == undefined || output == null ? "console" : output);

        if (this.output == "stream") {
            this._outputReadStream; //stream on which result will be written, outputWriteStream will pipe the data
            this._outputWriteStream = this._createWritableStream();

            Object.defineProperty(this, 'outputWriteStream', {
                get: function() {
                    return me._outputWriteStream;
                }
            });
        }

        //add new rules to config
        if (typeof config === "object") {
            _.forEach(config, function(value, key) {
                if (!me.rules[key] && (!config[key].hasOwnProperty("tag") || !config[key].hasOwnProperty("conditions"))) {
                    return console.log("Invalid rule " + key);
                }

                if (!me.rules[key]) { //new rule defined in config
                    me.rules[key]               = {};
                    me.rules[key].findElements  = me.ruleHandler.findElements;
                    me.rules[key].parse         = me.ruleHandler.parse;
                    me.rules[key].failCount     = me.ruleHandler.failCount;
                }

                if (config[key].tag !== undefined)
                    me.rules[key].tag = config[key].tag;
                if (config[key].conditions !== undefined && config[key].conditions instanceof Array) {
                    let conditions = [];
                    config[key].conditions.forEach(con => {
                        conditions.push(Object.assign(con, me.rules));
                    });
                    me.rules[key].conditions = conditions
                }
            });
        }
    }

    /**
     * Parse input html and check the assertion
     * @param  {String} html html from input
     * @return {void}
     */
    parse(html) {
        const elements = this._parseHTML(html), me = this;
        _.forEach(this.rules, function(value, key) {
            const rule = me.rules[key];
            return rule.parse(elements);
        });
    }

    /**
     * Handle response result to console/stream/file
     * @return {void}
     */
    returnResult() {
        let me = this;
        const _fnOutputString = function() {
            let str = "";
            _.forEach(me.rules, function(rule) {
                rule.conditions.forEach(con => {
                    if (rule.failCount > 0) {
                        str = str == "" ? sprintf(con.error, rule.failCount) : str + "\n" + sprintf(con.error, rule.failCount);
                    }
                });
            });
            return str;
        }

        if (this.output === "console") {
            console.log(_fnOutputString());
        } else if (this.output == "text") { //for tests
            return _fnOutputString();
        } else if (this.output == "stream") {
            this._outputReadStream.push(_fnOutputString());
        } else { //write file
            const fileName = this.filePathOutput ? this.filePathOutput : 'result.txt' ;
            fs.writeFile(fileName, _fnOutputString(), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log(sprintf("Parsed HTML and saved output in %s file", fileName));
            });
        }
    }

    /**
     * Parse result to file
     * @param  {String} file the input file path
     * @return {void}
     */
    parseFile(file) {
        let me = this;
        fs.readFile(file, function read(err, data) {
            if (err) {
                console.log("Invalid file path");
                return;
            }
            me.parse(data.toString().replace((/ {2}|\r\n|\n|\r/gm),"")); //replace newlines and tabs
            me.returnResult();
        });
    }

    /**
     * Parse result to stream
     * @param  {object|function} stream object or function
     * @return {void}
     * @private
     */
    parseStream(stream) {
        if (typeof stream !== "object" && typeof stream.on !== "function") {
            return console.log("Invalid stream object");
        }
        let me = this;
        stream.on('data', function (buf) {
            me.parse(buf.toString().replace((/ {2}|\r\n|\n|\r/gm),"")); //replace newlines and tabs
        });

        stream.on('end', function () {
            me.returnResult();
        });
    }

    /**
     * Create writeable stream
     * @return {object} return object
     */
    _createWritableStream() {
        this._outputReadStream = new Readable({
            objectMode: true,
            read() {}
        });

        const wStream = new Writable({
            objectMode: true,
            write: (data, _, done) => { //write on console by default, user need to override write
                console.log(data);
                done();
            }
        });

        this._outputReadStream.pipe(wStream);
        return wStream;
    }

    /**
     * Use cheerio module to parse HTML
     *
     * @link https://github.com/cheeriojs/cheerio
     *
     * @param {String} html - A HTML string
     * @returns {Object} return object of html cheerio
     * @private
     */
    _parseHTML(html) {
        const $ = cheerio.load(html, {
            normalizeWhitespace: true,
            xmlMode: true,
            lowerCaseTags: true,
            lowerCaseAttributeNames: true
        });
        return $;
    }
}

module.exports = SeoAudit;
