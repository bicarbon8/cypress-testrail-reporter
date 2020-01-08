const TestRailStatus = require('../src/testrail-status');
const chai = require("chai");
const expect = chai.expect;

describe('TestRailStatus', () => {
    it('can get expected passing status', () => {
        expect(TestRailStatus.passed).to.be.equal(1);
    });

    it('can get expected retest status', () => {
        expect(TestRailStatus.retest).to.be.equal(4);
    });
});