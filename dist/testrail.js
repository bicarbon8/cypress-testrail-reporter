"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var chalk = require('chalk');
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.runs = [];
        this.tests = [];
        this.base = "https://" + options.domain + "/index.php?/api/v2";
    }
    TestRail.prototype.getAuth = function () {
        return {
            username: this.options.username,
            password: this.options.password,
        };
    };
    TestRail.prototype.getHeaders = function () {
        return { 'Content-Type': 'application/json' };
    };
    TestRail.prototype.createPlan = function (name, description, milestoneId) {
        return __awaiter(this, void 0, void 0, function () {
            var suiteIds, entries, i, entry, data, plan, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        suiteIds = this.options.suiteIds;
                        entries = [];
                        for (i = 0; i < suiteIds.length; i++) {
                            entry = {
                                suite_id: suiteIds[i],
                                name: name + " - Suite " + suiteIds[i],
                                include_all: true
                            };
                            entries.push(entry);
                        }
                        data = {
                            name: name,
                            description: description,
                            entries: entries
                        };
                        if (milestoneId) {
                            data['milestone_id'] = milestoneId;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.post('add_plan', this.options.projectId.toString(), data)];
                    case 2:
                        plan = _a.sent();
                        this.planId = plan.id;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    TestRail.prototype.createRun = function (name, description, suiteId) {
        return __awaiter(this, void 0, void 0, function () {
            var run_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.post('add_run', this.options.projectId.toString(), {
                                suite_id: suiteId,
                                name: name,
                                description: description,
                                include_all: true,
                            })];
                    case 1:
                        run_1 = _a.sent();
                        this.runId = run_1.id;
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TestRail.prototype.deleteReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!(this.options.usePlan === true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.post('delete_plan', this.planId.toString())];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.post('delete_run', this.runId.toString())];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_3 = _a.sent();
                        console.error(e_3);
                        return [3 /*break*/, 6];
                    case 6:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    TestRail.prototype.publishResults = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            var i, test_1, e_4, e_5, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.options.usePlan === true)) return [3 /*break*/, 8];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < results.length)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.getTestByCaseId(results[i].case_id)];
                    case 3:
                        test_1 = _a.sent();
                        return [4 /*yield*/, this.post('add_result', test_1.id.toString(), results[i])];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_4 = _a.sent();
                        console.error(e_4);
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7: return [3 /*break*/, 12];
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.post('add_results_for_cases', this.runId.toString(), {
                                results: results
                            })];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_5 = _a.sent();
                        console.error(e_5);
                        return [3 /*break*/, 11];
                    case 11:
                        ;
                        _a.label = 12;
                    case 12:
                        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                        path = (this.options.usePlan === true) ? "plans/view/" + this.planId.toString() : "runs/view/" + this.runId.toString();
                        console.log('\n', " - " + results.length + " Results are published to " + chalk.magenta("https://" + this.options.domain + "/index.php?/" + path), '\n');
                        return [2 /*return*/];
                }
            });
        });
    };
    TestRail.prototype.getTestByCaseId = function (caseId) {
        return __awaiter(this, void 0, void 0, function () {
            var runs, runIds, i, tests, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRunsInPlan(this.planId)];
                    case 1:
                        runs = _a.sent();
                        runIds = [];
                        for (i = 0; i < runs.length; i++) {
                            runIds.push(runs[i].id);
                        }
                        return [4 /*yield*/, this.getTestsInRuns.apply(this, runIds)];
                    case 2:
                        tests = _a.sent();
                        for (i = 0; i < tests.length; i++) {
                            if (caseId == tests[i].case_id) {
                                return [2 /*return*/, tests[i]];
                            }
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    TestRail.prototype.getTestsInRuns = function () {
        var runIds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            runIds[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var allTests, i, runId, runTests, i, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.tests || this.tests.length == 0)) return [3 /*break*/, 7];
                        allTests = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < runIds.length)) return [3 /*break*/, 6];
                        runId = runIds[i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.get('get_tests', runId.toString())];
                    case 3:
                        runTests = _a.sent();
                        for (i = 0; i < runTests.length; i++) {
                            allTests.push(runTests[i]);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_6 = _a.sent();
                        console.error(e_6);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.tests = allTests;
                        _a.label = 7;
                    case 7: return [2 /*return*/, this.tests];
                }
            });
        });
    };
    TestRail.prototype.getRunsInPlan = function (planId) {
        return __awaiter(this, void 0, void 0, function () {
            var runs, plan, i, j, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.runs || this.runs.length == 0)) return [3 /*break*/, 5];
                        runs = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get('get_plan', planId.toString())];
                    case 2:
                        plan = _a.sent();
                        for (i = 0; i < plan.entries.length; i++) {
                            for (j = 0; j < plan.entries[i].runs.length; j++) {
                                runs.push(plan.entries[i].runs[j]);
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_7 = _a.sent();
                        console.error(e_7);
                        return [3 /*break*/, 4];
                    case 4:
                        ;
                        this.runs = runs;
                        _a.label = 5;
                    case 5: return [2 /*return*/, this.runs];
                }
            });
        });
    };
    TestRail.prototype.get = function (action, urlData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeRequest('GET', action, urlData)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TestRail.prototype.post = function (action, urlData, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeRequest('POST', action, urlData, data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TestRail.prototype.makeRequest = function (method, action, urlData, data) {
        return __awaiter(this, void 0, void 0, function () {
            var config, responseObj, resp, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            method: method,
                            url: this.base + "/" + action + "/" + urlData,
                            headers: this.getHeaders(),
                            auth: this.getAuth()
                        };
                        if (data) {
                            config['data'] = JSON.stringify(data);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, axios_1.default.request(config)];
                    case 2:
                        resp = _a.sent();
                        if (!(resp.data && resp.data.error)) return [3 /*break*/, 7];
                        if (!new String(resp.data.error).includes('API Rate Limit Exceeded')) return [3 /*break*/, 5];
                        // API RATE LIMIT REACHED: wait one minute and then retry request
                        console.log('TestRail API Rate Limit reached: waiting one minute and then retrying request...');
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                setTimeout(resolve, 60000);
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.makeRequest(method, action, urlData, data)];
                    case 4:
                        responseObj = _a.sent();
                        return [3 /*break*/, 6];
                    case 5: throw new Error(resp.data.error);
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        responseObj = resp.data;
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_8 = _a.sent();
                        console.error(e_8);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, responseObj];
                }
            });
        });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map