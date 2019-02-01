'use strict';

const { Worker } = require('worker_threads');

/**
 * @param {string} filename
 * @param {Object} options
 * @param {number} options.returnTimeout
 * @returns {Function}
 */
module.exports = function (filename, options) {
    options = Object.assign({
        returnTimeout: 60000
    }, options || {});

    return function (...args) {
        return new Promise(function(resolve, reject) {
            const worker = new Worker(require.resolve('./worker-function-slave'), {
                workerData: filename
            });

            const timeoutId = setTimeout(function () {
                worker.removeAllListeners().terminate();
                reject(new Error('Return timeout'));
            }, options.returnTimeout);

            worker.on('error', function (err) {
                clearTimeout(timeoutId);
                worker.removeAllListeners();
                reject(err);
            });

            worker.on('exit', function () {
                clearTimeout(timeoutId);
                worker.removeAllListeners();
                reject(new Error('Worker terminated'));
            });

            worker.on('online', function () {
                worker.postMessage(args);

                worker.on('message', function (data) {
                    clearTimeout(timeoutId);
                    worker.removeAllListeners().terminate();
                    data.success ? resolve(data.payload) : reject(data.payload);
                });
            });
        });
    };
};
