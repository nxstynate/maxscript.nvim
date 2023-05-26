"use strict";
/*
 * Copyright (C) 2017, 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
exports.__esModule = true;
exports.LspDocuments = exports.LspDocument = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
var LspDocument = /** @class */ (function () {
    function LspDocument(doc) {
        var uri = doc.uri, languageId = doc.languageId, version = doc.version, text = doc.text;
        this.document = vscode_languageserver_textdocument_1.TextDocument.create(uri, languageId, version, text);
    }
    Object.defineProperty(LspDocument.prototype, "uri", {
        get: function () {
            return this.document.uri;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LspDocument.prototype, "languageId", {
        get: function () {
            return this.document.languageId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LspDocument.prototype, "version", {
        get: function () {
            return this.document.version;
        },
        enumerable: false,
        configurable: true
    });
    LspDocument.prototype.getText = function (range) {
        return this.document.getText(range);
    };
    LspDocument.prototype.positionAt = function (offset) {
        return this.document.positionAt(offset);
    };
    LspDocument.prototype.offsetAt = function (position) {
        return this.document.offsetAt(position);
    };
    Object.defineProperty(LspDocument.prototype, "lineCount", {
        get: function () {
            return this.document.lineCount;
        },
        enumerable: false,
        configurable: true
    });
    LspDocument.prototype.getLine = function (line) {
        var lineRange = this.getLineRange(line);
        return this.getText(lineRange);
    };
    LspDocument.prototype.getLineRange = function (line) {
        var lineStart = this.getLineStart(line);
        var lineEnd = this.getLineEnd(line);
        return vscode_languageserver_1.Range.create(lineStart, lineEnd);
    };
    LspDocument.prototype.getLineEnd = function (line) {
        var nextLineOffset = this.getLineOffset(line + 1);
        return this.positionAt(nextLineOffset - 1);
    };
    LspDocument.prototype.getLineOffset = function (line) {
        var lineStart = this.getLineStart(line);
        return this.offsetAt(lineStart);
    };
    LspDocument.prototype.getLineStart = function (line) {
        return vscode_languageserver_1.Position.create(line, 0);
    };
    LspDocument.prototype.applyEdit = function (version, change) {
        var content = this.getText();
        var newContent = change.text;
        if ('range' in change) {
            var start = this.offsetAt(change.range.start);
            var end = this.offsetAt(change.range.end);
            newContent = content.substr(0, start) + change.text + content.substr(end);
        }
        this.document = vscode_languageserver_textdocument_1.TextDocument.create(this.uri, this.languageId, version, newContent);
    };
    return LspDocument;
}());
exports.LspDocument = LspDocument;
var LspDocuments = /** @class */ (function () {
    function LspDocuments() {
        this._files = [];
        this.documents = new Map();
    }
    Object.defineProperty(LspDocuments.prototype, "files", {
        /**
         * Sorted by last access.
         */
        get: function () {
            return this._files;
        },
        enumerable: false,
        configurable: true
    });
    LspDocuments.prototype.get = function (file) {
        var document = this.documents.get(file);
        if (!document) {
            return undefined;
        }
        if (this.files[0] !== file) {
            this._files.splice(this._files.indexOf(file), 1);
            this._files.unshift(file);
        }
        return document;
    };
    LspDocuments.prototype.open = function (file, doc) {
        if (this.documents.has(file)) {
            return false;
        }
        this.documents.set(file, new LspDocument(doc));
        this._files.unshift(file);
        return true;
    };
    LspDocuments.prototype.close = function (file) {
        var document = this.documents.get(file);
        if (!document) {
            return undefined;
        }
        this.documents["delete"](file);
        this._files.splice(this._files.indexOf(file), 1);
        return document;
    };
    return LspDocuments;
}());
exports.LspDocuments = LspDocuments;
