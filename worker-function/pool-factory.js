'use strict';

const { Worker } = require('worker_threads');
const { createPool } = require('generic-pool');

/**
 * @param {Object} options
 * @param {string} filename
 * @returns {*}
 */
module.exports = function (options, filename) {
    return createPool({
        create: function() {
            return new Promise(function (resolve, reject) {
                const worker = new Worker(require.resolve('./worker'), {
                    workerData: filename
                });

                worker.on('online', function () {
                    worker.removeAllListeners();
                    resolve(worker);
                });

                worker.on('error', reject);
            });
        },

        destroy: function(worker) {
            worker.terminate();
        }
    }, options);
};
