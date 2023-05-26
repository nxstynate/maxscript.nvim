"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getDocumentDefinitions = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
//------------------------------------------------------------------------------------------
var astUtils_1 = require("./lib/astUtils");
var keywordsDB_1 = require("./lib/keywordsDB");
var utils_1 = require("./lib/utils");
//------------------------------------------------------------------------------------------
/**
 * DocumentSymbols[] query
 * @param  id name to search for
 * @param array DocumentSymbols
 * @returns  Found node or undefined
 */
function findDocumenSymbols(id, array) {
    var results = [];
    var _visit = function (id, array) {
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var node = array_1[_i];
            if (node.name === id) {
                results.push(node);
            }
            if (node.children) {
                _visit(id, node.children);
            }
        }
    };
    _visit(id, array);
    return results.length ? results : undefined;
}
/**
 * Regex Match
 * @param document
 * @param searchWord
 * @returns Word location
 */
function wordMatch(document, searchWord, position) {
    var data = document.getText();
    // skip invalid words....
    // if searchword is a keyword...
    if (keywordsDB_1.keywordsDB.keyword.includes(searchWord.toLowerCase())) {
        return;
    }
    // skip data values like numbers
    if (/^[\d.]+$/m.test(searchWord)) {
        return;
    }
    // skip one line comments
    var offsetPos = document.offsetAt(position);
    var matchLine = data.slice(0, offsetPos).split('\n');
    if (/--/.test(matchLine[matchLine.length - 1])) {
        return;
    }
    // skip copmments, strings, or drop it from the results. too complex!
    //-------------------------------------------------------------------------
    var exp = new RegExp("\\b(".concat(searchWord, ")\\b"), 'igu');
    var match, results = [];
    while (match = exp.exec(data)) {
        var matchLine_1 = data.slice(0, match.index).split('\n');
        // skip single line comments from results...
        if (/--/.test(matchLine_1[matchLine_1.length - 1])) {
            continue;
        }
        /*
            // text until here...
            let dataPrev = data.slice(0, match.index);
            // split in lines
            let lines = dataPrev.split('\n');
            // get the character pos in the last line...
            let lastLine = lines[lines.length - 1];
            if (/--/.test(lastLine)) {continue;}
            let pos = lastLine.length;
            let start = Position.create(lines.length - 1, pos);
            let end = Position.create(lines.length - 1, pos + searchWord.length);
            results.push(Range.create(start, end));
        */
        var range = vscode_languageserver_1.Range.create(document.positionAt(match.index), document.positionAt(match.index + searchWord.length));
        results.push(vscode_languageserver_1.Location.create(document.uri, range));
    }
    return results.length ? results : undefined;
}
/**
 * DocumentSymbol Match
 * @param document
 * @param documentSymbols
 * @param searchWord
 * @param wordRange
 * @returns DocumentSymbol location
 */
function symbolMatch(document, documentSymbols, searchWord) {
    return findDocumenSymbols(searchWord, documentSymbols).map(function (sym) { return vscode_languageserver_1.LocationLink.create(document.uri, sym.range, sym.selectionRange); });
}
/**
 * CST query Match -- DEPRECATED -- TODO: USE THE NEW IMPLEMENTED PARSER RANGES -- SEARCH IN NODES IDS FOR CONSISTENCY, OR AR LEAST FILTER OUT KEYWORDS... NOW IT MATCHES ANY TOKEN
 * @param  document
 * @param  CST
 * @param  searchWord
 */
function cstMatch(document, CST, searchWord) {
    //TODO: use only valid statements, declarations, etc.
    var prospect = (0, astUtils_1.getFromCST)(CST, { 'value': searchWord });
    if (prospect.length <= 0) {
        return;
    }
    // first element in collection
    var tokenRange = astUtils_1.rangeUtil.getTokenRange(prospect[0]);
    return vscode_languageserver_1.LocationLink.create(document.uri, tokenRange, tokenRange);
}
/**
 * Get Document definitions
 * @async
 * @param document
 * @param position
 * @param parseCST
 * @param documentSymbols
 */
function getDocumentDefinitions(document, position, documentSymbols) {
    return __awaiter(this, void 0, void 0, function () {
        var word, _symbolMatch, _wordMatch;
        return __generator(this, function (_a) {
            word = (0, utils_1.getWordAtPosition)(document, position, '--');
            if (word) {
                // use documentSymbols
                if (documentSymbols) {
                    _symbolMatch = symbolMatch(document, documentSymbols, word);
                    if (_symbolMatch && _symbolMatch.length) {
                        return [2 /*return*/, _symbolMatch];
                    }
                    else {
                        throw new Error('No matches');
                    }
                }
                else {
                    _wordMatch = wordMatch(document, word, position);
                    if (_wordMatch) {
                        return [2 /*return*/, _wordMatch];
                    }
                    else {
                        throw new Error('No matches');
                    }
                }
            }
            else {
                throw new Error('No input word.');
            }
            return [2 /*return*/];
        });
    });
}
exports.getDocumentDefinitions = getDocumentDefinitions;
