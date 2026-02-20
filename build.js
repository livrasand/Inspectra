const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'src/inspectra.js'), 'utf8');

// Remove ES module export statements for UMD build
const umdBody = src
  .replace(/^export \{ inspect, uninspect, inspectAll \};$/m, '')
  .replace(/^export default Inspectra;$/m, '');

// UMD wrapper
const umd = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Inspectra = {}));
})(this, (function (exports) {
  'use strict';

${umdBody.replace(/^export \{[^}]+\};?$/gm, '').replace(/^export default \w+;?$/gm, '')}

  exports.inspect = inspect;
  exports.uninspect = uninspect;
  exports.inspectAll = inspectAll;
  exports.default = Inspectra;
  exports.version = '1.0.0';

  Object.defineProperty(exports, '__esModule', { value: true });
}));
`;

// ESM: replace named exports block and default export to keep them
const esm = src;

if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

fs.writeFileSync(path.join(__dirname, 'dist/inspectra.umd.js'), umd, 'utf8');
fs.writeFileSync(path.join(__dirname, 'dist/inspectra.esm.js'), esm, 'utf8');

// Simple minification (remove comments, collapse whitespace)
function minify(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+/gm, '')
    .trim();
}

fs.writeFileSync(path.join(__dirname, 'dist/inspectra.umd.min.js'), minify(umd), 'utf8');
fs.writeFileSync(path.join(__dirname, 'dist/inspectra.esm.min.js'), minify(esm), 'utf8');

console.log('Build complete:');
console.log('  dist/inspectra.umd.js');
console.log('  dist/inspectra.umd.min.js');
console.log('  dist/inspectra.esm.js');
console.log('  dist/inspectra.esm.min.js');
