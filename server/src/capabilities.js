"use strict";
exports.__esModule = true;
exports.mxsCapabilities = void 0;
//------------------------------------------------------------------------------------------
var mxsCapabilities = /** @class */ (function () {
    function mxsCapabilities() {
        this.hasConfigurationCapability = false;
        this.hasWorkspaceFolderCapability = false;
        this.hasCompletionCapability = false;
        this.hasDiagnosticRelatedInformationCapability = false;
        this.hasDiagnosticCapability = false;
        this.hasDocumentSymbolCapability = false;
        this.hasDefinitionCapability = false;
        this.hasDocumentFormattingCapability = false;
        this.hasDocumentSemanticTokensCapability = false;
    }
    mxsCapabilities.prototype.initialize = function (capabilities) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        // Does the client support the `workspace/configuration` request?
        // If not, we will fall back using global settings
        this.hasConfigurationCapability = !!((_a = capabilities.workspace) === null || _a === void 0 ? void 0 : _a.configuration);
        this.hasWorkspaceFolderCapability = !!((_b = capabilities.workspace) === null || _b === void 0 ? void 0 : _b.workspaceFolders);
        this.hasDiagnosticCapability = !!((_c = capabilities.textDocument) === null || _c === void 0 ? void 0 : _c.publishDiagnostics);
        this.hasDiagnosticRelatedInformationCapability = !!((_d = capabilities.textDocument) === null || _d === void 0 ? void 0 : _d.publishDiagnostics);
        this.hasDocumentSymbolCapability = !!((_e = capabilities.textDocument) === null || _e === void 0 ? void 0 : _e.documentSymbol);
        this.hasDefinitionCapability = !!((_f = capabilities.textDocument) === null || _f === void 0 ? void 0 : _f.definition);
        this.hasCompletionCapability = !!((_g = capabilities.textDocument) === null || _g === void 0 ? void 0 : _g.completion);
        this.hasDocumentFormattingCapability = !!((_h = capabilities.textDocument) === null || _h === void 0 ? void 0 : _h.formatting);
        this.hasDocumentSemanticTokensCapability = !!((_j = capabilities.textDocument) === null || _j === void 0 ? void 0 : _j.semanticTokens);
    };
    return mxsCapabilities;
}());
exports.mxsCapabilities = mxsCapabilities;
