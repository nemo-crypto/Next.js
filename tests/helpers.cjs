const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function load(relative, env = {}) {
    const filename = path.resolve(relative);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const sandboxModule = { exports: {} };
    vm.runInNewContext(source, { exports: sandboxModule.exports, module: sandboxModule, process: { env }, URL, require: name => name.startsWith('.') ? load(path.resolve(path.dirname(filename), `${name}.ts`), env) : require(name) }, { filename });
    return sandboxModule.exports;
}
module.exports = { load };
