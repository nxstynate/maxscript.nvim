"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.mxsReflow = exports.options = exports.reflowOptions = void 0;
//-----------------------------------------------------------------------------------
// options....
var reflowOptions //implements reflowOptions
 = /** @class */ (function () {
    function reflowOptions(spacer, linebreak, indent) {
        this.indent = indent !== null && indent !== void 0 ? indent : '\t';
        this.spacer = spacer !== null && spacer !== void 0 ? spacer : ' ';
        this.linebreak = linebreak !== null && linebreak !== void 0 ? linebreak : '\n';
        this.wrapIdentities = false,
            this.elements = {
                useLineBreaks: true
            };
        this.statements = {
            optionalWhitespace: false
        };
        this.expression = { useWhiteSpace: false };
        this.codeblock = {
            newlineAtParens: true,
            newlineAllways: true,
            spaced: true
        };
        this.indentAt = new RegExp("".concat(this.linebreak), 'g');
    }
    reflowOptions.prototype.reset = function () {
        this.indent = '\t';
        this.spacer = ' ';
        this.linebreak = '\n';
        this.wrapIdentities = false,
            this.elements = {
                useLineBreaks: true
            };
        this.statements = {
            optionalWhitespace: false
        };
        this.expression = { useWhiteSpace: false };
        this.codeblock = {
            newlineAtParens: true,
            newlineAllways: true,
            spaced: true
        };
        this.indentAt = new RegExp("".concat(this.linebreak), 'g');
    };
    return reflowOptions;
}());
exports.reflowOptions = reflowOptions;
exports.options = new reflowOptions();
//-----------------------------------------------------------------------------------
//TODO: MINUS WHITESPACE -- KEEP ONLY FOR UNARY EXPRESSION!!!
function optionalWS(values, empty, ws) {
    if (empty === void 0) { empty = ''; }
    if (ws === void 0) { ws = ' '; }
    // at the end
    var w_ = /\w$/im;
    var s_ = /\W$/im;
    var m_ = /-$/im;
    var d_ = /\d$/im;
    var c_ = /\:$/im;
    var cc_ = /\:\:$/im;
    // at the start
    var _w = /^\w/im;
    var _s = /^\W/im;
    var _m = /^-/im;
    var _d = /^\d/im;
    var _c = /^\:/im;
    var _cc = /^\:\:/im;
    var _eq = /^=/im;
    var res = values.reduce(function (acc, curr) {
        if (
        // alpha - alpha
        w_.test(acc) && _w.test(curr)
            // minus - minus
            || m_.test(acc) && _m.test(curr)
            // alpha - minus *** this will break expressions
            // || w_.test(acc) && _m.test(curr)
            // minus - alpha *** this will break expressions
            // || m_.test(acc) && _w.test(curr)
            // number - colon
            || d_.test(acc) && _c.test(curr)
            // colon - number
            // || c_.test(acc) && _d.test(curr)
            // alphanum - double colon
            || w_.test(acc) && _cc.test(curr)
            // param: - param:
            || c_.test(acc) && c_.test(curr)
            // param: =
            || c_.test(acc) && _eq.test(curr)) {
            return (acc + ws + curr);
        }
        else {
            return (acc + empty + curr);
        }
    });
    return res;
}
// Objects to construct the codeMap...EXPTESSION | STATEMENT | ELEMENTS | CODEBLOCK
// join elems with WS, one line:
// statement
var Statement = /** @class */ (function () {
    function Statement() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.type = 'statement';
        this.value = [];
        this.optionalWhitespace = false;
        this.addLinebreaks = true;
        this.add.apply(this, args);
    }
    Object.defineProperty(Statement.prototype, "toString", {
        get: function () {
            var _this = this;
            if (!exports.options.statements.optionalWhitespace && !this.optionalWhitespace) {
                var res = this.value.reduce(function (acc, curr) {
                    if (curr.includes(exports.options.linebreak) && _this.addLinebreaks) {
                        return acc + exports.options.linebreak + curr;
                    }
                    else {
                        return acc + exports.options.spacer + curr;
                    }
                });
                return res;
            }
            else {
                return optionalWS(this.value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Statement.prototype.add = function () {
        var _a;
        var value = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            value[_i] = arguments[_i];
        }
        this.value = (_a = this.value).concat.apply(_a, value.filter(function (e) { return e != null; }));
    };
    return Statement;
}());
// join elemns with NL.. block of code
//block
var Codeblock = /** @class */ (function () {
    function Codeblock() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.type = 'codeblock';
        this.value = [];
        this.indent = false;
        this.wrapped = false;
        this.add.apply(this, args);
        // this.indentPattern
    }
    Object.defineProperty(Codeblock.prototype, "toString", {
        get: function () {
            // test for linebreaks...
            // pass
            var pass = true;
            if (Array.isArray(this.value)) {
                pass = this.value.length > 1 || (this.value[0] && this.value[0].includes(exports.options.linebreak));
            }
            if (this.wrapped) {
                if (exports.options.codeblock.newlineAtParens && pass) {
                    var res = [].concat('(', this.value).join(exports.options.linebreak);
                    if (this.indent) {
                        res = res.replace(exports.options.indentAt, "".concat(exports.options.linebreak).concat(exports.options.indent));
                    }
                    res = res.concat(exports.options.linebreak, ')');
                    return res;
                }
                else {
                    return exports.options.codeblock.spaced
                        ? "(".concat(exports.options.spacer).concat(this.value.join(exports.options.linebreak)).concat(exports.options.spacer, ")")
                        : "(".concat(this.value.join(exports.options.linebreak), ")");
                }
            }
            else if (exports.options.codeblock.newlineAllways /* pass */) {
                var res = this.value.join(exports.options.linebreak);
                if (this.indent) {
                    res = res.replace(exports.options.indentAt, "".concat(exports.options.linebreak).concat(exports.options.indent));
                }
                return res;
            }
            else {
                return exports.options.codeblock.spaced
                    ? this.value.join(exports.options.spacer)
                    : optionalWS(this.value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Codeblock.prototype.add = function () {
        var _a;
        var value = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            value[_i] = arguments[_i];
        }
        if (value[0] != null) {
            this.value = (_a = this.value).concat.apply(_a, value.filter(function (e) { return e != null; }));
        }
    };
    return Codeblock;
}());
// join elems with ',' list of items
//list
var Elements = /** @class */ (function () {
    function Elements() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.listed = false;
        this.type = 'elements';
        this.value = [];
        this.indent = false;
        this.add.apply(this, args);
    }
    Object.defineProperty(Elements.prototype, "toString", {
        get: function () {
            if (this.listed && exports.options.elements.useLineBreaks) {
                var res = this.value.join(',' + exports.options.linebreak);
                if (this.indent) {
                    res = res.replace(exports.options.indentAt, "".concat(exports.options.linebreak).concat(exports.options.indent));
                }
                return res;
            }
            else {
                return this.value.join(',' + exports.options.spacer);
            }
        },
        enumerable: false,
        configurable: true
    });
    Elements.prototype.add = function () {
        var _a;
        var value = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            value[_i] = arguments[_i];
        }
        if (value[0] != null) {
            this.value = (_a = this.value).concat.apply(_a, value.filter(function (e) { return e != null; }));
        }
    };
    return Elements;
}());
// expressions
var Expr = /** @class */ (function () {
    function Expr() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.type = 'expr';
        this.value = [];
        this.add.apply(this, args);
    }
    Object.defineProperty(Expr.prototype, "toString", {
        get: function () {
            if (exports.options.expression.useWhiteSpace) {
                return optionalWS(this.value);
            }
            else {
                return this.value.join('');
            }
        },
        enumerable: false,
        configurable: true
    });
    Expr.prototype.add = function () {
        var _a;
        var value = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            value[_i] = arguments[_i];
        }
        this.value = (_a = this.value).concat.apply(_a, value.filter(function (e) { return e != null; }));
    };
    return Expr;
}());
//-----------------------------------------------------------------------------------
/**
 * Check if value is node
 * @param {any} node CST node
 */
function isNode(node) {
    return (typeof node === 'object' && node != undefined);
}
/**
 * filter nodes by type property
 * @param {any} node CST node
 */
function getNodeType(node) {
    return (node.hasOwnProperty('type')) ? node.type : undefined;
}
/**
 * Apply node transform to PARENT KEY!
 */
function editNode(callback, node, parent, key, level, index) {
    var res = callback(node, parent, key, level, index);
    // apply indentation to hig-level rules
    // if (isNode(res) && 'indent' in res) { res.indent = level; }
    index != null ? parent[key][index] = res : parent[key] = res;
}
/*
function removeNode(node, parent, key, index) {
    if (key in parent) {
        index != null ? parent[key].splice(index, 1) : delete parent[key]
    }
}
*/
//-----------------------------------------------------------------------------------
/**
 * Visit and derive CST to a recoverable code map
 * @param {any} tree CST node
 * @param {any} callbackMap Patterns function
 */
function derive(tree, callbackMap) {
    var _this = this;
    var _visit = function (node, parent, key, level, index) {
        var nodeType = getNodeType(node);
        // get the node keys
        var keys = Object.keys(node);
        // loop through the keys
        for (var i = 0; i < keys.length; i++) {
            // child is the value of each key
            var key_1 = keys[i];
            var child = node[key_1];
            // could be an array of nodes or just an object
            if (Array.isArray(child)) {
                for (var j = 0; j < child.length; j++) {
                    if (isNode(child[j])) {
                        _visit(child[j], node, key_1, level + 1, j);
                    }
                }
            }
            else if (isNode(child)) {
                _visit(child, node, key_1, level + 1, null);
            }
        }
        if (callbackMap[nodeType]) {
            if (parent) {
                editNode.call(_this, callbackMap[nodeType], node, parent, key, level, index);
            }
            else {
                return node;
            }
        }
    };
    _visit(tree, tree, null, 0, null);
}
/**
 * Visit and derive Code from a recoverable code map
 * @param {any} tree CodeMap node
 */
function reduce(tree) {
    function _visit(node, parent, key, level, index) {
        var keys = Object.keys(node);
        for (var i = 0; i < keys.length; i++) {
            var key_2 = keys[i];
            // for (const key in node) {
            var child = node[key_2];
            if (Array.isArray(child)) {
                for (var j = 0; j < child.length; j++) {
                    if (isNode(child[j])) {
                        _visit(child[j], node, key_2, level + 1, j);
                    }
                }
            }
            else if (isNode(child)) {
                _visit(child, node, key_2, level + 1, null);
            }
        }
        var res;
        if (getNodeType(node) && parent) {
            // if ('indent' in node) { node.indent = level; }
            res = node.toString;
        }
        else {
            res = node;
        }
        if (key) {
            index != null ? parent[key][index] = res : parent[key] = res;
        }
    }
    _visit(tree, tree, null, 0, null);
}
//-----------------------------------------------------------------------------------
// utility functions
var isArrayUsed = function (val) { return val && Array.isArray(val) && val.length > 0 ? true : false; };
var isNotEmpty = function (val) { return val && !Array.isArray(val) || Array.isArray(val) && val.length > 0 ? true : false; };
var toArray = function (val) { return Array.isArray(val) ? val : [val]; };
/*
var wrap = function (func) {
    return function () {
        var args = [...arguments].splice(0);
        return func.apply(this, args);
    };
};
function nodeText(node:any) {
    index != null ? parent[key][index] = node.text : parent[key] = node.text;
}
function nodeValue(node:any) {
    index != null ? parent[key][index] = node.value : parent[key] = node.value;
}
function wrapInParens(node, key) {
    return [
        '(',
        ...toArray(node[key]),
        ')'
    ];
}
*/
//-----------------------------------------------------------------------------------
/**
 * Token transformations
 */
var tokensValue = {
    global_typed: function (node) { return node.text; },
    hex: function (node) { return node.text; },
    identity: function (node) { return node.text; },
    locale: function (node) { return node.text; },
    name: function (node) { return node.text; },
    number: function (node) { return node.text; },
    path: function (node) { return node.text; },
    string: function (node) { return node.text; },
    time: function (node) { return node.text; },
    property: function (node) { return node.value; },
    params: function (node) { return node.value; },
    math: function (node) { return node.value; },
    assign: function (node) { return node.value; },
    comparison: function (node) { return node.value; },
    keyword: function (node) { return node.text; },
    kw_about: function (node) { return node.text; },
    kw_as: function (node) { return node.text; },
    kw_at: function (node) { return node.text; },
    kw_attributes: function (node) { return node.text; },
    kw_bool: function (node) { return node.text; },
    kw_by: function (node) { return node.text; },
    kw_case: function (node) { return node.text; },
    kw_catch: function (node) { return node.text; },
    kw_collect: function (node) { return node.text; },
    kw_compare: function (node) { return node.text; },
    kw_context: function (node) { return node.text; },
    kw_coordsys: function (node) { return node.text; },
    kw_defaultAction: function (node) { return node.text; },
    kw_do: function (node) { return node.text; },
    kw_else: function (node) { return node.text; },
    kw_exit: function (node) { return node.text; },
    kw_for: function (node) { return node.text; },
    kw_from: function (node) { return node.text; },
    kw_function: function (node) { return node.text; },
    kw_global: function (node) { return node.text; },
    kw_group: function (node) { return node.text; },
    kw_if: function (node) { return node.text; },
    kw_in: function (node) { return node.text; },
    kw_level: function (node) { return node.text; },
    kw_local: function (node) { return node.text; },
    kw_macroscript: function (node) { return node.text; },
    kw_mapped: function (node) { return node.text; },
    kw_menuitem: function (node) { return node.text; },
    kw_not: function (node) { return node.text; },
    kw_null: function (node) { return node.text; },
    kw_objectset: function (node) { return node.text; },
    kw_of: function (node) { return node.text; },
    kw_on: function (node) { return node.text; },
    kw_parameters: function (node) { return node.text; },
    kw_persistent: function (node) { return node.text; },
    kw_plugin: function (node) { return node.text; },
    kw_rcmenu: function (node) { return node.text; },
    kw_return: function (node) { return node.text; },
    kw_rollout: function (node) { return node.text; },
    kw_scope: function (node) { return node.value; },
    kw_separator: function (node) { return node.text; },
    kw_set: function (node) { return node.text; },
    kw_struct: function (node) { return node.text; },
    kw_submenu: function (node) { return node.text; },
    kw_then: function (node) { return node.text; },
    kw_time: function (node) { return node.text; },
    kw_to: function (node) { return node.text; },
    kw_tool: function (node) { return node.text; },
    kw_try: function (node) { return node.text; },
    kw_uicontrols: function (node) { return node.text; },
    kw_undo: function (node) { return node.text; },
    kw_utility: function (node) { return node.text; },
    kw_when: function (node) { return node.text; },
    kw_where: function (node) { return node.text; },
    kw_while: function (node) { return node.text; },
    kw_with: function (node) { return node.text; },
    error: function (node) { return node.text; }
};
/**
 * expressions-statements tranformations
 */
var conversionRules = __assign(__assign({}, tokensValue), { 
    // LITERALS
    Literal: function (node) { return node.value; }, Identifier: function (node) { return exports.options.wrapIdentities ? "'".concat(node.value, "'") : node.value; }, Identifier_global: function (node) { return '::' + node.value; }, EmptyParens: function () { return '()'; }, Parameter: function (node) { return new Expr(node.value, ':'); }, BitRange: function (node) { return new Expr(node.start, '..', node.end); }, 
    //-------------------------------------------------------------------------------------------
    // DECLARATION
    Declaration: function (node) {
        return new Statement(node.id, node.operator, node.value);
    }, 
    // Types
    ObjectArray: function (node) {
        var res = new Expr('#(');
        if (isArrayUsed(node.elements)) {
            var elems_1 = new Elements();
            node.elements.forEach(function (e) {
                // just to be safe, it should be reduced by now...
                if (isArrayUsed(e)) {
                    var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], e, false)))();
                    body.indent = true;
                    elems_1.add(body);
                }
                else {
                    elems_1.add(e);
                }
            });
            res.add(elems_1);
        }
        else if (isNotEmpty(node.elements)) {
            res.add(node.elements);
        }
        res.add(')');
        return res;
    }, ObjectBitArray: function (node) {
        var res = new Expr('#{');
        if (isArrayUsed(node.elements)) {
            var elems_2 = new Elements();
            node.elements.forEach(function (e) {
                // just to be safe, it should be reduced by now...
                if (isArrayUsed(e)) {
                    var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], e, false)))();
                    body.indent = true;
                    elems_2.add(body);
                }
                else if (isNotEmpty(e)) {
                    elems_2.add(e);
                }
            });
            res.add(elems_2);
        }
        else if (isNotEmpty(node.elements)) {
            res.add(node.elements);
        }
        res.add('}');
        return res;
    }, ObjectPoint4: function (node) {
        return new Expr('[', new (Elements.bind.apply(Elements, __spreadArray([void 0], node.elements, false)))(), ']');
    }, ObjectPoint3: function (node) {
        return new Expr('[', new (Elements.bind.apply(Elements, __spreadArray([void 0], node.elements, false)))(), ']');
    }, ObjectPoint2: function (node) {
        return new Expr('[', new (Elements.bind.apply(Elements, __spreadArray([void 0], node.elements, false)))(), ']');
    }, 
    // Accesors
    AccessorIndex: function (node) {
        return new Expr(node.operand, '[', node.index, ']');
    }, AccessorProperty: function (node) {
        return new Expr(node.operand, '.', node.property);
    }, 
    // Call
    CallExpression: function (node) {
        var res = new (Statement.bind.apply(Statement, __spreadArray([void 0, node.calle], toArray(node.args), false)))();
        res.addLinebreaks = false;
        if (node.args.includes('()')) {
            res.optionalWhitespace = true;
        }
        return res;
    }, 
    // Assign
    ParameterAssignment: function (node) {
        var res = new Statement(node.param, node.value);
        res.addLinebreaks = false;
        return res;
    }, AssignmentExpression: function (node) {
        return new Statement(node.operand, node.operator, node.value);
    }, 
    // Functions
    Function: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray(__spreadArray(__spreadArray([void 0, node.modifier,
            node.keyword,
            node.id], toArray(node.args), false), toArray(node.params), false), ['='], false)))();
        var res = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0, stat], toArray(node.body), false)))();
        res.indent = false;
        return res;
    }, FunctionReturn: function (node) {
        return new Statement('return', node.body || ';');
    }, 
    // Declarations
    VariableDeclaration: function (node) {
        var decls;
        if (isArrayUsed(node.decls)) {
            if (node.decls.length > 1) {
                decls = new (Elements.bind.apply(Elements, __spreadArray([void 0], node.decls, false)))();
                decls.listed = true;
            }
            else {
                decls = node.decls;
            }
        }
        else if (isNotEmpty(node.decls)) {
            decls = [node.decls];
        }
        var res = new (Statement.bind.apply(Statement, __spreadArray([void 0, node.modifier,
            node.scope], toArray(decls), false)))();
        return res;
    }, 
    // SIMPLE EXPRESSIONS - OK
    MathExpression: function (node) {
        return new Statement(node.left, node.operator, node.right);
    }, LogicalExpression: function (node) {
        return new Statement(node.left, node.operator, node.right);
    }, 
    /** Added a dummy whitespace */
    UnaryExpression: function (node) {
        if (exports.options.statements.optionalWhitespace) {
            return new Expr(' ', node.operator, node.right);
        }
        else {
            return new Expr(node.operator, node.right);
        }
    }, 
    // STATEMENTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    BlockStatement: function (node) {
        // /*
        var res = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        res.wrapped = true;
        res.indent = true;
        return res;
        // */
        /*
        let res = new codeblock(
            '(',
            ...toArray(node.body),
            ')'
        );
        return res;
        */
    }, IfStatement: function (node) {
        var res;
        var stat = new Statement('if', node.test, node.operator);
        if (node.consequent.type === 'codeblock') {
            res = new Codeblock(stat, node.consequent);
            if (node.alternate) {
                res.add('else', node.alternate);
            }
        }
        else {
            stat.add(node.consequent);
            if (node.alternate) {
                if (node.alternate.type === 'codeblock') {
                    stat.add('else');
                    res = new Codeblock(stat, node.alternate);
                }
                else {
                    stat.add('else', node.alternate);
                    res = stat;
                }
            }
            else {
                res = stat;
            }
        }
        return res;
    }, TryStatement: function (node) {
        var test = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'try'], toArray(node.body), false)))();
        var catcher = new Statement('catch', node.finalizer);
        var res = new Codeblock(test, catcher);
        return res;
    }, DoWhileStatement: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'do'], toArray(node.body), false)))();
        var test = new Statement('while', node.test);
        var res = new Codeblock(stat, test);
        return res;
    }, WhileStatement: function (node) {
        var res = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'while',
            node.test,
            'do'], toArray(node.body), false)))();
        return res;
    }, ForStatement: function (node) {
        var res;
        var stat = new (Statement.bind.apply(Statement, __spreadArray(__spreadArray([void 0, 'for',
            node.index,
            node.iteration,
            node.value], toArray(node.sequence), false), [node.action], false)))();
        if (node.body.type === 'codeblock') {
            res = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0, stat], toArray(node.body), false)))();
        }
        else {
            stat.add.apply(stat, toArray(node.body));
            res = stat;
        }
        return res;
    }, ForLoopIndex: function (node) {
        return new Elements(node.variable, node.index_name, node.filtered_index_name);
    }, ForLoopSequence: function (node) {
        var _to = isNotEmpty(node.to) ? __spreadArray(['to'], toArray(node.to), true) : null;
        var _by = isNotEmpty(node.by) ? __spreadArray(['by'], toArray(node.by), true) : null;
        var _while = isNotEmpty(node["while"]) ? __spreadArray(['while'], toArray(node["while"]), true) : null;
        var _where = isNotEmpty(node.where) ? __spreadArray(['where'], toArray(node.where), true) : null;
        var stats = [].concat(_to, _by, _while, _where).filter(function (e) { return e != null; });
        return new (Statement.bind.apply(Statement, __spreadArray([void 0], stats, false)))();
    }, LoopExit: function (node) {
        var res = new Statement('exit');
        if (node.body) {
            res.add.apply(res, __spreadArray(['with'], toArray(node.body), false));
        }
        else {
            res.add(';');
        }
        return res;
    }, 
    /*
    case statement is somewhat broken, will never get this thing right
    adding a terminator to overcome this
    */
    CaseStatement: function (node) {
        var stat = new Statement('case', node.test, 'of');
        var fix = new Statement(exports.options.linebreak);
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.cases), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(stat, body, fix);
    }, CaseClause: function (node) {
        var res = new (Statement.bind.apply(Statement, __spreadArray([void 0, node["case"],
            ':'], toArray(node.body), false)))();
        res.optionalWhitespace = true;
        return res;
    }, 
    // context expressions
    ContextStatement: function (node) {
        return new Statement(node.context, node.body);
    }, ContextExpression: function (node) {
        return new (Statement.bind.apply(Statement, __spreadArray([void 0, node.prefix,
            node.context], toArray(node.args), false)))();
    }, 
    // Struct >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Struct: function (node) {
        var stat = new Statement('struct', node.id);
        var body = new Codeblock();
        body.wrapped = true;
        body.indent = true;
        if (isArrayUsed(node.body)) {
            // handle struct members...
            var stack_1 = null;
            node.body.forEach(function (e) {
                // test for structScope
                if (typeof e === 'string' && /(?:private|public)$/mi.test(e)) {
                    if (stack_1) {
                        //hack to overcome las missing comma, but adds an extra newline
                        stack_1.add('');
                        body.add(stack_1);
                        stack_1 = null;
                    }
                    body.add(e);
                }
                else {
                    if (!stack_1) {
                        stack_1 = new Elements(e);
                        stack_1.listed = true;
                    }
                    else {
                        stack_1.add(e);
                    }
                }
            });
            // add last stack
            if (stack_1) {
                body.add(stack_1);
            }
        }
        else if (isNotEmpty(node.body)) {
            body.add(node.body);
        }
        var res = new Codeblock(stat, body);
        return res;
    }, StructScope: function (node) { return node.value; }, 
    // StructScope: wrap(nodeValue);
    //-------------------------------------------------------------------------
    // Attributes
    EntityAttributes: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'attributes',
            node.id], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(stat, body);
    }, 
    // Plugin
    EntityPlugin: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'plugin',
            node.superclass,
            node["class"]], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        var res = new Codeblock(stat, body);
        return res;
    }, EntityPlugin_params: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'parameters',
            node.id], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(stat, body);
    }, PluginParam: function (node) {
        return new (Statement.bind.apply(Statement, __spreadArray([void 0, node.id], toArray(node.params), false)))();
    }, 
    // Tool
    EntityTool: function (node) {
        var decl = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'tool',
            node.id], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(decl, body);
    }, 
    // MacroScript
    EntityMacroscript: function (node) {
        var decl = new Statement('macroScript', node.id);
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new (Codeblock.bind.apply(Codeblock, __spreadArray(__spreadArray([void 0, decl], toArray(node.params), false), [body], false)))();
    }, 
    // Utility - Rollout
    EntityUtility: function (node) {
        var decl = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'utility',
            node.id,
            node.title], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(decl, body);
    }, EntityRollout: function (node) {
        var decl = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'rollout',
            node.id,
            node.title], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(decl, body);
    }, EntityRolloutGroup: function (node) {
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        var res = new Codeblock(new Statement('group', node.id), body);
        return res;
    }, EntityRolloutControl: function (node) {
        return new (Statement.bind.apply(Statement, __spreadArray([void 0, node["class"],
            node.id,
            node.text], toArray(node.params), false)))();
    }, 
    // rcMenu
    EntityRcmenu: function (node) {
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(new Statement('rcmenu', node.id), body);
    }, EntityRcmenu_submenu: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray([void 0, 'subMenu',
            node.label], toArray(node.params), false)))();
        var body = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0], toArray(node.body), false)))();
        body.wrapped = true;
        body.indent = true;
        return new Codeblock(stat, body);
    }, EntityRcmenu_menuitem: function (node) {
        return new (Statement.bind.apply(Statement, __spreadArray([void 0, 'menuItem',
            node.id,
            node.label], toArray(node.params), false)))();
    }, EntityRcmenu_separator: function (node) {
        return new (Statement.bind.apply(Statement, __spreadArray([void 0, 'separator',
            node.id], toArray(node.params), false)))();
    }, 
    // Event
    Event: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray(__spreadArray([void 0, 'on'], toArray(node.args), false), [node.modifier], false)))();
        var res = new Codeblock(stat, node.body);
        return res;
    }, EventArgs: function (node) {
        return new (Statement.bind.apply(Statement, __spreadArray([void 0, node.target,
            node.event], toArray(node.args), false)))();
    }, WhenStatement: function (node) {
        var stat = new (Statement.bind.apply(Statement, __spreadArray(__spreadArray([void 0, 'when'], node.args.flat(), false), ['do'], false)))();
        var res = new (Codeblock.bind.apply(Codeblock, __spreadArray([void 0, stat], toArray(node.body), false)))();
        return res;
    } });
//-----------------------------------------------------------------------------------
function mxsReflow(cst) {
    // derive code tree
    derive(cst, conversionRules);
    // reduce the tree. use options
    reduce(cst);
    return cst.join(exports.options.linebreak);
}
exports.mxsReflow = mxsReflow;
// module.exports = { mxsReflow, options };
