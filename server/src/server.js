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
exports.connection = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var node_1 = require("vscode-languageserver/node");
var vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
var Path = require("path");
var vscode_uri_1 = require("vscode-uri");
//------------------------------------------------------------------------------------------
var settings_1 = require("./settings");
var capabilities_1 = require("./capabilities");
//------------------------------------------------------------------------------------------
var workspaceEdits_1 = require("./lib/workspaceEdits");
var utils_1 = require("./lib/utils");
//------------------------------------------------------------------------------------------
var mxsCompletion = require("./mxsCompletions");
var mxsOutline_1 = require("./mxsOutline");
var mxsMinifier = require("./mxsMin");
var mxsDefinitions = require("./mxsDefinitions");
var mxsSimpleFormatter = require("./mxsSimpleFormatter");
var mxsFormatter = require("./mxsFormatter");
var mxsSemantics_1 = require("./mxsSemantics");
//------------------------------------------------------------------------------------------
// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
exports.connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager. Supports full document sync only
var documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
/* Client Capabilities */
var Capabilities = new capabilities_1.mxsCapabilities();
//------------------------------------------------------------------------------------------
/**  Current documentSymbols: Store the current document Symbols for later use */
var currentDocumentSymbols = [];
/**  Current document: Store the current document for later use */
// let currentTextDocument: TextDocument;
var currentTextDocumentURI;
/** The semantic tokens provider */
var semanticTokensProvider;
//------------------------------------------------------------------------------------------
/* Initialize the server */
exports.connection.onInitialize(function (params, cancel, progress) {
    progress.begin('Initializing MaxScript Server');
    Capabilities.initialize(params.capabilities);
    // Initialize semanticToken provider
    semanticTokensProvider = new mxsSemantics_1.mxsSemanticTokens(params.capabilities.textDocument.semanticTokens);
    /*
    for (let folder of params.workspaceFolders) {
        connection.console.log(`${folder.name} ${folder.uri}`);
    }
    if (params.workspaceFolders && params.workspaceFolders.length > 0) {
        folder = params.workspaceFolders[0].uri;
    }
    */
    return new Promise(function (resolve, reject) {
        var result = {
            capabilities: {
                textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
                completionProvider: Capabilities.hasCompletionCapability
                    ? {
                        resolveProvider: false,
                        triggerCharacters: ['.']
                    }
                    : undefined,
                documentSymbolProvider: Capabilities.hasDocumentSymbolCapability,
                definitionProvider: Capabilities.hasDefinitionCapability,
                documentFormattingProvider: Capabilities.hasDocumentFormattingCapability
            }
        };
        // wait to start...
        setTimeout(function () { resolve(result); }, 50);
    });
});
exports.connection.onInitialized(function () {
    if (Capabilities.hasConfigurationCapability) {
        exports.connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    // Semantic tokens
    if (Capabilities.hasDocumentSemanticTokensCapability) {
        var registrationOptions = {
            documentSelector: null,
            legend: semanticTokensProvider.legend,
            range: false,
            full: {
                delta: true
            }
        };
        exports.connection.client.register(node_1.SemanticTokensRegistrationType.type, registrationOptions);
    }
    // Settings...
    // getGlobalSettings()
    /*
    if (Capabilities.hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
    */
});
//------------------------------------------------------------------------------------------
/* Settings */
// let globalSettings: MaxScriptSettings = { ...defaultSettings };
var globalSettings = settings_1.defaultSettings;
// Cache the settings of all open documents
var documentSettings = new Map();
/*
async function getGlobalSettings()
{
    type KeysOfType<T, U> = { [k in keyof T]-?: T[k] extends U ? k : never }[keyof T];

    let src = await connection.workspace.getConfiguration({
        section: 'MaxScript'
    }) as MaxScriptSettings;

    Object.keys(globalSettings).forEach(key =>
    {
        let K = key as KeysOfType<MaxScriptSettings, boolean>
        // hasOwnProperty(src, key)
        if (src[K]) {
            if (typeof src[K] === 'object') {
                Object.assign(globalSettings[K], src[K]);
            } else {
                globalSettings[K] =  src[K];
            }
        }
    });
}
*/
function getDocumentSettings(resource) {
    if (!Capabilities.hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    var result = documentSettings.get(resource);
    if (!result) {
        result = exports.connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'MaxScript'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
//------------------------------------------------------------------------------------------
function diagnoseDocument(document, diagnose) {
    if (!Capabilities.hasDiagnosticCapability && !globalSettings.Diagnostics) {
        return;
    }
    // connection.console.log('We received a Diagnostic update event');
    exports.connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnose });
}
//------------------------------------------------------------------------------------------
exports.connection.onDidChangeConfiguration(function (change) {
    if (Capabilities.hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.languageServerMaxScript || settings_1.defaultSettings));
    }
    // Revalidate all open text documents
    documents.all().forEach(function (textDocument) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDocumentSettings(textDocument.uri)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
documents.onDidClose(function (change) {
    // Only keep settings for open documents
    documentSettings["delete"](change.document.uri);
    currentTextDocumentURI = undefined;
    // Remove diagnostics for closed document 
    diagnoseDocument(change.document, []);
});
/*
documents.onDidChangeContent(
    change =>
    {
        diagnoseDocument(change.document, []);
    });
*/
//------------------------------------------------------------------------------------------
/* Document formatter */
exports.connection.onDocumentFormatting(function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, err_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _b = (_a = mxsSimpleFormatter).SimpleDocumentFormatter;
                _c = [documents.get(params.textDocument.uri)];
                return [4 /*yield*/, getDocumentSettings(params.textDocument.uri)];
            case 1: return [2 /*return*/, _b.apply(_a, _c.concat([(_d = (_e.sent())) === null || _d === void 0 ? void 0 : _d.formatter]))];
            case 2:
                err_1 = _e.sent();
                // in case of error, swallow it and return undefined (no result)
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Document Range formatter - WIP
/*
connection.onDocumentRangeFormatting(
    async (_DocumentRangeFormattingParams: DocumentRangeFormattingParams) =>
    {
        if (!Capabilities.hasDocumentFormattingCapability) { return; }
        let document = documents.get(_DocumentRangeFormattingParams.textDocument.uri)!;
        return await mxsSimpleRangeFormatter(
            document,
            _DocumentRangeFormattingParams.range
        ));
    });
// */
//------------------------------------------------------------------------------------------
/* Provide DocumentSymbols and diagnostics  */
exports.connection.onDocumentSymbol(function (params, cancelation) {
    /*
    currentDocumentSymbols = await parseDocument(document, cancelation);
    return currentDocumentSymbols;
    */
    return new Promise(function (resolve) {
        // cancellation request
        cancelation.onCancellationRequested(/* async */ function () { return resolve; });
        // settings
        var options = { recovery: false, attemps: 10, memoryLimit: 0.9 };
        var threading = false;
        getDocumentSettings(params.textDocument.uri)
            .then(function (result) {
            if (!result.GoToSymbol) {
                resolve;
            }
            options.recovery = result.parser.errorCheck;
            options.attemps = result.parser.errorLimit;
            threading = result.parser.multiThreading;
        });
        var document = documents.get(params.textDocument.uri);
        var symbolsresult = threading
            ? mxsOutline_1.mxsDocumentSymbols.parseDocumentThreaded(document, exports.connection, options)
            : mxsOutline_1.mxsDocumentSymbols.parseDocument(document, exports.connection, options);
        symbolsresult.then(function (result) {
            // connection.console.log('--> symbols sucess ');
            //-----------------------------------
            currentDocumentSymbols = result.symbols;
            // currentTextDocument = document;
            currentTextDocumentURI = params.textDocument.uri;
            //-----------------------------------
            // console.log(result.diagnostics);
            diagnoseDocument(document, result.diagnostics);
            resolve(result.symbols);
        })["catch"](function (error) {
            exports.connection.window.showInformationMessage("MaxScript symbols provider unhandled error:\n".concat(error === null || error === void 0 ? void 0 : error.message));
            diagnoseDocument(document, []);
            resolve;
        });
    });
});
/* Completion Items */
exports.connection.onCompletion(function (params) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getDocumentSettings(params.textDocument.uri)];
            case 1:
                if (!(_a.sent()).Completions) {
                    return [2 /*return*/];
                }
                return [2 /*return*/, mxsCompletion.provideCompletionItems(documents.get(params.textDocument.uri), params.position)];
        }
    });
}); });
/* Definition provider */
// method 1: regex match the file
// method 2: search the parse tree for a match
// method 2.1: implement Workspace capabilities
exports.connection.onDefinition(function (params, cancellation) {
    return new Promise(function (resolve) {
        // cancellation request
        cancellation.onCancellationRequested(/* async */ function () { return resolve; });
        // settings
        getDocumentSettings(params.textDocument.uri)
            .then(function (result) {
            if (!result.GoToDefinition) {
                resolve;
            }
        });
        mxsDefinitions.getDocumentDefinitions(documents.get(params.textDocument.uri), params.position, currentTextDocumentURI === params.textDocument.uri ? currentDocumentSymbols : undefined)
            /*currentTextDocument && params.textDocument.uri === currentTextDocument.uri ? currentDocumentSymbols : undefined,
            mxsDocumentSymbols.msxParser.parsedCST)*/
            .then(function (result) { return resolve(result); }, function () { return resolve; })["catch"](function (error) {
            exports.connection.console.log('MaxScript Definitions unhandled error: ' + error);
            resolve;
        });
    });
});
//------------------------------------------------------------------------------------------
/*  Provide semantic tokens */
// /*
exports.connection.languages.semanticTokens.on(function (params) {
    var document = documents.get(params.textDocument.uri);
    return document !== undefined ? semanticTokensProvider.provideSemanticTokens(document) : { data: [] };
});
// TODO: Fix tokens update
exports.connection.languages.semanticTokens.onDelta(function (params) {
    var document = documents.get(params.textDocument.uri);
    return document !== undefined ? semanticTokensProvider.provideDeltas(document, params.textDocument.uri) : { edits: [] };
});
var MinifyDocRequest;
(function (MinifyDocRequest) {
    MinifyDocRequest.type = new node_1.RequestType('MaxScript/minify');
})(MinifyDocRequest || (MinifyDocRequest = {}));
var PrettifyDocRequest;
(function (PrettifyDocRequest) {
    PrettifyDocRequest.type = new node_1.RequestType('MaxScript/prettify');
})(PrettifyDocRequest || (PrettifyDocRequest = {}));
/* Minifier */
exports.connection.onRequest(MinifyDocRequest.type, function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, i, doc, path, newPath, err_2, i, path, newPath, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getDocumentSettings(params.uri[0])];
            case 1:
                settings = _a.sent();
                if (!(params.command === 'mxs.minify') /*  || params.command === 'mxs.minify.file' */) return [3 /*break*/, 11]; /*  || params.command === 'mxs.minify.file' */
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < params.uri.length)) return [3 /*break*/, 10];
                doc = documents.get(params.uri[i]);
                path = vscode_uri_1.URI.parse(params.uri[i]).fsPath;
                newPath = (0, utils_1.prefixFile)(path, settings.MinifyFilePrefix);
                if (!doc) {
                    exports.connection.window.showWarningMessage("MaxScript minify: Failed at ".concat(Path.basename(path), ". Reason: Can't read the file"));
                    return [3 /*break*/, 9];
                }
                _a.label = 3;
            case 3:
                _a.trys.push([3, 8, , 9]);
                if (!settings.parser.multiThreading) return [3 /*break*/, 5];
                return [4 /*yield*/, mxsMinifier.MinifyDocThreaded(doc.getText(), newPath)];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, mxsMinifier.MinifyDoc(doc.getText(), newPath)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7:
                exports.connection.window.showInformationMessage("MaxScript minify: Document saved as ".concat(Path.basename(newPath)));
                return [3 /*break*/, 9];
            case 8:
                err_2 = _a.sent();
                exports.connection.window.showErrorMessage("MaxScript minify: Failed at ".concat(Path.basename(path), ". Reason: ").concat(err_2.message));
                return [3 /*break*/, 9];
            case 9:
                i++;
                return [3 /*break*/, 2];
            case 10: return [3 /*break*/, 20];
            case 11:
                i = 0;
                _a.label = 12;
            case 12:
                if (!(i < params.uri.length)) return [3 /*break*/, 20];
                path = vscode_uri_1.URI.parse(params.uri[i]).fsPath;
                newPath = (0, utils_1.prefixFile)(path, settings.MinifyFilePrefix);
                _a.label = 13;
            case 13:
                _a.trys.push([13, 18, , 19]);
                if (!settings.parser.multiThreading) return [3 /*break*/, 15];
                return [4 /*yield*/, mxsMinifier.MinifyFileThreaded(path, newPath)];
            case 14:
                _a.sent();
                return [3 /*break*/, 17];
            case 15: return [4 /*yield*/, mxsMinifier.MinifyFile(path, newPath)];
            case 16:
                _a.sent();
                _a.label = 17;
            case 17:
                exports.connection.window.showInformationMessage("MaxScript minify: Document saved as ".concat(Path.basename(newPath)));
                return [3 /*break*/, 19];
            case 18:
                err_3 = _a.sent();
                exports.connection.window.showErrorMessage("MaxScript minify: Failed at ".concat(Path.basename(path), ". Reason: ").concat(err_3.message));
                return [3 /*break*/, 19];
            case 19:
                i++;
                return [3 /*break*/, 12];
            case 20: return [2 /*return*/, null];
        }
    });
}); });
/* Prettyfier */
exports.connection.onRequest(PrettifyDocRequest.type, function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, opts, i, doc, path, reply, _a, _b, _c, _d, err_4;
    var _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0: return [4 /*yield*/, getDocumentSettings(params.uri[0])];
            case 1:
                settings = _k.sent();
                opts = {
                    elements: {
                        useLineBreaks: ((_e = settings.prettifier.list) === null || _e === void 0 ? void 0 : _e.useLineBreaks) || true
                    },
                    statements: {
                        optionalWhitespace: ((_f = settings.prettifier.statements) === null || _f === void 0 ? void 0 : _f.optionalWhitespace) || false
                    },
                    // TODO: expression.useWhiteSpace...
                    codeblock: {
                        newlineAtParens: ((_g = settings.prettifier.codeblock) === null || _g === void 0 ? void 0 : _g.newlineAtParens) || true,
                        newlineAllways: ((_h = settings.prettifier.codeblock) === null || _h === void 0 ? void 0 : _h.newlineAllways) || true,
                        spaced: ((_j = settings.prettifier.codeblock) === null || _j === void 0 ? void 0 : _j.spaced) || true
                    }
                };
                if (!(params.command === 'mxs.prettify')) return [3 /*break*/, 10];
                i = 0;
                _k.label = 2;
            case 2:
                if (!(i < params.uri.length)) return [3 /*break*/, 10];
                doc = documents.get(params.uri[i]);
                path = vscode_uri_1.URI.parse(params.uri[i]).fsPath;
                // let path = params.uri[i];
                if (!doc) {
                    exports.connection.window.showWarningMessage("MaxScript prettifier: Failed at ".concat(Path.basename(path), ". Reason: Can't read the file"));
                    return [3 /*break*/, 9];
                }
                _k.label = 3;
            case 3:
                _k.trys.push([3, 8, , 9]);
                _b = (_a = workspaceEdits_1.replaceText).call;
                _c = [exports.connection,
                    doc];
                if (!settings.parser.multiThreading) return [3 /*break*/, 5];
                return [4 /*yield*/, mxsFormatter.FormatDataThreaded(doc.getText(), opts)];
            case 4:
                _d = _k.sent();
                return [3 /*break*/, 6];
            case 5:
                _d = mxsFormatter.FormatData(doc.getText(), opts);
                _k.label = 6;
            case 6: return [4 /*yield*/, _b.apply(_a, _c.concat([_d]))];
            case 7:
                reply = _k.sent();
                if (reply.applied) {
                    exports.connection.window.showInformationMessage("MaxScript prettifier sucess: ".concat(Path.basename(path)));
                }
                else {
                    exports.connection.window.showWarningMessage("MaxScript prettifier: Failed at ".concat(Path.basename(path), ". Reason: ").concat(reply.failureReason));
                }
                return [3 /*break*/, 9];
            case 8:
                err_4 = _k.sent();
                exports.connection.window.showErrorMessage("MaxScript prettifier: Failed at ".concat(Path.basename(path), ". Reason: ").concat(err_4.message));
                return [3 /*break*/, 9];
            case 9:
                i++;
                return [3 /*break*/, 2];
            case 10: return [2 /*return*/, null];
        }
    });
}); });
//------------------------------------------------------------------------------------------
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(exports.connection);
// Listen on the connection
exports.connection.listen();
