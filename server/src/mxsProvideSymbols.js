"use strict";
exports.__esModule = true;
exports.collectTokens = exports.deriveSymbolsTree = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
var mxsSymbolDef_1 = require("./schema/mxsSymbolDef");
//@ts-ignore
var ast_monkey_traverse_1 = require("ast-monkey-traverse");
//-----------------------------------------------------------------------------------
/** Verify that the node is valid */
var isNode = function (node) { return typeof node === 'object' && node != null; };
/**
 * Ranges produced by moo needs to be adjusted, since it starts at 1:1, and for vscode is 0:0
 * line: the line number of the beginning of the match, starting from 1.
 * col: the column where the match begins, starting from 1.
 */
var rangeRemap = function (r) {
    return ({
        start: {
            line: r.start.line - 1,
            character: r.start.character - 1
        },
        end: {
            line: r.end.line - 1,
            character: r.end.character - 1
        }
    });
};
/** Derive Range from token location */
var tokenRange = function (t) {
    return ({
        start: {
            line: t.line,
            character: t.col
        },
        end: {
            line: t.line,
            character: t.col + t.text.length
        }
    });
};
//-----------------------------------------------------------------------------------
/**
 * Derive a DocumentSymbol collection from the CSTree
 * Collects only node types in the filter.
 * Only constructs like functions, structs, declarations, etc have an ID property and will form part of the Outline tree
 * @param nodes Abstract Syntax tree source
 * @param documentRange Document START and END ranges
 * @param keyFilter ? Object with keys:[] to be collected.
 */
function deriveSymbolsTree(nodes, documentRange, keyFilter) {
    if (keyFilter === void 0) { keyFilter = 'id'; }
    // start with a root dummynode ...
    var stack = {
        //id: '',
        name: '',
        kind: 1,
        range: documentRange,
        selectionRange: documentRange,
        children: []
    };
    function _visit(node, parent) {
        // if (!node) { return []; }
        var _node;
        if (isNode(node) && keyFilter in node) {
            // only constructs like functions, strutcts and so on have an ID property
            // the node 'id' value is a moo token with the node identifier
            var token = node[keyFilter].value;
            // if node doesnt have a location, infer it from the token AND adjust line and char difference !
            var loc = rangeRemap(node.range || tokenRange(token));
            _node = {
                name: token.text,
                detail: node.type || 'unknown',
                kind: node.type != null ? (mxsSymbolDef_1.SymbolKindMatch[node.type] || vscode_languageserver_1.SymbolKind.Method) : vscode_languageserver_1.SymbolKind.Method,
                range: loc,
                selectionRange: loc
            };
            // Push the node in the parent child collection
            parent.children != null ? parent.children.push(_node) : parent.children = [_node];
        }
        else {
            _node = parent;
        }
        //--------------------------------------------------------
        // get the node keys
        var keys = Object.keys(node);
        // loop through the keys
        for (var i = 0; i < keys.length; i++) {
            // child is the value of each key
            var key = keys[i];
            var child = node[key];
            // could be an array of nodes or just an object
            if (Array.isArray(child)) {
                // value is an array, visit each item
                for (var j = 0; j < child.length; j++) {
                    // visit each node in the array
                    if (isNode(child[j])) {
                        _visit(child[j], _node);
                    }
                }
            }
            else if (isNode(child)) {
                _visit(child, _node);
            }
        }
    }
    // start visit
    _visit(nodes, stack);
    // return only the root node childrens...
    return stack.children;
}
exports.deriveSymbolsTree = deriveSymbolsTree;
//-----------------------------------------------------------------------------------
/**
 * Return errorSymbol from invalid tokens
 * @param CST the CST
 */
function collectTokens(CST, key, value) {
    if (key === void 0) { key = 'type'; }
    var Tokens = [];
    if (value) {
        (0, ast_monkey_traverse_1.traverse)(CST, function (key1, val1, innerObj) {
            // const current = val1 ?? key1;
            if (key1 === key && val1 === value) {
                Tokens.push(innerObj.parent);
            }
            return val1 !== null && val1 !== void 0 ? val1 : key1; // current
        });
    }
    else {
        (0, ast_monkey_traverse_1.traverse)(CST, function (key1, val1, innerObj) {
            // const current = val1 ?? key1;
            if (key1 === key) {
                Tokens.push(innerObj.parent);
            }
            return val1 !== null && val1 !== void 0 ? val1 : key1; // current
        });
    }
    return Tokens;
}
exports.collectTokens = collectTokens;
