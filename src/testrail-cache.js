const fs = require('fs');

const cacheFileName = 'testrail-cache.txt';
var cacheData = {};
const fileExists = () => {
    return fs.existsSync(cacheFileName);
};
const createFile = () => {
    fs.writeFileSync(cacheFileName, '{}');
};
const persist = () => {
    fs.writeFileSync(cacheFileName, JSON.stringify(cacheData), {
        flag: 'w'
    });
};
const load = () => {
    if (!fileExists()) {
        createFile();
    }
    var dataStr = fs.readFileSync(cacheFileName);
    if (dataStr && dataStr != '') {
        cacheData = JSON.parse(dataStr);
    } else {
        cacheData = {};
    }
};

const TestRailCache = {
    store: (key, val) => {
        cacheData[key] = val;
        persist();
    },
    retrieve: (key) => {
        load();
        return cacheData[key];
    },
    purge: () => {
        if (fileExists()) {
            fs.unlinkSync(cacheFileName);
        }
        cacheData = {};
    }
};

module.exports = TestRailCache;