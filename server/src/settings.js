"use strict";
exports.__esModule = true;
exports.defaultSettings = void 0;
//------------------------------------------------------------------------------------------
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
//------------------------------------------------------------------------------------------
// put default settings here
exports.defaultSettings = {
    GoToSymbol: true,
    GoToDefinition: true,
    Diagnostics: true,
    Completions: true,
    MinifyFilePrefix: 'min_',
    formatter: {
        indentOnly: true,
        indentChar: '\t',
        whitespaceChar: ' '
    },
    parser: {
        errorCheck: true,
        multiThreading: true,
        errorLimit: 10
    },
    prettifier: {
        filePrefix: 'pretty_',
        codeblock: {
            newlineAtParens: true,
            newlineAllways: true,
            spaced: true
        },
        statements: {
            optionalWhitespace: false
        },
        list: {
            useLineBreaks: true
        }
    },
    language: { semantics: true }
};
