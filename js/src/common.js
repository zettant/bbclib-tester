import sqlite3 from 'sqlite3';
import fs from 'fs';
import * as bbclib from 'js-bbclib';
import jseu from "js-encoding-utils";
export let keypair1 = new bbclib.KeyPair();
export let keypair2 = new bbclib.KeyPair();

export function getDB(){
    const database = new sqlite3.Database("../db/txdb.sqlite");
    return database;
}

export async function getData(db){
    return new Promise((resolve, reject) => {
        db.all('select * from txtbl', (err, res) => {
            resolve(res)
        });
    });
};

export async function writeData(db, txid, txdat){
    db.serialize(function (){
        db.run("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", [txid, txdat]);
    });
}

export async function createTable(db){
    new Promise(resolve => {
        db.serialize(function () {
            db.run("CREATE TABLE txtbl(txid BLOB PRIMARY KEY, tx BLOB)");
        });
    });
}

export async function dropTable(db){
    new Promise(resolve => {
        db.serialize(function () {
            db.run("DROP TABLE IF EXISTS txtbl");
        });
    });
}

async function readPrivateKey(name){
    const user1FilePath = "../db/user1";
    const user2FilePath = "../db/user2";
    if (name=="user1"){
        const privateKey = String.fromCharCode.apply("", new Uint16Array(fs.readFileSync(user1FilePath)));
        keypair1.setKeyPair('pem', privateKey, null);
        // console.log(keypair1);
        await keypair1.createPublicKeyFromPrivateKey();
    }
    if (name=="user2"){
        const privateKey = String.fromCharCode.apply("", new Uint16Array(fs.readFileSync(user2FilePath)));
        keypair2.setKeyPair('pem', privateKey, null);
        await keypair2.createPublicKeyFromPrivateKey();
    }
}

export async function initKeyPair(){
    if (fs.existsSync("../db/user1")){
        await readPrivateKey("user1");
    }else{
        await keypair1.generate();
        fs.writeFile("../db/user1", await keypair1.exportPrivateKey("pem"), (err) => {
            console.log(err);
        });
    }
    if (fs.existsSync("../db/user2")){
        await readPrivateKey("user2");
    }else{
        await keypair2.generate();
        fs.writeFile("../db/user2", await keypair1.exportPrivateKey("pem"), (err) => {
            console.log(err);
        });
    }
};






export function showStr(transaction) {
    console.log('**************showStr*************** :');

    console.log('idsLength :', transaction.idsLength);
    console.log('version :', transaction.version);
    console.log('timestamp :', transaction.timestamp);

    if (transaction.events.length > 0) {
      console.log('events');
      for (let i = 0; i < transaction.events.length; i++) {
        console.log('event[', i, '] :');
        console.log('assetGroupId :' + jseu.encoder.arrayBufferToHexString(transaction.events[i].assetGroupId));
        console.log('referenceIndices :' + transaction.events[i].referenceIndices);
        console.log('mandatoryApprovers :' + jseu.encoder.arrayBufferToHexString(transaction.events[i].mandatoryApprovers[0]));
        console.log('optionApproverNumNumerator :' + transaction.events[i].optionApproverNumNumerator);
        console.log('optionApproverNumDenominator :' + transaction.events[i].optionApproverNumDenominator);
        console.log('Asset asset id :' + jseu.encoder.arrayBufferToHexString(transaction.events[i].asset.assetId));
        console.log('Asset user id :' + jseu.encoder.arrayBufferToHexString(transaction.events[i].asset.userId));
        console.log('Asset nonce :' + jseu.encoder.arrayBufferToHexString(transaction.events[i].asset.nonce));
        console.log('Asset bodeSize :' + transaction.events[i].asset.assetBodySize);
        console.log('Asset body :' + jseu.encoder.arrayBufferToHexString(transaction.events[i].asset.assetBody));
      }
    }
    if (transaction.references.length > 0) {
        console.log('references');
        for (let i = 0; i < transaction.references.length; i++) {
            console.log('references assetGroupId :', jseu.encoder.arrayBufferToHexString(transaction.references[i].assetGroupId));
            console.log('references transactionId:', jseu.encoder.arrayBufferToHexString(transaction.references[i].transactionId));
            console.log('references eventIndexInRef:', transaction.references[i].eventIndexInRef);
            console.log('references sigIndices.length:', transaction.references[i].sigIndices.length);
        }
    }
    if (transaction.relations.length > 0) {
      console.log('relations');
      for (let i = 0; i < transaction.relations.length; i++) {
        console.log('relations[', i, '] :');
        console.log('version:',  transaction.relations[i].version );
        console.log('assetGroupId :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetGroupId));
        if (transaction.relations[i].pointers.length > 0){
          for (let l = 0; l < transaction.relations[i].pointers.length; l++) {
            console.log('pointer transaction id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].pointers[l].transactionId));
            if (transaction.relations[i].pointers[l].assetId !== null){
              console.log('pointer asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].pointers[l].assetId));
            }
          }
        }

        if (transaction.relations[i].asset !== null){
          console.log('Asset asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].asset.assetId));
          console.log('Asset user id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].asset.userId));
          console.log('Asset nonce :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].asset.nonce));
          console.log('Asset bodeSize :' + transaction.relations[i].asset.assetBodySize);
          console.log('Asset body :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].asset.assetBody));

        }else if (transaction.relations[i].assetHash !== null){
          console.log('AssetHash size :' + transaction.relations[i].assetHash.assetIds.length);
          console.log('AssetHash asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetHash.assetIds[0]));
          console.log('AssetHash asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetHash.assetIds[1]));
          console.log('AssetHash asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetHash.assetIds[2]));
          console.log('AssetHash asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetHash.assetIds[3]));
        }else if (transaction.relations[i].assetRaw !== null){
          console.log('AssetRaw asset id :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetRaw.assetId));
          console.log('AssetRaw bodeSize :' + transaction.relations[i].assetRaw.assetBodySize);
          console.log('AssetRaw body :' + jseu.encoder.arrayBufferToHexString(transaction.relations[i].assetRaw.assetBody));
        }
      }
    }

    if (transaction.witness !== null) {
      console.log('witness');
      if (transaction.witness.userIds.length > 0){
          for (let i = 0; i < transaction.witness.userIds.length; i++){
            console.log('this.userIds[', i, '] :', jseu.encoder.arrayBufferToHexString(transaction.witness.userIds[i]));
            console.log('this.sigIndices[', i, '] :', transaction.witness.sigIndices[i]);
          }

      }
    }

    if(transaction.crossRef !== null){
      console.log('crossRef domainId:', jseu.encoder.arrayBufferToHexString(transaction.crossRef.domainId));
      console.log('crossRef transactionId:', jseu.encoder.arrayBufferToHexString(transaction.crossRef.transactionId));
    }

    if ( transaction.signatures.length > 0){
      for (let i = 0; i < transaction.signatures.length; i++){
        console.log('keyType :', transaction.signatures[i].keyType);
        console.log('signature :', jseu.encoder.arrayBufferToHexString(transaction.signatures[i].signature));
        console.log('pubkeyByte :', jseu.encoder.arrayBufferToHexString(transaction.signatures[i].pubkeyByte));
      }
    }

    console.log('useridSigidxMapping :', transaction.useridSigidxMapping);
    console.log('transactionId :', jseu.encoder.arrayBufferToHexString(transaction.transactionId));
    console.log('transactionBaseDigest :', jseu.encoder.arrayBufferToHexString(transaction.transactionBaseDigest));
  }