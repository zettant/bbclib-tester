import sqlite3 from 'sqlite3';
import fs from 'fs';
import * as bbclib from 'js-bbclib';
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

async function readPrivateKey(name, keypair){

}

export async function initKeyPair(){
    if (fs.existsSync("../db/user1")){
        readPrivateKey("user1", keypair1);
    }else{
        keypair1.generateKey();
        fs.writeFile("../db/user1", keypair1.unpack(), (err) => {
            console.log(err);
        });
    }
    if (fs.existsSync("../db/user2")){
        readPrivateKey("user2", keypair2);
    }else{
        keypair2.generateKey();
        fs.writeFile("../db/user1", keypair1.unpack(), (err) => {
            console.log(err);
        });
    }
};
