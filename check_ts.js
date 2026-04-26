const ts = require('typescript');
const path = require('path');
const fs = require('fs');

const configPath = ts.findConfigFile(
  'I:\\Agents\\Vigil\\Vigil',
  ts.sys.fileExists,
  'tsconfig.json'
);

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  'I:\\Agents\\Vigil\\Vigil'
);

const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
const emitResult = program.emit();

const allDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .concat(emitResult.diagnostics);

const errors = allDiagnostics.filter(d => d.file && d.file.fileName.includes('page.tsx')).map(diagnostic => {
  if (diagnostic.file) {
    let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    return { file: diagnostic.file.fileName, line: line + 1, char: character + 1, message };
  } else {
    return { message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") };
  }
});

fs.writeFileSync('I:\\Agents\\Vigil\\Vigil\\ts_errors.json', JSON.stringify(errors, null, 2));
console.log('Done writing errors');
