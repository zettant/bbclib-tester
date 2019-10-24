const fs = require('fs');

const readFileIdLengthJson = JSON.parse(fs.readFileSync('../id_len.json', 'utf8'));
const idLengthData = `export const idLength = ${JSON.stringify(readFileIdLengthJson, null, '  ').replace(/"/g, '')};`;
fs.writeFile('./src/idLength.js',idLengthData, () => {});

