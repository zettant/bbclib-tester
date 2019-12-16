import sqlite3 from 'sqlite3';
import fs from 'fs';
import * as bbclib from 'js-bbclib';
import jseu from "js-encoding-utils";
export let keypair1 = new bbclib.createKeypair();
export let keypair2 = new bbclib.createKeypair();

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
