const Axios = require('axios');
const chalk = require('chalk');

function TestRail(options) {
  this.base = `https://${options.domain}/index.php?/api/v2`;
  this.runId;
  this.planId;
  
  var runs = [];
  var tests = [];

  this.createPlan = async function(name, description, milestoneId) {
    var suiteIds = options.suiteIds;
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
      var plan = await post('add_plan', options.projectId.toString(), data);
      this.planId = plan.id;
    } catch(e) {
      console.error(e);
    };
  };

  this.createRun = async function(name, description, suiteId) {
    try {
      var run = await post('add_run', options.projectId.toString(), {
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

  this.deleteReport = async function() {
    try {
      if (options.usePlan === true) {
        await post('delete_plan', this.planId.toString());
      } else {
        await post('delete_run', this.runId.toString());
      }
    } catch(e) {
      console.error(e);
    };
  };

  this.publishResults = async function(results) {
    if (options.usePlan === true) {
      for(var i=0; i<results.length; i++) {
        try {
          var test = await this.getTestByCaseId(results[i].case_id);
          await post('add_result', test.id.toString(), results[i]);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      try {
        await post('add_results_for_cases', this.runId.toString(), { 
          results: results
        });
      } catch(e) {
        console.error(e);
      };
    }

    console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
    var path = (options.usePlan === true) ? `plans/view/${this.planId.toString()}` : `runs/view/${this.runId.toString()}`;
    console.log(
      '\n',
      ` - ${results.length} Results are published to ${chalk.magenta(
        `https://${options.domain}/index.php?/${path}`
      )}`,
      '\n'
    );
  };

  this.getTestByCaseId = async function(caseId) {
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

  this.getTestsInRuns = async function(...runIds) {
    // lookup and cache tests
    if (!tests || tests.length == 0) {
      var allTests = [];
      for (var i=0; i<runIds.length; i++) {
        var runId = runIds[i];
        try {
          var runTests = await get('get_tests', runId.toString());
          for(var i=0; i<runTests.length; i++) {
            allTests.push(runTests[i]);
          }
        } catch (e) {
          console.error(e);
        }
      }
      tests = allTests;
    }
    // return cached tests array
    return tests;
  };

  this.getRunsInPlan = async function(planId) {
    // lookup and cache the runs
    if (!runs || runs.length == 0) {
      var r = [];
      try {
        var plan = await get('get_plan', planId.toString());
        for(var i=0; i<plan.entries.length; i++) {
          for(var j=0; j<plan.entries[i].runs.length; j++) {
            r.push(plan.entries[i].runs[j]);
          }
        }
      } catch(e) {
        console.error(e);
      };
      runs = r;
    }
    // return cached array of runs
    return runs;
  };

  /**
   * sends a GET request to TestRail's API with the passed in action and urlData
   * @param {String} action the URL path to be appended to the Base
   * @param {String} urlData the additional URL variables to be included
   */
  var get = async function(action, urlData) {
    return await makeRequest('GET', action, urlData);
  };

  /**
   * sends a POST request to TestRail's API with the passed in action and urlData and a request
   * body from the serialised data
   * @param {String} action the URL path to be appended to the Base
   * @param {String} urlData the additional URL variables to be included
   * @param {any} data a JavaScript object to be serialised out and sent with the request
   */
  var post = async function(action, urlData, data) {
    return await makeRequest('POST', action, urlData, data);
  };

  var getAuth = function() {
    return {
      username: options.username,
      password: options.password,
    };
  };

  var getHeaders = function() {
    return { 'Content-Type': 'application/json' };
  };

  var makeRequest = async function(method, action, urlData, data) {
    var config = { // AxiosRequestConfig
      method: method,
      url: `${this.base}/${action}/${urlData}`,
      headers: getHeaders(),
      auth: getAuth()
    };
    if (data) {
      config['data'] = JSON.stringify(data);
    }
    var responseObj;
    try{
      var resp = await Axios.request(config);
      if (resp.data && resp.data.error) {
        if (new String(resp.data.error).includes('API Rate Limit Exceeded')) {
          // API RATE LIMIT REACHED: wait one minute and then retry request
          console.log('TestRail API Rate Limit reached: waiting one minute and then retrying request...')
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 60000);
          });
          responseObj = await makeRequest(method, action, urlData, data);
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

module.exports = TestRail;
