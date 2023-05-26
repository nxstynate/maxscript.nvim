"use strict";
exports.__esModule = true;
exports.SimpleRangeFormatter = exports.SimpleDocumentFormatter = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var mxsParserBase_1 = require("./mxsParserBase");
var mooTokenize_formatter_1 = require("./lib/mooTokenize-formatter");
var astUtils_1 = require("./lib/astUtils");
// note: keywords could be used to indent, at start or end of line. this will require a per-line aproach... split the documents in lines, and feed the tokenizer one line at the time.
//-----------------------------------------------------------------------------------
var filterCurrenEnum;
(function (filterCurrenEnum) {
    filterCurrenEnum[filterCurrenEnum["assign"] = 0] = "assign";
    filterCurrenEnum[filterCurrenEnum["newline"] = 1] = "newline";
    filterCurrenEnum[filterCurrenEnum["delimiter"] = 2] = "delimiter";
    filterCurrenEnum[filterCurrenEnum["lbracket"] = 3] = "lbracket";
    filterCurrenEnum[filterCurrenEnum["emptyparens"] = 4] = "emptyparens";
    filterCurrenEnum[filterCurrenEnum["emptybraces"] = 5] = "emptybraces";
    filterCurrenEnum[filterCurrenEnum["bitrange"] = 6] = "bitrange";
    filterCurrenEnum[filterCurrenEnum["unaryminus"] = 7] = "unaryminus";
})(filterCurrenEnum || (filterCurrenEnum = {}));
;
var filterAheadEnum;
(function (filterAheadEnum) {
    filterAheadEnum[filterAheadEnum["assign"] = 0] = "assign";
    filterAheadEnum[filterAheadEnum["newline"] = 1] = "newline";
    filterAheadEnum[filterAheadEnum["delimiter"] = 2] = "delimiter";
    filterAheadEnum[filterAheadEnum["sep"] = 3] = "sep";
    filterAheadEnum[filterAheadEnum["ws"] = 4] = "ws";
    filterAheadEnum[filterAheadEnum["lbracket"] = 5] = "lbracket";
    filterAheadEnum[filterAheadEnum["rbracket"] = 6] = "rbracket";
    filterAheadEnum[filterAheadEnum["emptyparens"] = 7] = "emptyparens";
    filterAheadEnum[filterAheadEnum["emptybraces"] = 8] = "emptybraces";
    filterAheadEnum[filterAheadEnum["bitrange"] = 9] = "bitrange";
    filterAheadEnum[filterAheadEnum["unaryminus"] = 10] = "unaryminus";
})(filterAheadEnum || (filterAheadEnum = {}));
;
var indentTokensEnum;
(function (indentTokensEnum) {
    indentTokensEnum[indentTokensEnum["lparen"] = 0] = "lparen";
    indentTokensEnum[indentTokensEnum["lbracket"] = 1] = "lbracket";
    indentTokensEnum[indentTokensEnum["lbrace"] = 2] = "lbrace";
    indentTokensEnum[indentTokensEnum["arraydef"] = 3] = "arraydef";
    indentTokensEnum[indentTokensEnum["bitarraydef"] = 4] = "bitarraydef";
})(indentTokensEnum || (indentTokensEnum = {}));
;
var unindentTokensEnum;
(function (unindentTokensEnum) {
    unindentTokensEnum[unindentTokensEnum["rparen"] = 0] = "rparen";
    unindentTokensEnum[unindentTokensEnum["rbracket"] = 1] = "rbracket";
    unindentTokensEnum[unindentTokensEnum["rbrace"] = 2] = "rbrace";
})(unindentTokensEnum || (unindentTokensEnum = {}));
/*
const filterCurrent =
    ['assign', 'newline', 'delimiter', 'lbracket', 'emptyparens', 'emptybraces', 'bitrange', 'unaryminus'];
const filterAhead =
    ['assign', 'newline', 'delimiter', 'sep', 'ws', 'lbracket', 'rbracket', 'emptyparens', 'emptybraces', 'bitrange', 'unaryminus'];

const IndentTokens =
    ['lparen', 'arraydef', 'lbracket', 'lbrace', 'bitarraydef'];
const UnIndentTokens =
    ['rparen', 'rbracket', 'rbrace'];
*/
//-----------------------------------------------------------------------------------
// Helpers
var getPos = function (line, col) { return vscode_languageserver_1.Position.create(line, col); };
/* let options: FormattingOptions = {
    tabSize: 5,
    insertSpaces: false,
    insertFinalNewline: true,
    trimTrailingWhitespace: true,
    trimFinalNewlines : true
}; */
var FormatterSettings = {
    indentOnly: false,
    indentChar: '\t',
    whitespaceChar: ' '
};
//-----------------------------------------------------------------------------------
function SimpleTextEditFormatter(document, action) {
    // console.log('Debugging formatter');
    var source = typeof document === 'string' ? document : document.getText();
    // add to results
    var Add = function (res) { if (res) {
        edits.push(res);
    } };
    var indentation = 0;
    var edits = [];
    var prevLine = 1;
    // token stream. if this fail will throw an error
    var tokenizedSource = (0, mxsParserBase_1.TokenizeStream)(source, undefined, (0, mooTokenize_formatter_1.mxsFormatterLexer)());
    // return if no results
    if (tokenizedSource && !tokenizedSource.length) {
        throw new Error('Unable to format the document.');
    }
    // main loop
    for (var i = 0; i < tokenizedSource.length; i++) {
        // current token
        var ctok = tokenizedSource[i];
        // next token
        var ntok = tokenizedSource[i + 1];
        // failsafe, stop typescript from complain
        if (ctok.type === undefined) {
            continue;
        }
        // decrease indentation
        if (ntok !== undefined && ntok.type in unindentTokensEnum && indentation >= 0) {
            indentation--;
        }
        // reindent at newline. skip empty lines
        if (ctok.line > prevLine && ctok.type !== 'newline') {
            if (ctok.type === 'ws') {
                // if token is 'ws', replace
                // check for line continuation !!
                Add(action.wsReIndent(ctok, indentation));
            }
            else {
                // if not 'ws', insert
                Add(action.wsIndent(ctok, indentation));
            }
            // } else if (ntok.type === 'bkslsh') {
            // deal with backslash here!
        }
        else {
            // tokens belonging to the same line
            // clean whitespace
            // TODO: check for illegal whitespaces
            if (ctok.type === 'ws' /* || ctock.type === 'bkslsh'*/) {
                if (/^[\s\t]{2,}$/m.test(ctok.toString())) {
                    Add(action.wsClean(ctok));
                }
                // } else if (ntok.type === 'bkslsh') {
                // deal with backslash here!
            }
            else if (ntok !== undefined) {
                //console.log(ctok)
                // skip last token?
                // insert whitespaces
                // skip tokens where whitespace btw doesn't apply
                if (ctok.type in filterCurrenEnum && ntok.type in filterAheadEnum) {
                    // deal with missing whitespaces
                    Add(action.wsAdd(ctok));
                }
            }
        }
        // increase indentation
        if (ctok.type in indentTokensEnum) {
            indentation++;
        }
        prevLine = ctok.line;
    }
    // RETURN;
    return edits;
}
/**
 * Simple code formater: context unaware, just reflow whitespace and indentation of balanced pairs
 * TODO: Add Reflow as an engine when parser tree is available.
 * @param document vscode document to format
 */
function SimpleDocumentFormatter(document, settings) {
    Object.assign(FormatterSettings, settings);
    var TextEditActions = {
        // modify indentation
        wsReIndent: function (t, i) { return vscode_languageserver_1.TextEdit.replace(astUtils_1.rangeUtil.getTokenRange(t), FormatterSettings.indentChar.repeat(i)); },
        // insert indentation
        wsIndent: function (t, i) { return vscode_languageserver_1.TextEdit.insert(getPos(t.line - 1, t.col - 1), FormatterSettings.indentChar.repeat(i)); },
        // clean whitespace
        wsClean: function (t) { return !FormatterSettings.indentOnly ? vscode_languageserver_1.TextEdit.replace(astUtils_1.rangeUtil.getTokenRange(t), ' ') : undefined; },
        // insert whitespace
        wsAdd: function (t) { return !FormatterSettings.indentOnly ? vscode_languageserver_1.TextEdit.insert(getPos(t.line - 1, t.col + t.text.length - 1), ' ') : undefined; }
    };
    return SimpleTextEditFormatter(document.getText(), TextEditActions);
}
exports.SimpleDocumentFormatter = SimpleDocumentFormatter;
/**
 * TODO: Simple code formater: context unaware. Range formatting -- UNFINISHED
 * @param document
 * @param range
 */
function SimpleRangeFormatter(document, range, settings) {
    Object.assign(FormatterSettings, settings);
    // positions
    // let start = range.start;
    // let end = range.end;
    // offsets --- use only line offset
    var offLine = range.start.line;
    // let offChar = range.start.character;
    /*
    TODO:
    - This needs to be context-aware...
    - keep existent indentation
    */
    var TextEditActions = {
        wsReIndent: function (t, i) { return vscode_languageserver_1.TextEdit.replace(astUtils_1.rangeUtil.getTokenRange(t), FormatterSettings.indentChar.repeat(i)); },
        wsIndent: function (t, i) { return vscode_languageserver_1.TextEdit.insert(getPos(t.line + offLine - 1, t.col - 1), FormatterSettings.indentChar.repeat(i)); },
        wsClean: function (t) { return !FormatterSettings.indentOnly ? vscode_languageserver_1.TextEdit.replace(astUtils_1.rangeUtil.getTokenRange(t), ' ') : undefined; },
        wsAdd: function (t) { return !FormatterSettings.indentOnly ? vscode_languageserver_1.TextEdit.insert(getPos(t.line + offLine - 1, t.col + t.value.length - 1), ' ') : undefined; }
    };
    return SimpleTextEditFormatter(document.getText(range), TextEditActions);
}
exports.SimpleRangeFormatter = SimpleRangeFormatter;
