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
exports.FormatFileThreaded = exports.FormatDocThreaded = exports.FormatFile = exports.FormatDoc = exports.FormatDataThreaded = exports.FormatData = void 0;
var threads_1 = require("threads");
var fs = require("fs");
//--------------------------------------------------------------------------------
var mxsParser_1 = require("./mxsParser");
var mxsReflow_1 = require("./lib/mxsReflow");
//--------------------------------------------------------------------------------
function setOptions(settings) {
    mxsReflow_1.options.reset();
    if (settings) {
        Object.assign(mxsReflow_1.options, settings);
    }
}
//--------------------------------------------------------------------------------
/** format code.
 * @data Parser tree or code text
 */
function FormatData(data, settings) {
    // console.log(data);
    setOptions(settings);
    // OPTIMIZATION ---> Use the already built parse tree
    // TODO: Using the CST causes a crash when the document is edited and the CST was not updated...
    // parserOptions defaults to { recovery: false, attemps: 1, memoryLimit: 0.9 }
    if (typeof data === 'string') {
        var results = (0, mxsParser_1.parseSource)(data);
        if (results.result) {
            return (0, mxsReflow_1.mxsReflow)(results.result);
        }
        else {
            throw new Error('Parser returned no results.');
        }
    }
    else {
        // this will fail if the cst is not plain...
        return (0, mxsReflow_1.mxsReflow)(data);
    }
}
exports.FormatData = FormatData;
/** format code -- threaded
 * @data Parser tree or code text
 */
function FormatDataThreaded(data, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var formatDataThreaded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, threads_1.spawn)(new threads_1.Worker('./workers/formatter.worker'))];
                case 1:
                    formatDataThreaded = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 6]);
                    return [4 /*yield*/, formatDataThreaded(data, settings)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, threads_1.Thread.terminate(formatDataThreaded)];
                case 5:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.FormatDataThreaded = FormatDataThreaded;
//--------------------------------------------------------------------------------
/** Format and save document -- threaded */
function FormatDoc(data, dest, settings) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.promises.writeFile(dest, FormatData(data, settings))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.FormatDoc = FormatDoc;
/** Read, format and save document */
function FormatFile(src, dest, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = fs.promises).writeFile;
                    _c = [dest];
                    _d = FormatData;
                    return [4 /*yield*/, fs.promises.readFile(src)];
                case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.apply(void 0, [(_e.sent()).toString(), settings])]))];
                case 2:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.FormatFile = FormatFile;
/** Format and save document */
function FormatDocThreaded(data, dest, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (_a = fs.promises).writeFile;
                    _c = [dest];
                    return [4 /*yield*/, FormatDataThreaded(data, settings)];
                case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                case 2:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.FormatDocThreaded = FormatDocThreaded;
/** Read, format and save document -- threaded*/
function FormatFileThreaded(src, dest, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = fs.promises).writeFile;
                    _c = [dest];
                    _d = FormatDataThreaded;
                    return [4 /*yield*/, fs.promises.readFile(src)];
                case 1: return [4 /*yield*/, _d.apply(void 0, [(_e.sent()).toString(), settings])];
                case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_e.sent()]))];
                case 3:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.FormatFileThreaded = FormatFileThreaded;
