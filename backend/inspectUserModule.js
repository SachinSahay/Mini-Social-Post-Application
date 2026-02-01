const path = require('path');
const p = path.resolve(__dirname, 'models', 'user.js');
console.log('resolved path:', p);
console.log('exists:', require('fs').existsSync(p));
const m = require('./models/user');
console.log('typeof m:', typeof m);
console.log('m keys:', Object.keys(m));
console.log('m:', m);
console.log('m.constructor.name:', m && m.constructor && m.constructor.name);

// inspect require.cache
const cacheEntry = require.cache[require.resolve('./models/user')];
console.log('cache exports type:', typeof cacheEntry.exports);
console.log('cache.exports keys:', Object.keys(cacheEntry.exports));
console.log('cache.module id:', cacheEntry.id);
console.log('cache.filename:', cacheEntry.filename);
