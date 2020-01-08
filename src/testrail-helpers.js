/**
 * Search for all applicable test cases
 * @param {String} title the test description containing TestRail Case IDs
 * @returns {number[]}
 */
module.exports = {
  titleToCaseIds: (title) => {
    var caseIds = [];

    var testCaseIdRegExp = /\bC(\d+)\b/g;
    var m;
    while ((m = testCaseIdRegExp.exec(title)) !== null) {
      let caseId = parseInt(m[1]);
      caseIds.push(caseId);
    }
    return caseIds;
  }
};
