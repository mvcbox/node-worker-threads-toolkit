'use strict';

const {
    parentPort,
    isMainThread,
    workerData: filename
} = require('worker_threads');

if (isMainThread) {
    process.exit();
}

const moduleFunction = require(filename);

(new Promise(function (resolve, reject) {
    parentPort.once('message', async function (args) {
        try {
            resolve(await moduleFunction(...args));
        } catch (e) {
            reject(e);
        }
    });
})).then(function (data) {
    parentPort.postMessage({
        success: true,
        payload: data
    });
}).catch(function (err) {
    parentPort.postMessage({
        success: false,
        payload: {
            message: err && err.message,
            name: err && err.name || undefined,
            stack: err && err.stack || undefined
        }
    });
});
