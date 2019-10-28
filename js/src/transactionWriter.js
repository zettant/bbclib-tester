import * as bbclib from "js-bbclib";
import {idLength} from './idLength.js';
import * as common from './common.js'
import jseu from 'js-encoding-utils';
import * as textEncoding from "text-encoding";

const TextEncoder = textEncoding.default.TextEncoder;
const TextDecoder = textEncoding.default.TextDecoder;


// TODO:
const userId1 = jseu.encoder.hexStringToArrayBuffer("693792d5850481d38c3859a6cafaf08a755cc12d757fef6b011852ce6802488e".slice(0, idLength.userId * 2));
const userId2 = jseu.encoder.hexStringToArrayBuffer("730201e5f80b4a5795e009bc2c50c4d2a64c746d55fd2df1ffddbb7c1ff1a6ec".slice(0, idLength.userId * 2));
const assetGroupId1 = jseu.encoder.hexStringToArrayBuffer("c3f9f38b875680e0e0b59ed4dc528572019f833946f376d27dcbfb4b4e94b141".slice(0, idLength.assetGroupId * 2));
const assetGroupId2 = jseu.encoder.hexStringToArrayBuffer("1caa82dfdf71ee073d124bcb7447160f90fd2d044b220618e7e4b00bba9b17f9".slice(0, idLength.assetGroupId * 2));
const domainId = jseu.encoder.hexStringToArrayBuffer("82f10651e04288b6ffea5c5ea129244dcf887e25bf939ca302d57c87ed6d1659");

const sleep = async (time) => new Promise( (resolve) => {
  setTimeout( () => {resolve();},  time);
});

async function makeRelationWithAssetRaw(assetGroupId, assetId, assetBody) {
    const relation = new bbclib.BBcRelation(assetGroupId, idLength, 2.0);
    const assetRaw = new bbclib.BBcAssetRaw(idLength);
    assetRaw.setAsset(assetId, assetBody);
    relation.setAssetRaw(assetRaw);
    return relation;
}

async function makeRelationWithAssetHash(assetGroupId, assetIds) {
    const relation = new bbclib.BBcRelation(assetGroupId, idLength, 2.0);
    const assetHash = new bbclib.BBcAssetHash(idLength);
    for (let i = 0; i < assetIds.length; i++){
        assetHash.addAssetId(assetIds[i]);
    }
    relation.setAssetHash(assetHash);
    return relation;
}

async function makeTransaction(relationNum, eventNum, witness, version){

    let transaction = new bbclib.BBcTransaction(version=version, idLength);

    if (eventNum > 0){
        for (let i = 0; i < eventNum; i++){
            const event = new bbclib.BBcEvent(assetGroupId1, idLength);
            const asset = new bbclib.BBcAsset(userId1, idLength);
            event.addAsset(asset);
            transaction.addEvent(event);
        }
    }

    if (relationNum > 0){
        for (let i = 0; i < relationNum; i++){
            const relation = new bbclib.BBcRelation(null, idLength, version=version);
            transaction.addRelation(relation);
        }
    }

    if (witness){
        transaction.setWitness(new bbclib.BBcWitness(idLength));
    }
    return transaction;
}

async function addRelationAsset(transaction, relationIndex, assetGroupId, userId, assetBody, assetFile){
    const asset = new bbclib.BBcAsset(userId, idLength);
    await asset.addAsset(assetFile, assetBody);
    transaction.relations[relationIndex].setAsset(asset);
    transaction.relations[relationIndex].addAssetGroupId(assetGroupId);
    return transaction;
}

async function addEventAsset(transaction, eventIndex, assetGroupId, userId, assetBody, assetFile){
    const asset = new bbclib.BBcAsset(userId, idLength);
    await asset.addAsset(assetFile, assetBody);
    transaction.events[eventIndex].addAsset(asset);
    transaction.events[eventIndex].addAssetGroupId(assetGroupId);
    return transaction;
}

async function addRelationPointer(transaction, relationIndex, refTransactionId, refAssetId){
    const pointer = new bbclib.BBcPointer(refTransactionId, refAssetId, idLength);
    transaction.relations[relationIndex].addPointer(pointer);
    return transaction;
}

async function addRefernceToTransaction(transaction, assetGroupId, refTransaction, eventIndexInRef){
    const reference = new bbclib.BBcReference(assetGroupId, transaction, refTransaction, eventIndexInRef, idLength);
    await reference.prepareReference(refTransaction);
    if (reference.transactionId === null){
        return null;
    }
    transaction.addReference(reference);
    return transaction
}

async function createTransactions(){

    const transactions = [];
    transactions.push(await makeTransaction(1,1, true,2.0));
    const relationBody1 = (new TextEncoder).encode('relation:asset_0-0');
    transactions[0] = await addRelationAsset(transactions[0], 0, assetGroupId1, userId1, relationBody1, null);
    const eventBody = (new TextEncoder).encode('event:asset_0-0');
    transactions[0] = await addEventAsset(transactions[0], 0, assetGroupId1, userId1, eventBody, null);
    transactions[0].events[0].addMandatoryApprover(userId1);
    transactions[0].witness.addWitness(userId1, 2);
    const sig = await transactions[0].sign(null, null, null, common.keypair1);
    transactions[0].witness.addSignature(userId1, sig);
    await transactions[0].setTransactionId();
    common.showStr(transactions[0]);
    console.log(jseu.encoder.arrayBufferToHexString(await transactions[0].pack()));
    console.log(jseu.encoder.arrayBufferToHexString(transactions[0].events[0].pack()));
    console.log(jseu.encoder.arrayBufferToHexString(transactions[0].events[0].asset.pack()));
    console.log("###################################");

    for(let i = 0; i < 19; i++){
        const l = i + 1;
        transactions.push(await makeTransaction(2,1, true,2.0));
        const relationBody2 = (new TextEncoder).encode(`relation:asset_1-${l}`);
        transactions[l] = await addRelationAsset(transactions[l], 0, assetGroupId1, userId1, relationBody2, null);
        transactions[l] = await addRelationPointer(transactions[l], 0, transactions[i].transactionId, transactions[i].relations[0].asset.assetId);

        const relationBody3 = (new TextEncoder).encode(`relation:asset_2-${l}`);
        transactions[l] = await addRelationAsset(transactions[l], 1, assetGroupId2, userId2, relationBody3, null);
        transactions[l] = await addRelationPointer(transactions[l], 1, transactions[i].transactionId, transactions[i].relations[0].asset.assetId);
        transactions[l] = await addRelationPointer(transactions[l], 1, transactions[0].transactionId, transactions[0].relations[0].asset.assetId);

        const eventBody = (new TextEncoder).encode(`event:asset_3-${l}`);
        transactions[l] = await addEventAsset(transactions[l], 0, assetGroupId1, userId2, eventBody, null);

        const assetIds = [];
        for (let k = 0; k < 5; k++){
            assetIds.push(await bbclib.helper.getRandomValue(idLength.assetId));
        }

        const relationBody4 = (new TextEncoder).encode(`relation:asset_4-${l}`);
        const relations2 = await makeRelationWithAssetRaw(assetGroupId1, assetIds[0], relationBody4);
        const assetIdsForHash = assetIds.slice(1,5);
        const relations3 = await makeRelationWithAssetHash(assetGroupId2, assetIdsForHash);
        transactions[l].addRelation(relations2);
        transactions[l].addRelation(relations3);

        transactions[l] = await addRelationPointer(transactions[l], 2, transactions[0].transactionId, transactions[0].relations[0].asset.assetId);
        transactions[l] = await addRelationPointer(transactions[l], 2, transactions[0].transactionId, null);
        transactions[l] = await addRelationPointer(transactions[l], 3, transactions[0].transactionId, transactions[0].relations[0].asset.assetId);

        transactions[l].events[0].addMandatoryApprover(userId1);
        transactions[l] = await addRefernceToTransaction(transactions[l], assetGroupId1, transactions[l-1], 0);

        const crossRef = new bbclib.BBcCrossRef(domainId, transactions[0].transactionId);
        transactions[l].setCrossRef(crossRef);
        transactions[l].witness.addWitness(userId1);
        transactions[l].witness.addWitness(userId2);

        const sig1 = await transactions[l].sign(0, null, null, common.keypair1);
        const sig2 = await transactions[l].sign(0, null, null, common.keypair2);
        transactions[l].witness.addSignature(userId1, sig1);
        transactions[l].witness.addSignature(userId2, sig2);

        await transactions[l].setTransactionId();
        common.showStr(transactions[l]);
        console.log(jseu.encoder.arrayBufferToHexString(await transactions[l].pack()));

        console.log("###################################");

    }
    return transactions

}

export async function writeData(){
    await common.initKeyPair();
    const db = common.getDB();
    await common.dropTable(db);
    await common.createTable(db);
    const transactions = await createTransactions();
    for (let i = 0; i < transactions.length; i++){
        let data = [];
        data = data.concat(Array.from(new Uint8Array(2)));
        data = data.concat(Array.from(await transactions[i].pack()));
        console.log(jseu.encoder.arrayBufferToHexString(transactions[i].transactionId));
        await common.writeData(db, transactions[i].transactionId, new Uint8Array(data));
    }
    return true
}
