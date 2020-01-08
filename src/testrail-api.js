const axios = require('axios');
const TestRailCache = require('./testrail-cache');

class TestRailApi {
  constructor(options) {
    this.options = options;
    this.base = `https://${this.options.domain}/index.php?/api/v2`;
    this.runId;
    this.planId;
  }

  async createPlan(name, description, milestoneId) {
    var suiteIds = this.options.suiteIds;
    var entries = [];
    for (var i=0; i<suiteIds.length; i++) {
      var entry = {
        suite_id: suiteIds[i],
        name: `${name} - Suite ${suiteIds[i]}`,
        include_all: true
      }
      entries.push(entry);
    }
    var data = {
      name: name,
      description: description,
      entries: entries
    };
    if (milestoneId) {
      data['milestone_id'] = milestoneId;
    }

    try {
      var plan = await this._post('add_plan', this.options.projectId.toString(), data);
      this.planId = plan.id;
    } catch(e) {
      console.error(e);
    };
  };

  async createRun(name, description, suiteId) {
    try {
      var run = await this._post('add_run', this.options.projectId.toString(), {
        suite_id: suiteId,
        name,
        description,
        include_all: true,
      });
      this.runId = run.id;
    } catch(e) {
      console.error(e);
    }
  };

  async deleteReport() {
    try {
      if (this.options.usePlan === true) {
        await this._post('delete_plan', this.planId.toString());
      } else {
        await this._post('delete_run', this.runId.toString());
      }
    } catch(e) {
      console.error(e);
    };
  };

  async publishResults(results) {
    var addedResults = [];
    if (this.options.usePlan === true) {
      for(var i=0; i<results.length; i++) {
        try {
          var test = await this.getTestByCaseId(results[i].case_id);
          let trs = await this._post('add_result', test.id.toString(), results[i]);
          if (trs && trs.length > 0) {
            addedResults.push(...trs);
          } else {
            throw new Error(`unable to add result of '${JSON.stringify(results[i])}' for test '${JSON.stringify(test.id)}'`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      try {
        let trs = await this._post('add_results_for_cases', this.runId.toString(), { 
          results: results
        });
        if (trs && trs.length > 0) {
          addedResults.push(...trs);
        } else {
          throw new Error(`unable to add result of '${JSON.stringify(results[i])}' for test '${JSON.stringify(test.id)}'`);
        }
      } catch(e) {
        console.error(e);
      };
    }
  };

  async getTestByCaseId(caseId) {
    var runs = await this.getRunsInPlan(this.planId);
    var runIds = [];
    for(var i=0; i<runs.length; i++) {
      runIds.push(runs[i].id);
    }
    var tests = await this.getTestsInRuns(...runIds);
    for(var i=0; i<tests.length; i++) {
      if (caseId == tests[i].case_id) {
        return tests[i];
      }
    }
    return null;
  };

  async getTestsInRuns(...runIds) {
    // lookup and cache tests
    var cachedTests = TestRailCache.retrieve('tests');
    if (!cachedTests || cachedTests.length == 0) {
      var allTests = [];
      for (var i=0; i<runIds.length; i++) {
        var rId = runIds[i];
        try {
          var runTests = await this._get('get_tests', rId.toString());
          for(var i=0; i<runTests.length; i++) {
            allTests.push(runTests[i]);
          }
        } catch (e) {
          console.error(e);
        }
      }
      cachedTests = allTests;
      TestRailCache.store('tests', cachedTests);
    }
    // return cached tests array
    return cachedTests;
  };

  async getRunsInPlan(pId) {
    // lookup and cache the runs
    var cachedRuns = TestRailCache.retrieve('runs');
    if (!cachedRuns || cachedRuns.length == 0) {
      var r = [];
      try {
        var plan = await this._get('get_plan', pId.toString());
        for(var i=0; i<plan.entries.length; i++) {
          for(var j=0; j<plan.entries[i].runs.length; j++) {
            r.push(plan.entries[i].runs[j]);
          }
        }
      } catch(e) {
        console.error(e);
      };
      cachedRuns = r;
      TestRailCache.store('runs', cachedRuns);
    }
    // return cached array of runs
    return cachedRuns;
  };

  /**
   * sends a GET request to TestRail's API with the passed in action and urlData
   * @param {String} action the URL path to be appended to the Base
   * @param {String} urlData the additional URL variables to be included
   */
  async _get(action, urlData) {
    return await this._makeRequest('GET', action, urlData);
  };

  /**
   * sends a POST request to TestRail's API with the passed in action and urlData and a request
   * body from the serialised data
   * @param {String} action the URL path to be appended to the Base
   * @param {String} urlData the additional URL variables to be included
   * @param {any} data a JavaScript object to be serialised out and sent with the request
   */
  async _post(action, urlData, data) {
    return await this._makeRequest('POST', action, urlData, data);
  };

  _getAuth() {
    return {
      username: this.options.username,
      password: this.options.password,
    };
  };

  _getHeaders() {
    return { 'Content-Type': 'application/json' };
  };

  async _makeRequest(method, action, urlData, data) {
    var config = { // AxiosRequestConfig
      method: method,
      url: `${this.base}/${action}/${urlData}`,
      headers: this._getHeaders(),
      auth: this._getAuth()
    };
    if (data) {
      config['data'] = JSON.stringify(data);
    }
    var responseObj;
    try{
      var resp = await axios(config);
      if (resp.data && resp.data.error) {
        if (new String(resp.data.error).includes('API Rate Limit Exceeded')) {
          // API RATE LIMIT REACHED: wait one minute and then retry request
          console.log('TestRail API Rate Limit reached: waiting one minute and then retrying request...')
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 60000);
          });
          responseObj = await this._makeRequest(method, action, urlData, data);
        } else {
          throw new Error(resp.data.error);
        }
      } else {
        responseObj = resp.data;
      }
    } catch (e) {
      console.error(e);
    }
    return responseObj;
  };
}

module.exports = TestRailApi;
