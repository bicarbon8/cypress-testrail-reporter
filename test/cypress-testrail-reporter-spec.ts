/// <reference types="Mocha" />
import { TestRailOptions } from "../src/testrail.interface";
import { CypressTestRailReporter } from "../src/cypress-testrail-reporter";
import { expect } from "chai";
import { IRunner } from 'mocha';

describe('CypressTestRailReporter', () => {
    it('can listen to runner events', async () => {
        let runner: FakeRunner = new FakeRunner();
        let repOpts: TestRailOptions = {
            username: "foo@bar.baz",
            password: "fake1234",
            domain: "fake.fake.fk",
            projectId: 3,
            usePlan: true,
            suiteIds: [1, 2],
            runName: "fake run name"
        };
        let options = {
            reporterOptions: repOpts
        };
        let reporter: CypressTestRailReporter = new CypressTestRailReporter(runner, options);

        await new Promise((resolve, reject) => {
            try {
                setTimeout(resolve, 1000);
            } catch (e) {
                console.log(e);
            }
        });
        let events: {event: string, action: Function}[] = TestStore.getEvents();
        expect(events.length).to.be.equal(4);
    });
});

class FakeRunner implements IRunner {
    stats?: Mocha.IStats;
    started: boolean;
    suite: Mocha.ISuite;
    total: number;
    failures: number;
    grep: (re: string, invert: boolean) => this;
    grepTotal: (suite: Mocha.ISuite) => number;
    globals: (arr: string[]) => this | string[];
    abort: () => this;
    run: (fn?: (failures: number) => void) => this;

    on(event: string, action: Function) {
        TestStore.store(event, action);
    }
}

module TestStore {
    var events: {event: string, action: Function}[] = [];
    export function store(event: string, action: Function): void {
        events.push({event: event, action: action});
    }
    export function getEvents(): {event: string, action: Function}[] {
        return events;
    }
}