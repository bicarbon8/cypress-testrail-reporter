import Axios, { AxiosRequestConfig } from 'axios';
const chalk = require('chalk');
import { TestRailOptions, TestRailResult, TestRailRun, TestRailPlan, TestRailTest } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: number;
  private planId: number;
  private runs: TestRailRun[] = [];
  private tests: TestRailTest[] = [];

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  public getAuth() {
    return {
      username: this.options.username,
      password: this.options.password,
    };
  }

  public getHeaders() {
    return { 'Content-Type': 'application/json' };
  }

  public async createPlan(name: string, description: string, milestoneId?: number): Promise<void> {
    let suiteIds: number[] = this.options.suiteIds;
    let entries: {}[] = [];
    for (var i=0; i<suiteIds.length; i++) {
      let entry: {} = {
        suite_id: suiteIds[i],
        name: `${name} - Suite ${suiteIds[i]}`,
        include_all: true
      }
      entries.push(entry);
    }
    let data: {} = {
      name: name,
      description: description,
      entries: entries
    };
    if (milestoneId) {
      data['milestone_id'] = milestoneId;
    }

    try {
      let plan: TestRailPlan = await this.post<TestRailPlan>('add_plan', this.options.projectId.toString(), data);
      this.planId = plan.id;
    } catch(e) {
      console.error(e);
    };
  }

  public async createRun(name: string, description: string, suiteId: number): Promise<void> {
    try {
      let run: TestRailRun = await this.post<TestRailRun>('add_run', this.options.projectId.toString(), {
        suite_id: suiteId,
        name,
        description,
        include_all: true,
      });
      this.runId = run.id;
    } catch(e) {
      console.error(e);
    }
  }

  public async deleteReport(): Promise<void> {
    try {
      if (this.options.usePlan === true) {
        await this.post<any>('delete_plan', this.planId.toString());
      } else {
        await this.post<any>('delete_run', this.runId.toString());
      }
    } catch(e) {
      console.error(e);
    };
  }

  public async publishResults(results: TestRailResult[]): Promise<void> {
    if (this.options.usePlan === true) {
      for(var i=0; i<results.length; i++) {
        try {
          let test: TestRailTest = await this.getTestByCaseId(results[i].case_id);
          await this.post<TestRailResult>('add_result', test.id.toString(), results[i]);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      try {
        await this.post<TestRailResult[]>('add_results_for_cases', this.runId.toString(), { 
          results: results
        });
      } catch(e) {
        console.error(e);
      };
    }

    console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
    let path: string = (this.options.usePlan === true) ? `plans/view/${this.planId.toString()}` : `runs/view/${this.runId.toString()}`;
    console.log(
      '\n',
      ` - ${results.length} Results are published to ${chalk.magenta(
        `https://${this.options.domain}/index.php?/${path}`
      )}`,
      '\n'
    );
  }

  public async getTestByCaseId(caseId: number): Promise<TestRailTest> {
    let runs: TestRailRun[] = await this.getRunsInPlan(this.planId);
    let runIds: number[] = [];
    for(var i=0; i<runs.length; i++) {
      runIds.push(runs[i].id);
    }
    let tests: TestRailTest[] = await this.getTestsInRuns(...runIds);
    for(var i=0; i<tests.length; i++) {
      if (caseId == tests[i].case_id) {
        return tests[i];
      }
    }
    return null;
  }

  public async getTestsInRuns(...runIds: number[]): Promise<TestRailTest[]> {
    if (!this.tests || this.tests.length == 0) {
      let allTests: TestRailTest[] = [];
      for (var i=0; i<runIds.length; i++) {
        let runId: number = runIds[i];
        try {
          let runTests: TestRailTest[] = await this.get<TestRailTest[]>('get_tests', runId.toString());
          for(var i=0; i<runTests.length; i++) {
            allTests.push(runTests[i]);
          }
        } catch (e) {
          console.error(e);
        }
      }
      this.tests = allTests;
    }
    return this.tests;
  }

  public async getRunsInPlan(planId: number): Promise<TestRailRun[]> {
    if (!this.runs || this.runs.length == 0) {
      let runs: TestRailRun[] = [];
      try {
        let plan: TestRailPlan = await this.get<TestRailPlan>('get_plan', planId.toString());
        for(var i=0; i<plan.entries.length; i++) {
          for(var j=0; j<plan.entries[i].runs.length; j++) {
            runs.push(plan.entries[i].runs[j]);
          }
        }
      } catch(e) {
        console.error(e);
      };
      this.runs = runs;
    }
    return this.runs;
  }

  private async get<T>(action: string, urlData: string): Promise<T> {
    return await this.makeRequest<T>('GET', action, urlData);
  }

  private async post<T>(action: string, urlData: string, data?: {}): Promise<T> {
    return await this.makeRequest<T>('POST', action, urlData, data);
  }

  private async makeRequest<T>(method: string, action: string, urlData: string, data?: {}): Promise<T> {
    let config: AxiosRequestConfig = {
      method: method,
      url: `${this.base}/${action}/${urlData}`,
      headers: this.getHeaders(),
      auth: this.getAuth()
    };
    if (data) {
      config['data'] = JSON.stringify(data);
    }
    let responseObj: T;
    try{
      let resp = await Axios.request(config);
      if (resp.data && resp.data.error) {
        if (new String(resp.data.error).includes('API Rate Limit Exceeded')) {
          // API RATE LIMIT REACHED: wait one minute and then retry request
          console.log('TestRail API Rate Limit reached: waiting one minute and then retrying request...')
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 60000);
          });
          responseObj = await this.makeRequest<T>(method, action, urlData, data);
        } else {
          throw new Error(resp.data.error);
        }
      } else {
        responseObj = resp.data as T;
      }
    } catch (e) {
      console.error(e);
    }
    return responseObj;
  }
}
