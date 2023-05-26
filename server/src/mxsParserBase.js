"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.parseWithErrors = exports.parse = exports.declareParser = exports.TokenizeStream = exports.ParserError = exports.parserOptions = void 0;
var nearley_1 = require("nearley");
var tokenSpecimens_1 = require("./lib/tokenSpecimens");
var grammar = require('./lib/grammar');
var mxsTokenizer = require('./lib/mooTokenize');
// import grammar from './lib/grammar';
// import mxLexer from './lib/mooTokenize.js';
//-----------------------------------------------------------------------------------
// const replaceWithWS = (str: string) => [...str].reduce((acc, next) => (acc + ' '), '');
// const uniqueArray = (x:any[]) => [...new Set(x.map(item => item.type || item.literal))];
var uniqueArray = function (array) { return __spreadArray([], new Map(array.map(function (item) { return [item['type'] || item['literal'], item]; })).values(), true); };
//-----------------------------------------------------------------------------------
var parserOptions = /** @class */ (function () {
    function parserOptions() {
        this.recovery = false;
        this.attemps = 10;
        this.memoryLimit = 0.9;
    }
    return parserOptions;
}());
exports.parserOptions = parserOptions;
/**
 * ParserError extends js Error
 */
var ParserError = /** @class */ (function (_super) {
    __extends(ParserError, _super);
    function ParserError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'parse_error';
        _this.tokens = [];
        // 👇️ because we are extending a built-in class
        Object.setPrototypeOf(_this, ParserError.prototype);
        return _this;
    }
    return ParserError;
}(Error));
exports.ParserError = ParserError;
//-----------------------------------------------------------------------------------
var reportSuccess = function (toks) {
    var newErr = new ParserError('Parser failed. Partial parsing has been recovered.');
    newErr.name = 'ERR_RECOVER';
    newErr.recoverable = true;
    newErr.tokens = toks;
    // newErr.details = errorReport;
    return newErr;
};
var reportFailure = function (toks) {
    var newErr = new ParserError('Parser failed. Unrecoverable errors.');
    newErr.name = 'ERR_FATAL';
    newErr.recoverable = false;
    newErr.tokens = toks;
    // newErr.details = errorReport;
    return newErr;
};
var formatErrorMessage = function (token) {
    var syntaxError = "Syntax error at line: ".concat(token.line, " column: ").concat(token.col);
    var tokenDisplay = 'Unexpected ' + (token.type ? token.type.toUpperCase() + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
    return syntaxError.concat('\n', tokenDisplay);
};
var generateParserError = function (err) {
    var newErr = new ParserError("");
    newErr = Object.assign(newErr, err);
    newErr.message = formatErrorMessage(err.token);
    newErr.name = 'ERR_FATAL';
    newErr.recoverable = false;
    newErr.token = err.token;
    newErr.description = err.message;
    return newErr;
};
//-----------------------------------------------------------------------------------
/**
 * Tokenize mxs string
 * @param source Data to tokenize
 * @param filter keywords to exclude in tokens
 */
function TokenizeStream(source, filter, Tokenizer) {
    if (Tokenizer === void 0) { Tokenizer = mxsTokenizer; }
    if (filter instanceof Array) {
        Tokenizer.next = (function (next) { return function () {
            var tok;
            // IGNORING COMMENTS....
            while ((tok = next.call(Tokenizer)) && (filter.includes)) /* empty statement */ { }
            return tok;
        }; })(Tokenizer.next);
    }
    // feed the tokenizer
    Tokenizer.reset(source);
    var token;
    var toks = [];
    while ((token = Tokenizer.next())) {
        toks.push(token);
    }
    return toks;
}
exports.TokenizeStream = TokenizeStream;
//-----------------------------------------------------------------------------------
function declareParser() {
    return new nearley_1["default"].Parser(nearley_1["default"].Grammar.fromCompiled(grammar), {
        keepHistory: true
    });
}
exports.declareParser = declareParser;
//-----------------------------------------------------------------------------------
/**
 * Get a list of possible error corections
 * @param parserInstance
 */
/*
function PossibleTokens(parserInstance: nearley.Parser)
{
    var possibleTokens: any[] = [];
    var lastColumnIndex = parserInstance.table.length - 2;
    var lastColumn = parserInstance.table[lastColumnIndex];
    var expectantStates = lastColumn.states
        .filter(function (state: { rule: { symbols: { [x: string]: any } }; dot: string | number })
        {
            var nextSymbol = state.rule.symbols[state.dot];
            return nextSymbol && typeof nextSymbol !== 'string';
        });
    // Display a "state stack" for each expectant state
    // - which shows you how this state came to be, step by step.
    // If there is more than one derivation, we only display the first one.
    var stateStacks = expectantStates
        .map((state: any) =>
        {
            return parserInstance.buildFirstStateStack(state, []);
        });
    // Display each state that is expecting a terminal symbol next.
    stateStacks.forEach(function (stateStack: any[])
    {
        var state = stateStack[0];
        var nextSymbol = state.rule.symbols[state.dot];
        possibleTokens.push(nextSymbol);
    });
    return possibleTokens;
}
*/
function PossibleTokens(ParserInstance) {
    var lastColumnIndex = ParserInstance.table.length - 2;
    var lastColumn = ParserInstance.table[lastColumnIndex];
    var expectantStates = lastColumn.states
        .filter(function (state) {
        var nextSymbol = state.rule.symbols[state.dot];
        return nextSymbol && typeof nextSymbol !== "string";
    });
    if (expectantStates.length === 0) {
        //No viable alternatives
    }
    else {
        var stateStacks = expectantStates
            .map(function (state) {
            return ParserInstance.buildFirstStateStack(state, []) || [state];
        }, ParserInstance);
        var symbolAlternatives = [];
        stateStacks.forEach(function (stateStack) {
            var state = stateStack[0];
            var nextSymbol = state.rule.symbols[state.dot];
            /*
            if (
                nextSymbol.type != "ws"
                && nextSymbol.type != "newline"
                && nextSymbol.type != "comment_SL"
                && nextSymbol.type != "comment_BLK"
                ) {symbolAlternatives.push(nextSymbol);}
            // */
            symbolAlternatives.push(nextSymbol);
        }, ParserInstance);
    }
    return symbolAlternatives;
}
//-----------------------------------------------------------------------------------
/**
 * Parser
 * @param source Data to parse
 * @param parserInstance Nearley parser instance
 */
function parse(source, parserInstance) {
    try {
        parserInstance.feed(source);
        return {
            result: parserInstance.results[0],
            error: undefined
        };
    }
    catch (err) {
        throw generateParserError(err);
    }
}
exports.parse = parse;
/**
 * Parser with Error recovery
 * @param source Data to parse
 * @param parserInstance Async Parser with Error recovery
 */
function parseWithErrors(source, parserInstance, options) {
    var _a, _b;
    var src = TokenizeStream(source);
    var state = parserInstance.save();
    var errorState;
    var badTokens = [];
    // let errorReport: any[] = [];
    function parserIterator(src) {
        var next = 0;
        // let attemp = 0;
        return {
            next: function () {
                var _a, _b;
                if (next < src.length) {
                    try {
                        parserInstance.feed(src[next++].value);
                        state = parserInstance.save();
                        return { done: false };
                    }
                    catch (err) {
                        // on error, the parser state is the previous token.
                        // Error unrelated to bad tokens
                        if (!err.token) {
                            throw (err);
                        }
                        // collect bad tokens
                        badTokens.push(err.token);
                        // /*
                        // Problem: the token feed breaks the parser. Beed a propper way to backtrack and catch errors
                        var tokenAlternatives_1 = uniqueArray(PossibleTokens(parserInstance));
                        var nextToken_1 = 0;
                        function parserErrorIterator(err) {
                            return {
                                next: function () {
                                    if (nextToken_1 < tokenAlternatives_1.length) {
                                        // emmit the possible next token ...
                                        var currentTokentAlt = tokenAlternatives_1[nextToken_1++];
                                        var tokenType = currentTokentAlt.type || currentTokentAlt.literal;
                                        // let altToken = {...err.token, ...tokenAlternatives[nextToken++]};
                                        var altToken = (0, tokenSpecimens_1.emmitTokenValue)(err.token.value.length)[tokenType];
                                        // console.log(altToken);
                                        try {
                                            // restore parser state?
                                            parserInstance.restore(state);
                                            // attemp to parse token
                                            parserInstance.feed(altToken);
                                            //pass
                                            return { done: true };
                                        }
                                        catch (err) {
                                            //this is not working
                                            console.log(err);
                                            // restore parser state?
                                            parserInstance.restore(state);
                                        }
                                    }
                                    else {
                                        return { done: false };
                                    }
                                }
                            };
                        }
                        var it_1 = parserErrorIterator(err);
                        while (!((_a = it_1.next()) === null || _a === void 0 ? void 0 : _a.done) || nextToken_1 >= tokenAlternatives_1.length - 1) { }
                        // advance the parser one token
                        if ((_b = it_1.next()) === null || _b === void 0 ? void 0 : _b.done) {
                            next++;
                        }
                        //*/
                        /*
                        // Set max errors limit
                        if (options.attemps > 0 && attemp++ >= options.attemps) { return { done: true }; }
                        // create a report of possible fixes *DISABLED TOO RESOURCES INTENSIVE*
                        // errorReport.push({token:src[next], alternatives: this.PossibleTokens(mxsParser) });
                        // replace the faulty token with a filler value
                        if (src[next]) {
                            let filler = replaceWithWS(err.token.text);
                            Object.assign(src[next],
                                {
                                    text: filler,
                                    value: filler,
                                    type: 'ws'
                                });
                        }
                        // backtrack
                        parserInstance.restore(state);
                        //*/
                    }
                }
                else {
                    return { value: parserInstance.results, done: true };
                }
            }
        };
    }
    var it = parserIterator(src);
    //Iterator
    while (!((_a = it.next()) === null || _a === void 0 ? void 0 : _a.done)) { }
    var res = (_b = it.next()) === null || _b === void 0 ? void 0 : _b.value;
    return {
        result: res,
        error: res ? reportSuccess(badTokens) : reportFailure(badTokens)
    };
}
exports.parseWithErrors = parseWithErrors;
