const TestRailApiObjects = require("../src/testrail-api-objects");
const chai = require("chai");
const expect = chai.expect;

describe('TestRailStatus', () => {
    it('can get expected passing status', () => {
        expect(TestRailApiObjects.Status.passed).to.be.equal(1);
    });

    it('can get expected retest status', () => {
        expect(TestRailApiObjects.Status.retest).to.be.equal(4);
    });
});