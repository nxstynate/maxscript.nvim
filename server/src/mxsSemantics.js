"use strict";
exports.__esModule = true;
exports.mxsSemanticTokens = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var mxsAPI_1 = require("./schema/mxsAPI");
var mooTokenize_formatter_1 = require("./lib/mooTokenize-formatter");
//-------------------------------------------------------------------------------------------------------------
// This is a simplified ruleset of the parser tokenizer
var lexer = (0, mooTokenize_formatter_1.mxsFormatterLexer)(mxsAPI_1["default"]);
//-------------------------------------------------------------------------------------------------------------
var TokenTypes;
(function (TokenTypes) {
    TokenTypes[TokenTypes["class"] = 0] = "class";
    TokenTypes[TokenTypes["function"] = 1] = "function";
    TokenTypes[TokenTypes["interface"] = 2] = "interface";
    TokenTypes[TokenTypes["namespace"] = 3] = "namespace";
    TokenTypes[TokenTypes["struct"] = 4] = "struct";
    TokenTypes[TokenTypes["type"] = 5] = "type";
    TokenTypes[TokenTypes["variable"] = 6] = "variable";
    TokenTypes[TokenTypes["enumMember"] = 7] = "enumMember";
    TokenTypes[TokenTypes["_"] = 8] = "_";
    // comment,
    // keyword,
    // string,
    // number,
    // type,
    // class,
    // interface,
    // enum,
    // typeParameter,
    // member,
    // property,
    // variable,
    // parameter,
    // lambdaFunction,
})(TokenTypes || (TokenTypes = {}));
var TokenModifiers;
(function (TokenModifiers) {
    TokenModifiers[TokenModifiers["declaration"] = 0] = "declaration";
    TokenModifiers[TokenModifiers["documentation"] = 1] = "documentation";
    TokenModifiers[TokenModifiers["readonly"] = 2] = "readonly";
    TokenModifiers[TokenModifiers["static"] = 3] = "static";
    TokenModifiers[TokenModifiers["abstract"] = 4] = "abstract";
    TokenModifiers[TokenModifiers["deprecated"] = 5] = "deprecated";
    TokenModifiers[TokenModifiers["_"] = 6] = "_";
    // abstract,
    // deprecated,
})(TokenModifiers || (TokenModifiers = {}));
var mxsSemanticTokens = /** @class */ (function () {
    function mxsSemanticTokens(capability) {
        this.tokenTypes = new Map();
        this.tokenModifiers = new Map();
        this.tokenBuilders = new Map();
        this.legend = this.computeLegend(capability);
    }
    mxsSemanticTokens.prototype.tokenizeDocument = function (text) {
        var _this = this;
        var semtoken = [];
        if (!this.legend) {
            return semtoken;
        }
        var token;
        // compute token modifiers
        var tokenMod = function (vals) {
            var result = 0;
            for (var i = 0; i < vals.length; i++) {
                var _tokenMod = vals[i];
                if (_this.tokenModifiers.has(_tokenMod)) {
                    result = result | (1 << _this.tokenModifiers.get(_tokenMod));
                }
                else if (_tokenMod === 'notInLegend') {
                    result = result | (1 << _this.tokenModifiers.size + 2);
                }
            }
            return result;
        };
        var tokenType = function (val) {
            switch (true) {
                case _this.tokenTypes.has(val):
                    return _this.tokenTypes.get(val);
                case (val === 'notInLegend'):
                    return _this.tokenTypes.size + 2;
                default:
                    return 0;
            }
        };
        // feed the tokenizer
        lexer.reset(text);
        while (token = lexer.next()) {
            // filter tokens here
            if (token.type) {
                var typing = token.type.split('_');
                if (this.legend.tokenTypes.includes(typing[0])) {
                    // console.log(typing[0]);
                    semtoken.push({
                        line: token.line - 1,
                        startCharacter: token.col - 1,
                        length: token.text.length,
                        tokenType: tokenType(typing[0]),
                        tokenModifiers: tokenMod(typing.slice(1))
                    });
                }
            }
        }
        return semtoken;
    };
    mxsSemanticTokens.prototype.computeLegend = function (capability) {
        var clientTokenTypes = new Set(capability.tokenTypes);
        var clientTokenModifiers = new Set(capability.tokenModifiers);
        var _tokenTypes = [];
        for (var i = 0; i < TokenTypes._; i++) {
            var str = TokenTypes[i];
            if (clientTokenTypes.has(str)) {
                _tokenTypes.push(str);
                this.tokenTypes.set(str, i);
            }
        }
        var _tokenModifiers = [];
        for (var i = 0; i < TokenModifiers._; i++) {
            var str = TokenModifiers[i];
            if (clientTokenModifiers.has(str)) {
                _tokenModifiers.push(str);
                this.tokenModifiers.set(str, i);
            }
        }
        return { tokenTypes: _tokenTypes, tokenModifiers: _tokenModifiers };
    };
    mxsSemanticTokens.prototype.getTokenBuilder = function (document) {
        var result = this.tokenBuilders.get(document.uri);
        // Return existing token builder
        if (result !== undefined) {
            return result;
        }
        // No builder found, create new one
        result = new vscode_languageserver_1.SemanticTokensBuilder();
        // Add to tokenBuilders set
        this.tokenBuilders.set(document.uri, result);
        return result;
    };
    mxsSemanticTokens.prototype.provideSemanticTokens = function (document) {
        var builder = this.getTokenBuilder(document);
        // if (!this.legend) { return;}
        this.tokenizeDocument(document.getText()).forEach(function (token) {
            builder.push(token.line, token.startCharacter, token.length, token.tokenType, token.tokenModifiers);
        });
        return builder.build();
    };
    mxsSemanticTokens.prototype.provideDeltas = function (document, resultsId) {
        var builder = this.getTokenBuilder(document);
        builder.previousResult(resultsId);
        this.tokenizeDocument(document.getText()).forEach(function (token) {
            builder.push(token.line, token.startCharacter, token.length, token.tokenType, token.tokenModifiers);
        });
        return builder.buildEdits();
    };
    return mxsSemanticTokens;
}());
exports.mxsSemanticTokens = mxsSemanticTokens;
