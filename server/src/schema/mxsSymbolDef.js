"use strict";
exports.__esModule = true;
exports.SymbolKindMatch = exports.mxsSymbols = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
exports.mxsSymbols = [
    {
        type: 'attributes',
        match: /attributes\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Constructor
    },
    {
        type: 'struct',
        match: /struct\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Struct
    },
    {
        type: 'function',
        match: /(fn|function)\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Function
    },
    /*
    {
        type: 'localVar',
        match: /local\s+(\b\w+)/ig,
        kind: SymbolKind.Variable,
    },
    {
        type: 'globalVar',
        match: /global\s+(\b\w+)/ig,
        kind: SymbolKind.Variable,
    },
    {
        type: 'globalTyped',
        match: /(::\w+)/ig,
        kind: SymbolKind.Variable,
    },
    */
    {
        type: 'plugin',
        match: /plugin\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Module
    },
    {
        type: 'macroscript',
        match: /macroscript\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Module
    },
    {
        type: 'rollout',
        match: /rollout\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Object
    },
    {
        type: 'utility',
        match: /utility\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Object
    },
    {
        type: 'tool',
        match: /(tool|mousetool)\s+(\b\w+)/ig,
        kind: vscode_languageserver_1.SymbolKind.Object
    },
    {
        type: 'event',
        match: /on\s+(\b\w+)\.+(?=do|return)/ig,
        kind: vscode_languageserver_1.SymbolKind.Event
    },
    {
        type: 'External file',
        match: /filein\s*\(*(.*)(?=\)|;|\n)/ig,
        kind: vscode_languageserver_1.SymbolKind.Package
    }
];
/**
 * Maps values from type > vcode kind enumeration
 */
exports.SymbolKindMatch = {
    'EntityAttributes': vscode_languageserver_1.SymbolKind.Object,
    'EntityRcmenu': vscode_languageserver_1.SymbolKind.Object,
    'EntityRcmenu_submenu': vscode_languageserver_1.SymbolKind.Constructor,
    'EntityRcmenu_separator': vscode_languageserver_1.SymbolKind.Object,
    'EntityRcmenu_menuitem': vscode_languageserver_1.SymbolKind.Constructor,
    'EntityPlugin': vscode_languageserver_1.SymbolKind.Object,
    'EntityPlugin_params': vscode_languageserver_1.SymbolKind.Object,
    'PluginParam': vscode_languageserver_1.SymbolKind.Constructor,
    'EntityTool': vscode_languageserver_1.SymbolKind.Object,
    'EntityUtility': vscode_languageserver_1.SymbolKind.Object,
    'EntityRollout': vscode_languageserver_1.SymbolKind.Object,
    'EntityRolloutGroup': vscode_languageserver_1.SymbolKind.Object,
    'EntityRolloutControl': vscode_languageserver_1.SymbolKind.Constructor,
    'EntityMacroscript': vscode_languageserver_1.SymbolKind.Object,
    'Struct': vscode_languageserver_1.SymbolKind.Struct,
    'Event': vscode_languageserver_1.SymbolKind.Event,
    'Function': vscode_languageserver_1.SymbolKind.Function,
    'AssignmentExpression': vscode_languageserver_1.SymbolKind.Method,
    'CallExpression': vscode_languageserver_1.SymbolKind.Method,
    'ParameterAssignment': vscode_languageserver_1.SymbolKind.Property,
    'AccessorProperty': vscode_languageserver_1.SymbolKind.Property,
    'AccessorIndex': vscode_languageserver_1.SymbolKind.Property,
    'Literal': vscode_languageserver_1.SymbolKind.Constant,
    'Identifier': vscode_languageserver_1.SymbolKind.Property,
    'Parameter': vscode_languageserver_1.SymbolKind.TypeParameter,
    'VariableDeclaration': vscode_languageserver_1.SymbolKind.Variable,
    'Declaration': vscode_languageserver_1.SymbolKind.Variable,
    'Include': vscode_languageserver_1.SymbolKind.Module
};
//# sourceMappingURL=mxsSymbolDefs.js.map
