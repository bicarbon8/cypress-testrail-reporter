const { expect } = require("chai");
const TestRailApi = require("../src/testrail-api");
const TestRailCache = require("../src/testrail-cache");

describe('TestRailApi', () => {
    beforeEach(() => {
        TestRailCache.purge();
    });
    
    it('will read from cache for get tests calls', async () => {
        var expectedTest = {
            case_id: 123,
            id: 112233,
            priority_id: 4,
            run_id: 332211,
            status_id: 4,
            title: 'fake test title',
            type_id: 1
        }; // TestRailTest
        var plan = {
            blocked_count: -1,
            created_on: -1,
            description: 'fake plan description',
            entries: [{
                id: 332211,
                name: 'some entry',
                runs: [
                    {
                        blocked_count: -1,
                        config: null,
                        config_ids: [],
                        created_on: -1,
                        description: null,
                        failed_count: -1,
                        id: 332211,
                        name: null,
                        passed_count: -1,
                        plan_id: -1,
                        project_id: -1,
                        retest_count: -1,
                        suite_id: -1,
                        untested_count: -1,
                        url: null
                    }
                ],
                suite_id: -1
            }],
            failed_count: -1,
            id: -1,
            name: 'fake plan name',
            passed_count: -1,
            project_id: -1,
            retest_count: -1,
            untested_count: -1,
            url: null
        };
        var httpResponse = {
            data: {
                error: 'fake error'
            }
        };
        var options = {
            url: 'https://fake.testrail.io',
            usePlan: true,
            planId: 12345
        };
        var api = new TestRailApi(options);
        api.httpClient = async (config) => {
            return httpResponse; // returns error if called
        };
        TestRailCache.store(`${options.url}/index.php?/api/v2/get_tests/${plan.entries[0].runs[0].id}`, [expectedTest]);
        TestRailCache.store(`${options.url}/index.php?/api/v2/get_plan/${options.planId}`, plan);

        var actual = await api.getTestByCaseId(123);

        expect(actual).to.eql(expectedTest);
    });

    it('will store results from successful get calls in cache', async () => {
        var expectedPlan = {
            blocked_count: -1,
            created_on: -1,
            description: 'fake plan description',
            entries: [{
                id: 332211,
                name: 'some entry',
                runs: [
                    {
                        blocked_count: -1,
                        config: null,
                        config_ids: [],
                        created_on: -1,
                        description: null,
                        failed_count: -1,
                        id: 332211,
                        name: null,
                        passed_count: -1,
                        plan_id: -1,
                        project_id: -1,
                        retest_count: -1,
                        suite_id: -1,
                        untested_count: -1,
                        url: null
                    }
                ],
                suite_id: -1
            }],
            failed_count: -1,
            id: -1,
            name: 'fake plan name',
            passed_count: -1,
            project_id: -1,
            retest_count: -1,
            untested_count: -1,
            url: null
        };
        var httpPlanResponse = {
            data: expectedPlan
        };
        var options = {
            url: 'https://fake.testrail.io',
            usePlan: true,
            planId: 12345
        };
        var api = new TestRailApi(options);
        api.httpClient = async (config) => {
            return httpPlanResponse; // returns error if called
        };

        await api.getRunsInPlan(options.planId);

        var actual = TestRailCache.retrieve(`${options.url}/index.php?/api/v2/get_plan/${options.planId}`);

        expect(actual).to.eql(expectedPlan);
    });

    it('will wait and retry on rate limit response', async () => {
        var plan = {
            blocked_count: -1,
            created_on: -1,
            description: 'fake plan description',
            entries: [{
                id: 332211,
                name: 'some entry',
                runs: [
                    {
                        blocked_count: -1,
                        config: null,
                        config_ids: [],
                        created_on: -1,
                        description: null,
                        failed_count: -1,
                        id: 332211,
                        name: null,
                        passed_count: -1,
                        plan_id: -1,
                        project_id: -1,
                        retest_count: -1,
                        suite_id: -1,
                        untested_count: -1,
                        url: null
                    }
                ],
                suite_id: -1
            }],
            failed_count: -1,
            id: -1,
            name: 'fake plan name',
            passed_count: -1,
            project_id: -1,
            retest_count: -1,
            untested_count: -1,
            url: null
        };
        var httpError = {
            response: {
                status: 429,
                headers: {
                    'Retry-After': 2
                },
                data: {
                    error: 'fake error'
                }
            }
        };
        var options = {
            url: 'https://fake.testrail.io',
            usePlan: true,
            planId: 12345
        };
        var api = new TestRailApi(options);
        api.httpClient = async (config) => {
            if (TestStore.count < 1) {
                TestStore.count++;
                return Promise.reject(httpError);
            }
            return {data: plan};
        };

        var startTime = new Date().getTime();
        var actual = await api.getPlan();
        var endTime = new Date().getTime();

        expect(actual).to.eql(plan);
        expect(TestStore.count).to.equal(1);
        expect(endTime - startTime).to.be.greaterThan(1999);
    });
});

const TestStore = {
    count: 0
}