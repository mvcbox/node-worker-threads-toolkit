'use strict';

const { Worker } = require('worker_threads');

/**
 * @param {string} filename
 * @returns {Object}
 */
module.exports = function (filename) {
    return {
        acquire() {
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

        release(worker) {
            this.destroy(worker);
        },

        destroy(worker) {
            worker.terminate();
        }
    };
};
