import sqlite3 from 'sqlite3';
import fs from 'fs';
// @ts-ignore
import * as bbclib from 'js-bbclib';
// import jseu from "js-encoding-utils";
export const keypair1 = new bbclib.createKeypair();
export const keypair2 = new bbclib.createKeypair();

export const getDB = (): sqlite3.Database => {
  const database = new sqlite3.Database('../db/txdb.sqlite');
  return database;
};

export const getData = async (db: sqlite3.Database): Promise<any[]> => new Promise((resolve) => {
  db.all('select * from txtbl', (err: any, rows:any[]) => {
    if(err) {
      console.log(err);
    }
    resolve(rows);
  });
});

export const writeData = async (db: sqlite3.Database, txid: string, txdat: Uint8Array): Promise<void> => {
  new Promise(() => {
    db.serialize(() => {
      db.run('INSERT INTO txtbl(txid, tx) VALUES (?, ?)', [txid, txdat]);
    });
  });
};

export const createTable = async (db: sqlite3.Database): Promise<void> => {
  new Promise(() => {
    db.serialize(() => {
      db.run('CREATE TABLE txtbl(txid BLOB PRIMARY KEY, tx BLOB)');
    });
  });
};

export const dropTable = async (db: sqlite3.Database): Promise<void> => {
  new Promise(() => {
    db.serialize(() => {
      db.run('DROP TABLE IF EXISTS txtbl');
    });
  });
};

const readPrivateKey = async (name: string): Promise<void> => {
  const user1FilePath: string = '../db/user1';
  const user2FilePath: string = '../db/user2';
  if (name=='user1'){
    let privateKey: string = '';
    (new Uint8Array(fs.readFileSync(user1FilePath))).forEach((byte: number) => {
      privateKey += String.fromCharCode(byte);
    });
    // const privateKey = String.fromCharCode.apply('', unit16Array);
    keypair1.setKeyPair('pem', privateKey, null);
    await keypair1.createPublicKeyFromPrivateKey();
  }
  if (name=='user2'){
    let privateKey: string = '';
    (new Uint8Array(fs.readFileSync(user2FilePath))).forEach((byte: number) => {
      privateKey += String.fromCharCode(byte);
    });
    // const privateKey = String.fromCharCode.apply('', new Uint16Array(fs.readFileSync(user2FilePath)));
    keypair2.setKeyPair('pem', privateKey, null);
    await keypair2.createPublicKeyFromPrivateKey();
  }
};

export const initKeyPair = async (): Promise<void> => {
  if (fs.existsSync('../db/user1')){
    await readPrivateKey('user1');
  }else{
    await keypair1.generate();
    fs.writeFile('../db/user1', await keypair1.exportPrivateKey('pem'), (err) => {
      console.log(err);
    });
  }
  if (fs.existsSync('../db/user2')){
    await readPrivateKey('user2');
  }else{
    await keypair2.generate();
    fs.writeFile('../db/user2', await keypair1.exportPrivateKey('pem'), (err) => {
      console.log(err);
    });
  }
};
