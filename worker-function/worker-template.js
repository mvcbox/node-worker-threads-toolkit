'use strict';

module.exports = `'use strict';

const vm = require('vm');
const {
    parentPort,
    isMainThread,
    workerData
} = require('worker_threads');

if (isMainThread) {
    process.exit();
}

const moduleFunction = workerData.eval ? srcToFunction(workerData.source) : require(workerData.source);

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
});

function srcToFunction(source) {
    source = \`((exports, require, module, __filename, __dirname)=>{return \$\{source\}\\n});\`;
    return (new vm.Script(source)).runInThisContext()(exports, require, module, __filename, __dirname);
}`;
