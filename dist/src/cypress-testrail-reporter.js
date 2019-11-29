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
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var chalk = require("chalk");
var CypressTestRailReporter = /** @class */ (function () {
    function CypressTestRailReporter(runner, options) {
        this.results = [];
        this.options = this.validateOptions(options);
        this.testRail = new testrail_1.TestRail(this.options);
        this.configureRunner(runner);
    }
    CypressTestRailReporter.prototype.configureRunner = function (runner) {
        var _this = this;
        runner.on('start', function () { return __awaiter(_this, void 0, void 0, function () {
            var executionDateTime, name, description, suiteId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
                        name = (this.options.runName || 'Automated test run') + " " + executionDateTime;
                        description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
                        if (!(this.options.usePlan === true)) return [3 /*break*/, 2];
                        console.log("creating TestRail Plan with name: " + name);
                        return [4 /*yield*/, this.testRail.createPlan(name, description)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        suiteId = this.options.suiteId;
                        console.log("creating TestRail Run with name: " + name + " from suite " + suiteId);
                        return [4 /*yield*/, this.testRail.createRun(name, description, suiteId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        runner.on('pass', function (test) {
            _this.collectResults(testrail_interface_1.Status.Passed, test, "Execution time: " + test.duration + "ms");
        });
        runner.on('fail', function (test, err) {
            _this.collectResults(testrail_interface_1.Status.Failed, test, "" + err.message);
        });
        runner.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.results.length == 0)) return [3 /*break*/, 2];
                        console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
                        console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
                        return [4 /*yield*/, this.testRail.deleteReport()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.testRail.publishResults(this.results)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    CypressTestRailReporter.prototype.validateOptions = function (options) {
        if (!options) {
            throw new Error('Missing cypress.json');
        }
        var reporterOptions = options.reporterOptions;
        if (!reporterOptions) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        this.validate(reporterOptions, 'domain');
        this.validate(reporterOptions, 'username');
        this.validate(reporterOptions, 'password');
        this.validate(reporterOptions, 'projectId');
        if (reporterOptions.usePlan === true) {
            this.validate(reporterOptions, 'suiteIds');
        }
        else {
            this.validate(reporterOptions, 'suiteId');
        }
        return reporterOptions;
    };
    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };
    CypressTestRailReporter.prototype.collectResults = function (status, test, comment) {
        var caseIds = shared_1.titleToCaseIds(test.title);
        if (caseIds.length > 0) {
            var results = caseIds.map(function (caseId) {
                return {
                    case_id: caseId,
                    status_id: status,
                    comment: comment,
                };
            });
            (_a = this.results).push.apply(_a, results);
        }
        var _a;
    };
    return CypressTestRailReporter;
}());
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map