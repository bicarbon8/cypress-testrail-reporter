const Mocha = require('mocha');
const TestRail = require('./testrail');
const TestStatus = require('./test-status');
const TestRailCache = require('./testrail-cache');
const titleToCaseIds = require('./shared');
const chalk = require('chalk');
const moment = require('moment');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

// this reporter outputs test results, indenting two spaces per suite
class CypressTestRailReporter {
  constructor(runner, options) {
    this.repOpts = this.validateOptions(options);
    this.testRail = new TestRail(this.repOpts);
    this.results = [];
    this.configureRunner(runner);
  }

  configureRunner(runner) {
    runner
      .once(EVENT_RUN_BEGIN, async () => {
        await this.createTestPlanOrRun();
      })
      .on(EVENT_TEST_PASS, async (test) => {
        await this.submitResults(TestStatus.passed, test, `Execution time: ${test.duration}ms`);
      })
      .on(EVENT_TEST_FAIL, async (test, err) => {
        await this.submitResults(TestStatus.retest, test, `${err.message}`);
      })
      .once(EVENT_RUN_END, async () => {
        await this.notifyIfUnused();
      });
  }

  async createTestPlanOrRun() {
    // check if we have already created and cached the ID
    // only create new if nothing already cached
    if (!TestRailCache.retrieve('planId') && !TestRailCache.retrieve('runId')) {
      var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      var name = '';
      if (this.repOpts.runName) {
        name = this.repOpts.runName;
      } else {
        name = `Automated test run ${executionDateTime}`;
      }
      var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
      if (this.repOpts.usePlan === true) {
        console.log(`creating TestRail Plan with name: ${name}`);
        await this.testRail.createPlan(name, description);
        TestRailCache.store('planId', this.testRail.planId);
      } else {
        var suiteId = this.repOpts.suiteId;
        console.log(`creating TestRail Run with name: ${name} from suite ${suiteId}`);
        await this.testRail.createRun(name, description, suiteId);
        TestRailCache.store('runId', this.testRail.runId);
      }
    } else {
      if (this.repOpts.usePlan === true) {
        this.testRail.planId = TestRailCache.retrieve('planId');
      } else {
        this.testRail.runId = TestRailCache.retrieve('runId');
      }
    }
  }

  async notifyIfUnused() {
    if (this.results.length == 0) {
      console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
      console.warn(
        '\n',
        'No testcases were matched with TestRail. Ensure that your tests are declared correctly and matches Cxxxx',
        '\n'
      );
    }
  }

  validateOptions(options) {
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
    } else {
      this.validate(reporterOptions, 'suiteId');
    }
    return reporterOptions;
  }

  validate(options, name) {
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }

  async submitResults(status, test, comment) {
    var caseIds = titleToCaseIds(test.title);
    if (caseIds.length > 0) {
      var caseResults = caseIds.map(caseId => {
        return {
          case_id: caseId,
          status_id: status,
          comment: comment,
        };
      });
      await this.testRail.publishResults(caseResults);
      this.results.push(...caseResults);
    }
  }
}

module.exports = CypressTestRailReporter;
