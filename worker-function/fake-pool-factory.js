'use strict';

const { Worker } = require('worker_threads');
const WORKER_TEMPLATE = require('./worker-template');

/**
 * @param {Object} workerOptions
 * @returns {Object}
 */
module.exports = function (workerOptions) {
    return {
        acquire() {
            return new Promise(function (resolve, reject) {
                const worker = new Worker(WORKER_TEMPLATE, workerOptions);

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
