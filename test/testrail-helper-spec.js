const chai = require("chai");
const expect = chai.expect;
const TestRailHelper = require("../src/testrail-helper");

describe('TestRailHelper', () => {
    var data = [
        {title: '', expected: []},
        {title: 'C1234', expected: [1234]},
        {title: 'foo C1234', expected: [1234]},
        {title: 'C1234 foo', expected: [1234]},
        {title: 'foo C1234 foo', expected: [1234]},
        {title: 'C1234 C2345', expected: [1234, 2345]},
        {title: 'foo C1234 C2345', expected: [1234, 2345]},
        {title: 'C1234 foo C2345', expected: [1234, 2345]},
        {title: 'C1234 C2345 foo', expected: [1234, 2345]},
        {title: 'foo C1234 foo C2345 foo', expected: [1234, 2345]},
        {title: 'fooC1234 fooC2345', expected: []},
        {title: 'fooC1234C2345', expected: []},
        {title: 'C1234foo C2345foo', expected: []},
        {title: 'Case name 1234', expected: []},
        {title: 'Case1234', expected: []}
    ];
    data.forEach((d) => {
        it(`can parse cases from titles: ${JSON.stringify(d)}`, () => {
            expect(TestRailHelper.titleToCaseIds(d.title)).to.eql(d.expected);
        });
    });
});