# node-worker-threads-toolkit

## Multithreading implementation (based on worker_threads module)

### Install:
```bash
npm install worker-threads-toolkit
```

### workerFunction args:
- `source`: Function or path to the module that exports the function (Function/String)
- `options`: Options when creating a function (Object):
- `options.returnTimeout`: Return timeout (milliseconds) (Default: 60000)
- `options.eval`: `true`, if the function was passed as the source, `false` if the path to the module was passed as the source (Default: false)
- `options.pool`: Do I need to use a pool of workers (Bool) (Default: false)
- `options.execArgv`: execArgv for `Worker` instance (Array) (Default: [])
- `options.poolOptions`: Pool options (Object):
- `options.poolOptions.min`: minimum number of resources to keep in pool at any given time. If this is set >= max, the pool will silently set the min to equal `max`. (Default: 1)
- `options.poolOptions.max`: maximum number of resources to create at any given time. (Default: CPUs count)
- `options.poolOptions.maxWaitingClients`: maximum number of queued requests allowed, additional `acquire` calls will be callback with an `err` in a future cycle of the event loop.
- `options.poolOptions.testOnBorrow`: should the pool validate resources before giving them to clients. Requires that either `factory.validate` or `factory.validateAsync` to be specified (Default: true)
- `options.poolOptions.acquireTimeoutMillis`: max milliseconds an `acquire` call will wait for a resource before timing out. (Default: no limit), if supplied should non-zero positive integer.
- `options.poolOptions.fifo`: if true the oldest resources will be first to be allocated. If false the most recently released resources will be the first to be allocated. This in effect turns the pool's behaviour from a queue into a stack. `boolean`, (Default: false)
- `options.poolOptions.priorityRange`: int between 1 and x - if set, borrowers can specify their relative priority in the queue if no resources are available.  (Default: 1)
- `options.poolOptions.autostart`: boolean, should the pool start creating resources etc once the constructor is called, (Default: true)
- `options.poolOptions.evictionRunIntervalMillis`: How often to run eviction checks. (Default: 60000)
- `options.poolOptions.numTestsPerRun`: Number of resources to check each eviction run.  Default: (Default: CPUs count).
- `options.poolOptions.softIdleTimeoutMillis`: amount of time an object may sit idle in the pool before it is eligible for eviction by the idle object evictor (if any), with the extra condition that at least "min idle" object instances remain in the pool. (Default: 600000)
- `options.poolOptions.idleTimeoutMillis`: the minimum amount of time that an object may sit idle in the pool before it is eligible for eviction due to idle time. Supercedes `softIdleTimeoutMillis` (Default: 3600000)
- `options.poolOptions.Promise`: Promise lib, a Promises/A+ implementation that the pool should use. Default: `options.pool.Promise = require('bluebird');`.


### Example:
```js
'use strict';

const { workerFunction } = require('worker-threads-toolkit');

const someFunction = workerFunction(function (arg1, arg2, arg3) {
    // arg1, arg2, arg3 - Some data for calculations
    // Some heavy calculations, which usually block the thread
    return 'Some result';
}, {
    eval: true
});

someFunction(1, 2, 3).then(console.log).catch(console.error);

```
