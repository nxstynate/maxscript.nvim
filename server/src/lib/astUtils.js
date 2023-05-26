"use strict";
exports.__esModule = true;
exports.rangeUtil = exports.findParentName = exports.parentPath = exports.getNodesByKeyFromCST = exports.getFromCST = exports.hasKey = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var object_path_1 = require("object-path");
//@ts-ignore
var ast_monkey_util_1 = require("ast-monkey-util");
//@ts-ignore
var ast_get_object_1 = require("ast-get-object");
//@ts-ignore
var ast_get_values_by_key_1 = require("ast-get-values-by-key");
//@ts-ignore
var ast_monkey_traverse_1 = require("ast-monkey-traverse");
//-----------------------------------------------------------------------------------
function hasKey(obj, key) {
    return typeof obj === "object" && obj !== null && key in obj;
}
exports.hasKey = hasKey;
var getFromCST = function (CST, keyValPair) { return (0, ast_get_object_1.getObj)(CST, keyValPair); };
exports.getFromCST = getFromCST;
/**
 * Get CST all nodes with key
 * @param CST
 * @param key
 */
var getNodesByKeyFromCST = function (CST, key) { return (0, ast_get_values_by_key_1.getByKey)(CST, key); };
exports.getNodesByKeyFromCST = getNodesByKeyFromCST;
//-----------------------------------------------------------------------------------
/**
 * Retrieve an object-path notation pruning n branches/leafs
 * Partially extracted from ast-monkey-util
 * @param {string} path The path of the current node/key
 * @param {number} [level] Level to retrieve
 */
function parentPath(path, level) {
    if (level === void 0) { level = 1; }
    var res = path;
    for (var i = 1; i < level; i++) {
        res = (0, ast_monkey_util_1.pathUp)(res);
    }
    return res;
}
exports.parentPath = parentPath;
/**
 * Looks for a key in the inmediate parent, going up the tree, returns the value of the first match, if any.
 * @param {any} CST The CST
 * @param {string} path The path of the current node/leaf
 * @param {string} [key] Key value to search for
 */
function findParentName(CST, path, key) {
    if (key === void 0) { key = 'id.value.text'; }
    // this is faster than using ats-money find method
    var roots = path.split('.');
    // no parent!
    if (roots.length < 2) {
        return;
    }
    // GET THE FIRST NODE WITH AN ID KEY
    while (roots.length > 0) {
        var thePath = roots.join('.');
        var theNode = object_path_1["default"].get(CST, thePath);
        if (theNode && 'id' in theNode) {
            return object_path_1["default"].get(CST, thePath.concat('.', key));
        }
        roots.pop();
    }
    /*
    let i = roots.length;
    do {
        let thePath = roots.slice(0, i).concat(key).join('.');
        let theNode = objectPath.get(CST, thePath);
        if (theNode != null) return theNode;
        i = i - 1;
    } while (i > 0);
    */
    return;
}
exports.findParentName = findParentName;
/*
type traverseCallback = (key: string, val: any, innerObj?: any, stop?: any) => string;
type traverse = (n:any, fn: traverseCallback) => void;
*/
/**
 * Functions for getting the range of a statement. Grouped in a static class for coherency
 */
var rangeUtil = /** @class */ (function () {
    function rangeUtil() {
    }
    rangeUtil.offsetFromLineCol = function (src, node) {
        var lines = Array.isArray(src) ? src : src.split('\n');
        var charcount = lines.slice(0, node.line - 1).reduce(function (prev, next) {
            return prev + next.length + 1;
        }, 0);
        return (charcount += node.col - 1);
    };
    rangeUtil.LineCol2charRange = function (src, node) {
        var offset = rangeUtil.offsetFromLineCol(src, node);
        return {
            start: offset,
            end: offset + node.text.length
        };
    };
    /**
     * Get the range of the statement from the offset of the first and last child of the node
     * @param node CST node
     */
    rangeUtil.nodeLength = function (node) {
        var childs = [];
        // traverse the node to collect first and last child offset
        (0, ast_monkey_traverse_1.traverse)(node, function (key, val, innerObj) {
            var current = val !== null && val !== void 0 ? val : key;
            if (key === 'offset') {
                childs.push(innerObj.parent);
            }
            // if you are traversing and "stumbled" upon an object, it will have both "key" and "val"
            // if you are traversing and "stumbled" upon an array, it will have only "key"
            // you can detect either using the principle above.
            // you can also now change "current" - what you return will be overwritten.
            // return `NaN` to give instruction to delete currently traversed piece of AST.
            // stop - set stop.now = true; to stop the traversal
            return current;
        });
        // Childs
        var start = childs[0].offset;
        var last = childs[childs.length - 1];
        return {
            start: start,
            end: (last.offset + last.text.length)
        };
    };
    /**
     *  Get the range of the statement from the line-column of the first and last child of the node
     * @param source Reference, the original string.
     * @param node CST node
     */
    rangeUtil.fromChildsLC = function (node) {
        var childs = [];
        // traverse the node to collect first and last child offset
        (0, ast_monkey_traverse_1.traverse)(node, function (key, val, innerObj) {
            var current = val !== null && val !== void 0 ? val : key;
            if (key === 'line') {
                childs.push(innerObj.parent);
            }
            return current;
        });
        var last = childs[childs.length - 1];
        return {
            start: {
                line: childs[0].line,
                character: childs[0].col
            },
            end: {
                line: last.line,
                character: last.col
            }
        };
    };
    /**
     * Get the position of the last child
     * @param node CST node
     */
    rangeUtil.lastChildPos = function (node) {
        var childs = [];
        // traverse the node to collect first and last child offset
        (0, ast_monkey_traverse_1.traverse)(node, function (key1, val1, innerObj, stop) {
            var current = val1 !== null && val1 !== void 0 ? val1 : key1;
            if (key1 === 'line') {
                childs.push(innerObj.parent);
            }
            return current;
        });
        var last = childs[childs.length - 1];
        return { line: last.line, character: last.col };
    };
    /**
     * Ensures that the target range is included in an given Reference Range
     * @param ref
     * @param rec
     */
    rangeUtil.equalize = function (ref, rec /*, document: TextDocument*/) {
        var compare = function (a, b) {
            var res = vscode_languageserver_1.Position.create(0, 0);
            // line position of B can be less or eq
            if (a.line > b.line) {
                res.line = b.line;
                // char of B can be more if line is less
                res.character = b.character;
            }
            else {
                // line of B is more than line of A
                res.line = a.line;
                // also, character must not be more than A
                res.character = b.character > a.character ? a.character : b.character;
                /*
                let ext = document.getText(
                    {
                        start:
                        {
                            line: a.line,
                            character: 0
                        },
                        end:
                        {
                            line: a.line,
                            character: Number.MAX_SAFE_INTEGER
                        }
                    }
                );
    
                // here B character must be less or eq than A line length.
                res.character = b.character > ext.length ?  ext.length : b.character;
                */
            }
            return res;
        };
        return {
            start: compare(ref.start, rec.start),
            end: compare(ref.end, rec.end)
        };
    };
    /**
     * Get Range from token line & col
     * @param token moo token
     */
    rangeUtil.getTokenRange = function (token /* , document?: TextDocument */) {
        // let tokenRange =
        return vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(token.line - 1, token.col - 1), vscode_languageserver_1.Position.create(token.line + token.lineBreaks - 1, token.col + (token.text.length || token.value.length) - 1));
    };
    rangeUtil.rangeFromWord = function (word, pos) {
        return {
            start: pos,
            end: {
                line: pos.line,
                character: pos.character + word.length - 1
            }
        };
    };
    return rangeUtil;
}());
exports.rangeUtil = rangeUtil;
//-----------------------------------------------------------------------------------
