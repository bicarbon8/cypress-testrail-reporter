const CypressTestRailReporter = require("../src/cypress-testrail-reporter");
const chai = require("chai");
const expect = chai.expect;

describe('CypressTestRailReporter', () => {
    beforeEach(() => {
        TestStore.clear();
    });

    it('can listen to runner events', async () => {
        var runner = new FakeRunner();
        var repOpts = { // TestRailOptions
            username: "foo@bar.baz",
            password: "fake1234",
            url: "https://fake.fake.fk/index.php?/api/v2",
            projectId: 3,
            usePlan: true,
            suiteIds: [1, 2],
            runName: "fake run name"
        };
        var options = {
            reporterOptions: repOpts
        };
        var reporter = new CypressTestRailReporter(runner, options);
        expect(reporter).to.exist;
        await new Promise((resolve, reject) => {
            try {
                setTimeout(resolve, 10);
            } catch (e) {
                console.log(e);
            }
        });
        var onEvents = TestStore.getOnEvents();
        var onceEvents = TestStore.getOnceEvents();
        expect(onEvents.length).to.equal(4); // two extra from Mocha.reporters.Base
        expect(onceEvents.length).to.equal(2);
    });

    it('instantiates the testRail property', async () => {
        var runner = new FakeRunner();
        var repOpts = { // TestRailOptions
            username: "foo@bar.baz",
            password: "fake1234",
            url: "https://fake.fake.fk/index.php?/api/v2",
            projectId: 3,
            usePlan: true,
            suiteIds: [1, 2],
            runName: "fake run name"
        };
        var options = {
            reporterOptions: repOpts
        };
        var reporter = new CypressTestRailReporter(runner, options);
        expect(reporter).to.exist;
        expect(reporter.api).to.exist;
    });
});

class FakeRunner {
    stats;
    started;
    suite;
    total;
    failures;
    grep(re, invert) {}
    grepTotal(suite) {};
    globals(arr) {};
    abort() {};
    run(fn) {};
    on(event, action) {
        TestStore.storeOnEvent(event, action);
        return this;
    }
    once(event, action) {
        TestStore.storeOnceEvent(event, action);
        return this;
    }
}

const TestStore = {
    onEvents: [],
    onceEvents: [],
    storeOnEvent: function(event, action) {
        TestStore.onEvents.push({event: event, action: action});
    },
    storeOnceEvent: function(event, action) {
        TestStore.onceEvents.push({event: event, action: action});
    },
    getOnEvents: function() {
        return TestStore.onEvents;
    },
    getOnceEvents: function() {
        return TestStore.onceEvents;
    },
    clear: function() {
        TestStore.onEvents = [];
        TestStore.onceEvents = [];
    }
}