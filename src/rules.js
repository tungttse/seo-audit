'use strict';

const htmlparser  = require('htmlparser');
const assume      = require('assumejs');
const chaiSubset  = require('chai-subset');
const _           = require('lodash');

assume.chaiUse(chaiSubset);

/**
 * Find element and check assertion by assume library
 */
class Rules {

    /**
     * constructor
     */
    constructor(){
        this.failCount = 0;
    }

    /**
     * Find element
     * @param  {Object} elements element of html
     * @return {*|null|Array} return data
     */
    findElements(elements) {
        const els = elements.html(elements(this.tag));
        const handler = new htmlparser.DefaultHandler(function (error, dom) {});
        const parser = new htmlparser.Parser(handler);
        parser.parseComplete(els);
        return handler.dom;
    }

    /**
     * Parse element and check the assertion by assumejs
     * @param  elements
     * @return {number} of fail count.
     */
    parse(elements) {
        let that = this
        elements = this.findElements(elements);

        const _checkRule = function(obj, condition, args) {
            const props = condition.split(".");
            let runOnObj = assume(obj);
            for(let i=0; i<props.length; i++) {
                if (i == props.length-1) {
                    if (typeof runOnObj[props[i]] !== "function") {
                        throw "Invalid rule";
                    }
                    return runOnObj[props[i]](args);
                }
                runOnObj = runOnObj[props[i]];
            }
        };

        _.forEach(this.conditions, function(con) {
            assume.overwriteNotify(function (_super) {
              return function (err, context) {
                  that.failCount++;
              };
            });

            if(con.attribute || con.children) {
                const type = con.attribute ? "attribute" : "children";
                _.forEach(elements, function(element) {
                    try {
                        let obj = (con.attribute ? element.attribs : element.children);
                        if (!obj) obj = {};
                        _checkRule(obj, con[type].condition, con[type].args);
                    } catch (err) {
                        con.inValidRule = true;
                    }
                });

            } else if (con.self) {
                try {
                    _checkRule(elements, con.self.condition, con.self.args);
                } catch (err) {
                    con.inValidRule = true;
                }
            }
        });

        return true;
    }
}

module.exports = Rules;
