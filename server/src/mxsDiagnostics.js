"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.provideTokenDiagnostic = exports.provideParserErrorInformation = exports.provideParserDiagnostic = exports.mxsDiagnosticCollection = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var mxsTokenDefs_1 = require("./schema/mxsTokenDefs");
var astUtils_1 = require("./lib/astUtils");
//--------------------------------------------------------------------------------
/**
 * Diagnostics collection.
 */
exports.mxsDiagnosticCollection = [];
//--------------------------------------------------------------------------------
var tokenListToValues = function (tokenList) {
    return __spreadArray([], new Set((tokenList).map(function (item) { return item.type; })), true);
};
/**
 * Provide a message that list possible solutions
 * @param tokenList List of possible tokens
 */
function correctionList(tokenList) {
    // get a list of the types
    var list = tokenListToValues(tokenList);
    var tokenDesc = list.map(function (item) { return mxsTokenDefs_1.tokenDefinitions[item]; }).sort();
    // map the types to description...
    var str = 'It was expected one of the followings:\n - ' + tokenDesc.join('\n - ');
    return str;
}
/**
 * Provides a basic syntax error diagnostic.
 * @param error parser error type
 */
function provideParserDiagnostic(err) {
    return err.tokens.map(function (t) {
        //TODO: format error message
        var diag = {
            range: astUtils_1.rangeUtil.getTokenRange(t),
            severity: err.recoverable ? vscode_languageserver_1.DiagnosticSeverity.Warning : vscode_languageserver_1.DiagnosticSeverity.Error,
            source: 'MaxScript',
            message: "Unexpected \"".concat(t, "\".")
        };
        // DISABLED: List of possible tokens
        /*
            diag.code = error.name;
            let list = tokenListToValues(error.alternatives);
            let tokenDesc: string[] = list.map(item => tokenDefinitions[item]).sort();
            diag.relatedInformation = tokenDesc.map( item => new DiagnosticRelatedInformation(new Location(document.uri, vsRange), item));
        */
        return diag;
    });
}
exports.provideParserDiagnostic = provideParserDiagnostic;
/* function reportError(token) {
    var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
    var lexerMessage = this.lexer.formatError(token, "Syntax error");
    return this.reportErrorCommon(lexerMessage, tokenDisplay);
} */
/**
 * Provides a symbol with information related to the parsing error
 * @param err Parser error
 * @returns Diagnostic related information
 */
function provideParserErrorInformation(err) {
    return {
        range: astUtils_1.rangeUtil.getTokenRange(err.token),
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
        source: 'MaxScript',
        message: err.message || err.toString()
    };
}
exports.provideParserErrorInformation = provideParserErrorInformation;
/**
 * Provides bad token diagnosys based on lexer error token
 */
function provideTokenDiagnostic(errTokens) {
    if (!errTokens) {
        return [];
    }
    var diagnostics = errTokens.map(function (t) { return ({
        range: astUtils_1.rangeUtil.getTokenRange(t),
        message: "Unexpected token: ".concat(t.text),
        severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
        // code: 'ERR_TOKEN',
        source: 'MaxScript'
    }); });
    return diagnostics;
}
exports.provideTokenDiagnostic = provideTokenDiagnostic;
