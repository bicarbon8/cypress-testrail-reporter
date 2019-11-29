import { reporters, ITest, IRunner } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult, TestRailOptions } from './testrail.interface';
import * as chalk from 'chalk';

export class CypressTestRailReporter {
  private results: TestRailResult[] = [];
  private testRail: TestRail;
  private options: TestRailOptions;

  constructor(runner, options?) {
    this.options = this.validateOptions(options);
    this.testRail = new TestRail(this.options);

    this.configureRunner(runner);
  }

  private configureRunner(runner) {
    runner.on('start', async () => {
      const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      const name = `${this.options.runName || 'Automated test run'} ${executionDateTime}`;
      const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
      if (this.options.usePlan === true) {
        console.log(`creating TestRail Plan with name: ${name}`);
        await this.testRail.createPlan(name, description);
      } else {
        let suiteId: number = this.options.suiteId;
        console.log(`creating TestRail Run with name: ${name} from suite ${suiteId}`);
        await this.testRail.createRun(name, description, suiteId);
      }
    });

    runner.on('pass', (test: ITest) => {
      this.collectResults(Status.Passed, test, `Execution time: ${test.duration}ms`);
    });

    runner.on('fail', (test: ITest, err: { message: string; }) => {
      this.collectResults(Status.Failed, test, `${err.message}`);
    });

    runner.on('end', async () => {
      if (this.results.length == 0) {
        console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
        console.warn(
          '\n',
          'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
          '\n'
        );
        await this.testRail.deleteReport();
      } else {
        await this.testRail.publishResults(this.results);
      }
    });
  }

  private validateOptions(options): TestRailOptions {
    if (!options) {
      throw new Error('Missing cypress.json');
    }
    let reporterOptions: TestRailOptions = options.reporterOptions;
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

  private validate(options: TestRailOptions, name: string) {
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }

  private collectResults(status: Status, test: ITest, comment: string) {
    const caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: status,
            comment: comment,
          };
        });
        this.results.push(...results);
      }
  }
}
