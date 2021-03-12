'use strict';
var expect = require('chai').expect;
var SeoAudit = require('../src/seoaudit');

describe('Validate default SEO rules', function() {
    var seoAudit = new SeoAudit({}, "text");

    it('<img /> should have alt attribute', function() {
        seoAudit.parse("<img alt=''></img>");
        var result = seoAudit.returnResult();
        expect(result).to.be.equal("");
    });

    it('<a /> should have rel attribute', function() {
        seoAudit.parse("<a rel='' />");
        var result = seoAudit.returnResult();
        expect(result).to.be.equal("");
    });

    it('<head> should have <title>, <meta name="description" /> & <meta name="keywords" /> tags', function() {
        seoAudit.parse('<head><title>Dummy title</title><meta name="description" content="Here is a precise description of my awesome webpage."><meta name="keywords" content="HTML,CSS,XML,JavaScript"></head>');
        var result = seoAudit.returnResult();
        expect(result).to.be.equal("");
    });

    it('Detect there are less than 3 <strong> tags', function() {
        seoAudit.parse("<strong>Strong text</strong><strong>Strong text</strong><strong>Strong text</strong>");
        var result = seoAudit.returnResult();
        expect(result).that.is.not.empty;
    });

    it('Detect there are more than 1 <h1> tag', function() {
        seoAudit.parse("<h1>Strong text</h1><h1>Strong text</h1>");
        var result = seoAudit.returnResult();
        expect(result).that.is.not.empty;
    });

});

describe('Validate with custom rules that check meta robot', function() {
    var seoAuditCustom = new SeoAudit({
        "head": {
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
                    "error": "<head> without <meta name='robot' ... /> tag"
                }
            ]
        },
    }, "text");

    it('<head> should have <meta name="robots" /> tag', function() {
        seoAuditCustom.parse('<head><meta name="robots" content="bla bla"></head>');
        var result1 = seoAuditCustom.returnResult();
        expect(result1).to.be.equal("");
    });
});

describe('Validate with custom rules', function() {
    var seoAuditCustom = new SeoAudit({
        "strong": {
            "query": "strong",
            "conditions": [
                {
                    "self": {
                        "condition": "length.to.be.below",
                        "args": 2
                    },
                    "error": "There are more than 2 <strong> tag in HTML"
                }
            ]
        }
    }, "text");

    it('Detect there are more than 2 <strong> tags', function() {
        seoAuditCustom.parse("<strong>Strong text</strong><strong>Strong text</strong><strong>Strong text</strong>");
        var result = seoAuditCustom.returnResult();
        expect(result).that.is.not.empty;
    });
});
