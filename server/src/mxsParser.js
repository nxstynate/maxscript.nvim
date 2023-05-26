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
exports.parseSourceThreaded = exports.parseSource = void 0;
var threads_1 = require("threads");
var mxsParserBase_1 = require("./mxsParserBase");
//-----------------------------------------------------------------------------------
/**
 * Parse MaxScript code
 * @param source source code string
 * @param options recovery; enable the error recovery parser. set attemps to -1 to disable attemps limit
 */
function parseSource(source, options) {
    if (options === void 0) { options = new mxsParserBase_1.parserOptions(); }
    try {
        return (0, mxsParserBase_1.parse)(source, (0, mxsParserBase_1.declareParser)());
    }
    catch (err) {
        if (options.recovery) {
            return (0, mxsParserBase_1.parseWithErrors)(source, (0, mxsParserBase_1.declareParser)(), options);
        }
        else {
            throw err;
        }
    }
}
exports.parseSource = parseSource;
function parseSourceThreaded(source, options) {
    if (options === void 0) { options = new mxsParserBase_1.parserOptions(); }
    return __awaiter(this, void 0, void 0, function () {
        var parserWorker, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, threads_1.spawn)(new threads_1.Worker('./workers/parser.worker'))];
                case 1:
                    parserWorker = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 8, 10]);
                    return [4 /*yield*/, parserWorker.parse(source, (0, mxsParserBase_1.declareParser)())];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    err_1 = _a.sent();
                    if (!options.recovery) return [3 /*break*/, 6];
                    return [4 /*yield*/, parserWorker.parseWithErrors(source, (0, mxsParserBase_1.declareParser)(), options)];
                case 5: return [2 /*return*/, _a.sent()];
                case 6: throw err_1;
                case 7: return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, threads_1.Thread.terminate(parserWorker)];
                case 9:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.parseSourceThreaded = parseSourceThreaded;
