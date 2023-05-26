"use strict";
exports.__esModule = true;
var vscode_languageserver_1 = require("vscode-languageserver");
var mxsSymbolDef_1 = require("./schema/mxsSymbolDef");
//-----------------------------------------------------------------------------------
var exp = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/ig;
var escapeRegex = function (str) { return str.replace(exp, '\\$&'); };
// skip comments
var blockComments = function (x) { return new RegExp('\\/\\*[^\\*\\/]*' + x, 'i'); };
var singleComments = function (x) { return new RegExp('--.*(' + x + ').*$', 'im'); };
var strings = function (x) { return new RegExp('"([^"]|[\\"])*(' + x + ')([^"]|[\\"])*$"', 'im'); };
function getDocumentSymbolsLegacy(document, diagnostics) {
    if (diagnostics === void 0) { diagnostics = []; }
    var SymbolInfCol = [];
    var docTxt = document.getText();
    mxsSymbolDef_1.mxsSymbols.forEach(function (type) {
        // token[type.match] contains a regex for matching
        // type.decl is a workaround for regexpExecArray index match
        var matchSymbols;
        while (matchSymbols = type.match.exec(docTxt)) {
            var scomment = singleComments(escapeRegex(matchSymbols[0])).test(docTxt);
            var bcomment = blockComments(escapeRegex(matchSymbols[0])).test(docTxt);
            var _string = strings(escapeRegex(matchSymbols[0])).test(docTxt);
            if (scomment || bcomment || _string) {
                continue;
            }
            SymbolInfCol.push(vscode_languageserver_1.SymbolInformation.create(matchSymbols[0], type.kind, vscode_languageserver_1.Range.create(document.positionAt(matchSymbols.index), document.positionAt(matchSymbols.index + matchSymbols[0].length)), document.uri));
        }
    });
    return {
        symbols: SymbolInfCol.length ? SymbolInfCol : [],
        diagnostics: diagnostics
    };
}
exports["default"] = getDocumentSymbolsLegacy;
