'use strict';

const os = require('os');
const { Worker } = require('worker_threads');
const poolFactory = require('./pool-factory');
const fakePoolFactory = require('./fake-pool-factory');

/**
 * @param {string} source
 * @param {Object} options
 * @param {number} options.eval
 * @param {number} options.returnTimeout
 * @param {Array} options.execArgv
 * @param {boolean} options.pool
 * @param {Object} options.poolOptions
 * @returns {Function}
 */
module.exports = function (source, options) {
    options = Object.assign({
        eval: false,
        returnTimeout: 60000,
        execArgv: [],
        pool: false,
        poolOptions: {
            min: 1,
            max: os.cpus().length
        }
    }, options || {});

    const workerOptions = {
        eval: true,
        workerData: {
            eval: options.eval,
            source: String(source)
        },
        execArgv: options.execArgv
    };
    const pool = _function.pool = options.pool ? poolFactory(options.poolOptions, workerOptions) : fakePoolFactory(workerOptions);

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
