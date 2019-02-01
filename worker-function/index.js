'use strict';

const os = require('os');
const { Worker } = require('worker_threads');
const poolFactory = require('./pool-factory');
const fakePoolFactory = require('./fake-pool-factory');

/**
 * @param {string} filename
 * @param {Object} options
 * @param {number} options.returnTimeout
 * @param {boolean} options.pool
 * @param {Object} options.poolOptions
 * @returns {Function}
 */
module.exports = function (filename, options) {
    options = Object.assign({
        returnTimeout: 60000,
        pool: false,
        poolOptions: {
            min: 1,
            max: os.cpus().length
        }
    }, options || {});

    const pool = _function.pool = options.pool ? poolFactory(options.poolOptions, filename) : fakePoolFactory(filename);

    async function _function(...args) {
        const worker = await pool.acquire();

        return new Promise(function(resolve, reject) {
            const timeoutId = setTimeout(function () {
                worker.removeAllListeners();
                pool.destroy(worker);
                reject(new Error('Return timeout'));
            }, options.returnTimeout);

            worker.on('error', function (err) {
                clearTimeout(timeoutId);
                worker.removeAllListeners();
                pool.destroy(worker);
                reject(err);
            });

            worker.on('exit', function () {
                clearTimeout(timeoutId);
                worker.removeAllListeners();
                pool.destroy(worker);
                reject(new Error('Worker terminated'));
            });

            worker.on('message', function (data) {
                clearTimeout(timeoutId);
                worker.removeAllListeners();
                pool.release(worker);
                data.success ? resolve(data.payload) : reject(data.payload);
            });

            worker.postMessage(args);
        });
    }

    return _function;
};
