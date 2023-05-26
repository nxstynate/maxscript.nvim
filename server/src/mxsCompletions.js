"use strict";
exports.__esModule = true;
exports.provideCompletionItems = void 0;
var vscode_languageserver_1 = require("vscode-languageserver");
//------------------------------------------------------------------------------------------
var mxsSchema_1 = require("./schema/mxsSchema");
var mxsSchema_clases_1 = require("./schema/mxsSchema-clases");
var mxsSchema_interfaces_1 = require("./schema/mxsSchema-interfaces");
var mxsSchema_structs_1 = require("./schema/mxsSchema-structs");
//------------------------------------------------------------------------------------------
// trigger completion for method call
var dotPattern = /([A-Za-z_][A-Za-z0-9_]+)[.]$/mi;
/**
 * Retrieve the completion items, search for descendant completion items.
 * @param document
 * @param position
 */
function provideCompletionItems(document, position) {
    var lineTillCurrentPosition = document.getText(vscode_languageserver_1.Range.create(position.line, 0, position.line, position.character));
    // if (!(util.isPositionInString(lineTillCurrentPosition))) { return []; }
    var termMatch = dotPattern.exec(lineTillCurrentPosition);
    // console.log(termMatch);
    if (termMatch) {
        // return properties, methods...
        // it must be a one-to-one relationship
        var member = mxsSchema_1.maxCompletions.find(function (item) { return item.label === termMatch[1]; });
        if (member) {
            switch (member.kind) {
                case vscode_languageserver_1.CompletionItemKind.Class:
                    return mxsSchema_clases_1.mxClassMembers === null || mxsSchema_clases_1.mxClassMembers === void 0 ? void 0 : mxsSchema_clases_1.mxClassMembers[member.label];
                case vscode_languageserver_1.CompletionItemKind.Struct:
                    return mxsSchema_structs_1.mxStructsMembers === null || mxsSchema_structs_1.mxStructsMembers === void 0 ? void 0 : mxsSchema_structs_1.mxStructsMembers[member.label];
                case vscode_languageserver_1.CompletionItemKind.Interface:
                    return mxsSchema_interfaces_1.mxInterfaceMembers === null || mxsSchema_interfaces_1.mxInterfaceMembers === void 0 ? void 0 : mxsSchema_interfaces_1.mxInterfaceMembers[member.label];
                default:
                    return [];
            }
        }
        return [];
    }
    // return complete list of completions
    return mxsSchema_1.maxCompletions;
}
exports.provideCompletionItems = provideCompletionItems;
