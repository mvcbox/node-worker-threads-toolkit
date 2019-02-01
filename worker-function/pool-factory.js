'use strict';

const { Worker } = require('worker_threads');
const { createPool } = require('generic-pool');

/**
 * @param {Object} options
 * @param {Object} workerOptions
 * @returns {*}
 */
module.exports = function (options, workerOptions) {
    return createPool({
        create: function() {
            return new Promise(function (resolve, reject) {
                const worker = new Worker(require.resolve('./worker'), workerOptions);

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
