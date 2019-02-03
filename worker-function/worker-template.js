'use strict';

module.exports = `'use strict';

const {
    parentPort,
    isMainThread,
    workerData: filename
} = require('worker_threads');

if (isMainThread) {
    process.exit();
}

const moduleFunction = require(filename);

parentPort.on('message', async function (args) {
    try {
        parentPort.postMessage({
            success: true,
            payload: await moduleFunction(...args)
        });
    } catch (err) {
        parentPort.postMessage({
            success: false,
            payload: {
                message: err && err.message,
                name: err && err.name || undefined,
                stack: err && err.stack || undefined
            }
        });
    }
});`;
