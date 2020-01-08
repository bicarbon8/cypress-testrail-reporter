const fs = require('fs');

const TestRailCache = {
    _cacheFileName: 'testrail-cache.txt',
    _cacheFile: null,
    _cacheData: {},
    store: (key, val) => {
        TestRailCache._cacheData[key] = val;
        TestRailCache._persist();
    },
    retrieve: (key) => {
        TestRailCache._load();
        return TestRailCache._cacheData[key];
    },
    _fileExists: () => {
        return fs.existsSync(TestRailCache._cacheFileName);
    },
    _createFile: () => {
        fs.writeFileSync(TestRailCache._cacheFileName, '');
    },
    _persist: () => {
        fs.writeFileSync(TestRailCache._cacheFileName, JSON.stringify(TestRailCache._cacheData), {
            flag: 'w'
        });
    },
    _load: () => {
        if (!TestRailCache._fileExists()) {
            TestRailCache._createFile();
        }
        var dataStr = fs.readFileSync(TestRailCache._cacheFileName);
        if (dataStr && dataStr != '') {
            TestRailCache._cacheData = JSON.parse(dataStr);
        } else {
            TestRailCache._cacheData = {};
        }
    },
    _purge: () => {
        if (TestRailCache._fileExists()) {
            fs.unlinkSync(TestRailCache._cacheFileName);
        }
    }
};

module.exports = TestRailCache;