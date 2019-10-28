const fs = require('fs');

const readFileIdLengthJson = JSON.parse(fs.readFileSync('../id_len.json', 'utf8'));
let replaceText = JSON.stringify(readFileIdLengthJson, null, '  ').replace(/"/g, '')
replaceText = replaceText.replace(/transaction_id/,'transactionId');
replaceText = replaceText.replace(/asset_group_id/,'assetGroupId');
replaceText = replaceText.replace(/asset_id/,'assetId');
replaceText = replaceText.replace(/user_id/,'userId');
replaceText = replaceText.replace(/nonce/,'nonce');

const idLengthData = `export const idLength = ${replaceText};`;
fs.writeFile('./src/idLength.js',idLengthData, () => {});

