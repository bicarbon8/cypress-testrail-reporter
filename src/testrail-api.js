const axios = require('axios');
const TestRailCache = require('./testrail-cache');
const TestRailLogger = require('./testrail-logger');

class TestRailApi {
  constructor(options) {
    this._options = options;
    this.httpClient = axios;
  }

  async createPlan(name, description, milestoneId) {
    var suiteIds = this._options.suiteIds;
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
      var plan = await this._post('add_plan', this._options.projectId.toString(), data);
      this._options.planId = plan.id;
    } catch(e) {
      TestRailLogger.error(e);
    };
  };

  async getPlan() {
    try {
      if (this._options.planId > 0) {
        return await this._get('get_plan', this._options.planId, true);
      }
      return null;
    } catch(e) {
      TestRailLogger.error(e);
    };
  }

  async createRun(name, description, suiteId) {
    try {
      var run = await this._post('add_run', this._options.projectId.toString(), {
        suite_id: suiteId,
        name,
        description,
        include_all: true,
      });
      this._options.runId = run.id;
    } catch(e) {
      TestRailLogger.error(e);
    }
  }

  async getRun() {
    try {
      if (this._options.runId > 0) {
        return await this._get('get_run', this._options.runId, true);
      }
      return null;
    } catch(e) {
      TestRailLogger.error(e);
    };
  }

  async deleteReport() {
    try {
      if (this._options.usePlan === true) {
        await this._post('delete_plan', this._options.planId.toString());
      } else {
        await this._post('delete_run', this._options.runId.toString());
      }
    } catch(e) {
      TestRailLogger.error(e);
    };
  };

  async publishResults(results) {
    if (this._options.usePlan === true) {
      for(var i=0; i<results.length; i++) {
        try {
          var test = await this.getTestByCaseId(results[i].case_id);
          await this._post('add_result', test.id.toString(), results[i]);
        } catch (e) {
          TestRailLogger.error(e);
        }
      }
    } else {
      try {
        await this._post('add_results_for_cases', this._options.runId.toString(), { 
          results: results
        });
      } catch(e) {
        TestRailLogger.error(e);
      };
    }
  };

  async getTestByCaseId(caseId) {
    var runs = await this.getRunsInPlan(this._options.planId);
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
    var allTests = [];
    for (var i=0; i<runIds.length; i++) {
      var rId = runIds[i];
      try {
        var runTests = await this._get('get_tests', rId.toString(), true);
        for(var i=0; i<runTests.length; i++) {
          allTests.push(runTests[i]);
        }
      } catch (e) {
        TestRailLogger.error(e);
      }
    }
    return allTests;
  };

  async getRunsInPlan(pId) {
    var runs = [];
    try {
      var plan = await this.getPlan();
      if (plan?.entries?.length) {
        for(var i=0; i<plan.entries.length; i++) {
          if (plan.entries[i].runs?.length) {
            for(var j=0; j<plan.entries[i].runs.length; j++) {
              runs.push(plan.entries[i].runs[j]);
            }
          }
        }
      }
    } catch(e) {
      TestRailLogger.error(e);
    };
    // return cached array of runs
    return runs;
  };

  /**
   * sends a GET request to TestRail's API with the passed in action and urlData
   * @param {String} action the URL path to be appended to the Base
   * @param {String} urlData the additional URL variables to be included
   */
  async _get(action, urlData, useCache) {
    return await this._makeRequest('GET', action, urlData, undefined, useCache);
  };

  /**
   * sends a POST request to TestRail's API with the passed in action and urlData and a request
   * body from the serialised data
   * @param {String} action the URL path to be appended to the Base
   * @param {String} urlData the additional URL variables to be included
   * @param {any} data a JavaScript object to be serialised out and sent with the request
   */
  async _post(action, urlData, data) {
    return await this._makeRequest('POST', action, urlData, data, false);
  };

  _getAuth() {
    return {
      username: this._options.username,
      password: this._options.password,
    };
  };

  _getHeaders() {
    return { 'Content-Type': 'application/json' };
  };

  async _makeRequest(method, action, urlData, data, useCache) {
    var config = { // AxiosRequestConfig
      method: method,
      url: `${this._options.url}/index.php?/api/v2/${action}/${urlData}`,
      headers: this._getHeaders(),
      auth: this._getAuth(),
      data: (data) ? JSON.stringify(data) : undefined
    };
    var responseObj;

    if (useCache) {
      responseObj = TestRailCache.retrieve(config.url);
    }

    if (!responseObj) {
      try{
        var resp = await this.httpClient(config) // throws on non 2xx response status code
        .catch(async (error) => {
          if (error.response?.status == 429) {
            // API RATE LIMIT REACHED: wait some and then retry request
            var retryAfter = error.response.headers['Retry-After'] || 60;
            var seconds;
            if (retryAfter !== undefined) {
              seconds = parseInt(retryAfter);
            }
            TestRailLogger.warn(`TestRail API Rate Limit reached: waiting ${seconds} seconds and then retrying request...`);
            await new Promise((resolve, reject) => {
              setTimeout(resolve, seconds * 1000);
            });
            return {data: await this._makeRequest(method, action, urlData, data)};
          }
          return Promise.reject(error);
        });
        responseObj = resp.data;
        TestRailCache.store(config.url, responseObj);
      } catch (e) {
        TestRailLogger.error(e);
      }
    }
    return responseObj;
  };
}

module.exports = TestRailApi;
