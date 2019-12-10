import * as bbclib from "js-bbclib";
import {idLength} from './idLength.js';
import * as common from './common.js'
import jseu from 'js-encoding-utils';
import * as textEncoding from "text-encoding";

const TextEncoder = textEncoding.default.TextEncoder;
const TextDecoder = textEncoding.default.TextDecoder;


const userId1 = jseu.encoder.hexStringToArrayBuffer("693792d5850481d38c3859a6cafaf08a755cc12d757fef6b011852ce6802488e".slice(0, idLength.userId * 2));
const userId2 = jseu.encoder.hexStringToArrayBuffer("730201e5f80b4a5795e009bc2c50c4d2a64c746d55fd2df1ffddbb7c1ff1a6ec".slice(0, idLength.userId * 2));
const assetGroupId1 = jseu.encoder.hexStringToArrayBuffer("c3f9f38b875680e0e0b59ed4dc528572019f833946f376d27dcbfb4b4e94b141".slice(0, idLength.assetGroupId * 2));
const assetGroupId2 = jseu.encoder.hexStringToArrayBuffer("1caa82dfdf71ee073d124bcb7447160f90fd2d044b220618e7e4b00bba9b17f9".slice(0, idLength.assetGroupId * 2));
const domainId = jseu.encoder.hexStringToArrayBuffer("82f10651e04288b6ffea5c5ea129244dcf887e25bf939ca302d57c87ed6d1659");

const sleep = async (time) => new Promise( (resolve) => {
  setTimeout( () => {resolve();},  time);
});

async function createTransactions(add_publickey=true){

    const transactions = [];

    transactions.push(await bbclib.makeTransaction(1,1, true, 2.0, idLength));
    const relationBody1 = (new TextEncoder).encode('relation:asset_0-0');
    await transactions[0].relations[0].setAssetGroup( assetGroupId1).createAsset(userId1, relationBody1, null);
    const eventBody = (new TextEncoder).encode('event:asset_0-0');
    await (transactions[0].events[0].setAssetGroup(assetGroupId1)).createAsset(userId1, eventBody, null);
    await transactions[0].events[0].setAssetGroup(assetGroupId1).createAsset(userId1, eventBody, null);
    transactions[0].events[0].addMandatoryApprover(userId1);
    transactions[0].addWitness(userId1);
    await transactions[0].sign(userId1, common.keypair1, add_publickey);

    for(let i = 1; i < 20; i++){
        const k = i - 1;
        transactions.push(await bbclib.makeTransaction(1, 4, true, 2.0, idLength));
        const relationBody2 = (new TextEncoder).encode(`relation:asset_1-${i}`);
        (await (transactions[i].relations[0].setAssetGroup(assetGroupId1)).createAsset(userId1, relationBody2, null));
        transactions[i].relations[0].createPointer(await transactions[k].getTransactionId(), transactions[k].relations[0].asset.assetId);

        const relationBody3 = (new TextEncoder).encode(`relation:asset_2-${i}`);
        transactions[i].relations[1].setAssetGroup(assetGroupId2);
        await (transactions[i].relations[1].createAsset(userId2, relationBody3, null));
        transactions[i].relations[1].createPointer(await transactions[k].getTransactionId(), transactions[k].relations[0].asset.assetId);
        transactions[i].relations[1].createPointer(await transactions[0].getTransactionId(), transactions[0].relations[0].asset.assetId);

        const eventBody = (new TextEncoder).encode(`event:asset_3-${i}`);
        await (transactions[i].events[0].setAssetGroup(assetGroupId1).createAsset( userId2, eventBody, null));

        const assetIds = [];
        for (let k = 0; k < 5; k++){
            assetIds.push(await bbclib.helper.getRandomValue(idLength.assetId));
        }

        const relationBody4 = (new TextEncoder).encode(`relation:asset_4-${i}`);
        transactions[i].relations[2].setAssetGroup(assetGroupId1).createAssetRaw(assetIds[0], relationBody4);
        transactions[i].relations[2].createPointer(await transactions[0].getTransactionId(), transactions[0].relations[0].asset.assetId);
        transactions[i].relations[2].createPointer(await transactions[0].getTransactionId(), null);

        const assetIdsForHash = assetIds.slice(1,5);
        transactions[i].relations[3].setAssetGroup(assetGroupId2).createAssetHash(assetIdsForHash);
        transactions[i].relations[3].createPointer(await transactions[0].getTransactionId(), transactions[0].relations[0].asset.assetId);

        transactions[i].events[0].addMandatoryApprover(userId1);
        await transactions[i].createReference(assetGroupId1, transactions[i], transactions[i-1], 0);

        transactions[i].createCrossRef(domainId, await transactions[0].getTransactionId());

        transactions[i].addWitness(userId1);
        transactions[i].addWitness(userId2);
        await transactions[i].sign(userId1, common.keypair1, add_publickey);
        await transactions[i].sign(userId2, common.keypair2, add_publickey);

        await transactions[i].digest();

    }
    return transactions

}

export async function writeData(){
    await common.initKeyPair();
    const db = common.getDB();
    await common.dropTable(db);
    await common.createTable(db);
    const transactions1 = await createTransactions(true);
    for (let i = 0; i < transactions1.length; i++){
        let data = [];
        data = data.concat(Array.from(new Uint8Array(2)));
        data = data.concat(Array.from(await transactions1[i].pack()));
        await common.writeData(db, await transactions1[i].getTransactionId(), new Uint8Array(data));
    }
    const transactions2 = await createTransactions(false);
    for (let i = 0; i < transactions2.length; i++){
        let data = [];
        data = data.concat(Array.from(new Uint8Array(2)));
        data = data.concat(Array.from(await transactions2[i].pack()));
        await common.writeData(db, await transactions2[i].getTransactionId(), new Uint8Array(data));
    }
    return true
}
