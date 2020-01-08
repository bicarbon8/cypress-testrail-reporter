const CypressTestRailReporter = require("../src/cypress-testrail-reporter");
const chai = require("chai");
const expect = chai.expect;

describe('CypressTestRailReporter', () => {
    it('can listen to runner events', async () => {
        var runner = new FakeRunner();
        var repOpts = { // TestRailOptions
            username: "foo@bar.baz",
            password: "fake1234",
            domain: "fake.fake.fk",
            projectId: 3,
            usePlan: true,
            suiteIds: [1, 2],
            runName: "fake run name"
        };
        var options = {
            reporterOptions: repOpts
        };
        var reporter = new CypressTestRailReporter(runner, options);
        expect(reporter).not.to.be.null;
        await new Promise((resolve, reject) => {
            try {
                setTimeout(resolve, 1000);
            } catch (e) {
                console.log(e);
            }
        });
        var events = TestStore.getEvents();
        expect(events.length).to.be.equal(4);
    });

    it('instantiates the testRail property', async () => {
        var runner = new FakeRunner();
        var repOpts = { // TestRailOptions
            username: "foo@bar.baz",
            password: "fake1234",
            domain: "fake.fake.fk",
            projectId: 3,
            usePlan: true,
            suiteIds: [1, 2],
            runName: "fake run name"
        };
        var options = {
            reporterOptions: repOpts
        };
        var reporter = new CypressTestRailReporter(runner, options);
        expect(reporter).not.to.be.null;
        expect(reporter.api).not.to.be.null;
    });
});

function FakeRunner() {
    this.stats;
    this.started;
    this.suite;
    this.total;
    this.failures;

    this.grep = (re, invert) => {}
    this.grepTotal = (suite) => {};
    this.globals = (arr) => {};
    this.abort = () => {};
    this.run = (fn) => {};

    this.on = (event, action) => {
        TestStore.store(event, action);
        return this;
    }

    this.once = (event, action) => {
        TestStore.store(event, action);
        return this;
    }
}

var TestStore = {
    events: [],
    store: function(event, action) {
        this.events.push({event: event, action: action});
    },
    getEvents: function() {
        return this.events;
    }
}