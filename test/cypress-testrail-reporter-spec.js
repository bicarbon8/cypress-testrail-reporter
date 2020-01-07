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
});

function FakeRunner() {
    this.stats;
    this.started;
    this.suite;
    this.total;
    this.failures;
    this.grep = function(re, invert) {
        
    }
    this.grepTotal = function(suite) {

    };
    this.globals = function(arr) {

    };
    this.abort = function() {

    };
    this.run = function(fn) {

    };

    this.on = function(event, action) {
        TestStore.store(event, action);
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