const TestRailCache = require('../src/testrail-cache');
const chai = require("chai");
const expect = chai.expect;

describe('TestRailCache', () => {
    beforeEach(() => {
        TestRailCache.purge();
    });

    afterEach(() => {
        TestRailCache.purge();
    });

    it('can store and retrieve values', () => {
        let now = Date.now();
        let key = `sample${now}`;
        let val = now;
        TestRailCache.store(key, val);

        let actual = TestRailCache.retrieve(key);

        expect(actual).to.be.equal(val);
    });

    it('can load empty cache', () => {
        expect(() => { TestRailCache.retrieve('doesNotExist'); }).not.to.throw();
    });
});