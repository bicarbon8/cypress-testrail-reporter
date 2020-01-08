const Mocha = require('mocha');
const TestRailApi = require('./testrail-api');
const TestRailStatus = require('./testrail-status');
const TestRailCache = require('./testrail-cache');
const TestRailHelpers = require('./testrail-helpers');
const TestRailLogger = require('./testrail-logger');
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
    this.api = new TestRailApi(this.repOpts);
    this.results = [];
    this.configureRunner(runner);
  }

  configureRunner(runner) {
    runner
      .once(EVENT_RUN_BEGIN, async () => {
        await this.createTestPlanOrRun();
      })
      .on(EVENT_TEST_PASS, async (test) => {
        await this.submitResults(TestRailStatus.passed, test, `Execution time: ${test.duration}ms`);
      })
      .on(EVENT_TEST_FAIL, async (test, err) => {
        await this.submitResults(TestRailStatus.retest, test, `${err.message}`);
      })
      .once(EVENT_RUN_END, async () => {
        await this.notifyAtEnd();
      });
  }

  /**
   * method creates a new TestRail Run (or Plan if 'usePlan' is true in the options)
   * unless a cached value already exists for an existing TestRail Run or Plan ID in
   * which case that will be used and no new one created.
   */
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
        TestRailLogger.log(`creating TestRail Plan with name: '${name}'`);
        await this.api.createPlan(name, description);
        // cache the TestRail Plan ID
        TestRailCache.store('planId', this.api.planId);
      } else {
        var suiteId = this.repOpts.suiteId;
        TestRailLogger.log(`creating TestRail Run with name: ${name} from suite ${suiteId}`);
        await this.api.createRun(name, description, suiteId);
        // cache the TestRail Run ID
        TestRailCache.store('runId', this.api.runId);
      }
    } else {
      if (this.repOpts.usePlan === true) {
        // use the cached TestRail Plan ID
        this.api.planId = TestRailCache.retrieve('planId');
        TestRailLogger.log(`using existing TestRail Plan with ID: '${this.api.planId}'`);
      } else {
        // use the cached TestRail Run ID
        this.api.runId = TestRailCache.retrieve('runId');
        TestRailLogger.log(`using existing TestRail Run with ID: '${this.api.runId}'`);
      }
    }
  }

  async notifyAtEnd() {
    if (this.results.length == 0) {
      TestRailLogger.warn('No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
    } else {
      var path = (this.repOpts.usePlan === true) ? `plans/view/${this.api.planId.toString()}` : `runs/view/${this.api.runId.toString()}`;
      TestRailLogger.log(`${this.results.length} Results are published to ${chalk.magenta(`https://${this.repOpts.domain}/index.php?/${path}`)}`);
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
    var caseIds = TestRailHelpers.titleToCaseIds(test.title);
    if (caseIds.length > 0) {
      var caseResults = caseIds.map(caseId => {
        return {
          case_id: caseId,
          status_id: status,
          comment: comment,
        };
      });
      await this.api.publishResults(caseResults);
      this.results.push(...caseResults);

      TestRailLogger.log(`Published results for: [${caseIds.join(', ')}] case(s).`);
    }
  }
}

module.exports = CypressTestRailReporter;
