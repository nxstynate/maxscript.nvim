"use strict";
exports.__esModule = true;
exports.pathToUri = exports.uriToPath = exports.getWordRange = exports.getlineNumberOfChar = exports.getWordAtPosition = exports.trimString = exports.precWord = exports.balancedChars = exports.prefixFile = exports.fileExists = exports.isEven = exports.isOdd = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var fs = require("fs");
var Path = require("path");
var vscode_uri_1 = require("vscode-uri");
//--------------------------------------------------------------------------------
/**
 * Test if number is Odd
 * @param x number to test
 */
var isOdd = function (x) { return !!(x & 1); };
exports.isOdd = isOdd;
/**
 * Test if number is Even
 * @param x number to test
 */
var isEven = function (x) { return !(x & 1); };
exports.isEven = isEven;
//--------------------------------------------------------------------------------
/**
 * Check if a file exists in source.
 * @param filePath File path
 */
var fileExists = function (filePath) { return fs.statSync(filePath).isFile(); }; // (await fs.promises.stat(path)).isFile();
exports.fileExists = fileExists;
/**
 * Prefix a filename providing the full file path
 * @param path Original path
 * @param prefix File prefix
 */
var prefixFile = function (path, prefix) { return Path.join(path, '..', prefix + Path.basename(path)); };
exports.prefixFile = prefixFile;
//--------------------------------------------------------------------------------
/**
 * Check for balanced pairs of char in string
 * @param src
 */
function balancedChars(src, char) {
    var _a;
    if (char === void 0) { char = '\"'; }
    var expr = new RegExp("[^\\]".concat(char), 'g');
    var doubleQuotesCnt = ((_a = expr.exec(src)) !== null && _a !== void 0 ? _a : []).length;
    doubleQuotesCnt += src.startsWith('\"') ? 1 : 0;
    return doubleQuotesCnt % 2 === 1;
}
exports.balancedChars = balancedChars;
/**
 * find word before dot character, if any
 * @param src
 */
function precWord(src) {
    var pattern = /(\w+)\.$/g;
    var wordmatches = pattern.exec(src);
    return wordmatches === null || wordmatches === void 0 ? void 0 : wordmatches[wordmatches.length - 1];
}
exports.precWord = precWord;
/**
 * Trim a substring from a source string
 * @param src source string
 * @param substr string to remove
 * @returns returns a new string
 */
function trimString(src, substr) {
    var start = src.indexOf(substr);
    var end = start + substr.length;
    return src.substring(0, start - 1) + src.substring(end);
}
exports.trimString = trimString;
/**
 * Get word in TextDocument Position
 * @param document vscode document
 * @param position vscode position
 * @param skip string to skip
 */
function getWordAtPosition(document, position, skip) {
    var wordStart = /\b[_\w\d]*$/im;
    var wordEnd = /^[_\w\d]*\b/im;
    var lineText = document.getText(vscode_languageserver_1.Range.create(position.line, 0, position.line + 1, 0));
    var lineTillCurrentPosition = lineText.slice(0, position.character);
    var lineFromCurrentPosition = lineText.slice(position.character);
    // skip lines with glob
    if (skip && lineTillCurrentPosition.includes(skip)) {
        return;
    }
    var start = wordStart.exec(lineTillCurrentPosition);
    var end = wordEnd.exec(lineFromCurrentPosition);
    if (start === null && end === null) {
        return;
    }
    var a = start && start[0] ? start[0] : '';
    var b = end && end[0] ? end[0] : '';
    return a + b;
}
exports.getWordAtPosition = getWordAtPosition;
/**
 * Return line number from char offset
 * @param data
 * @param index
 */
var getlineNumberOfChar = function (data, index) {
    return data.substring(0, index).split('\n').length;
};
exports.getlineNumberOfChar = getlineNumberOfChar;
/**
 * Get the Range of a word, providing a start position
 * @param word
 * @param position
 */
var getWordRange = function (word, position) {
    return vscode_languageserver_1.Range.create(position, vscode_languageserver_1.Position.create(position.line, position.character + word.length - 1));
};
exports.getWordRange = getWordRange;
/*
 * Copyright (C) 2017, 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * Return a path string from URI object
 * @param stringUri
 */
function uriToPath(stringUri) {
    var uri = vscode_uri_1.URI.parse(stringUri);
    if (uri.scheme !== 'file') {
        return;
    }
    return uri.fsPath;
}
exports.uriToPath = uriToPath;
/**
 * Return URI object from string path
 * @param filepath
 * @param documents
 */
function pathToUri(filepath, documents) {
    var fileUri = vscode_uri_1.URI.file(filepath);
    var document = documents && documents.get(fileUri.fsPath);
    return document ? document.uri : fileUri.toString();
}
exports.pathToUri = pathToUri;
