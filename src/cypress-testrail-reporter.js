const TestRail = require('./testrail');
const titleToCaseIds = require('./shared');
const chalk = require('chalk');
const moment = require('moment');

function CypressTestRailReporter(runner, options) {
  var repOpts;
  var testRail;
  var results = [];

  var configureRunner = function(runner) {
    runner.on('start', async () => {
      var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      var name = '';
      if (repOpts.runName) {
        name = repOpts.runName;
      } else {
        name = `Automated test run ${executionDateTime}`;
      }
      var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
      if (repOpts.usePlan === true) {
        console.log(`creating TestRail Plan with name: ${name}`);
        await testRail.createPlan(name, description);
      } else {
        var suiteId = repOpts.suiteId;
        console.log(`creating TestRail Run with name: ${name} from suite ${suiteId}`);
        await testRail.createRun(name, description, suiteId);
      }
    });

    runner.on('pass', (test) => {
      collectResults(Status.Passed, test, `Execution time: ${test.duration}ms`);
    });

    runner.on('fail', (test, err) => {
      collectResults(Status.Failed, test, `${err.message}`);
    });

    runner.on('end', async () => {
      if (results.length == 0) {
        console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
        console.warn(
          '\n',
          'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
          '\n'
        );
        await testRail.deleteReport();
      } else {
        await testRail.publishResults(results);
      }
    });
  }

  var validateOptions = function(options) {
    if (!options) {
      throw new Error('Missing cypress.json');
    }
    var reporterOptions = options.reporterOptions;
    if (!reporterOptions) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    validate(reporterOptions, 'domain');
    validate(reporterOptions, 'username');
    validate(reporterOptions, 'password');
    validate(reporterOptions, 'projectId');
    if (reporterOptions.usePlan === true) {
      validate(reporterOptions, 'suiteIds');
    } else {
      validate(reporterOptions, 'suiteId');
    }
    return reporterOptions;
  }

  var validate = function(options, name) {
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }

  var collectResults = function(status, test, comment) {
    var caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        var results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: status,
            comment: comment,
          };
        });
        results.push(...results);
      }
  }

  repOpts = validateOptions(options);
  testRail = new TestRail(repOpts);

  configureRunner(runner);
}

module.exports = CypressTestRailReporter;
