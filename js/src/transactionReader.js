import sqlite3 from "sqlite3";
import * as bbclib from 'js-bbclib'
import {idLength} from './idLength.js';

import * as common from './common.js'
import jseu from "js-encoding-utils";

export async function readData(){
    const db = common.getDB();
    const txobj = await common.getData(db);
    const transactionData = [];
    for (let i = 0; i < txobj.length; i++){
        const transaction = new bbclib.BBcTransaction(2.0, idLength);
        const transactionBin = new Uint8Array(txobj[i].tx);
        const header = bbclib.helper.hboToInt16(transactionBin.slice(0,2));
        if (header == 0) {
            await transaction.unpack(transactionBin.slice(2));
            await transaction.setTransactionId();
            transactionData.push([txobj[i].txid, transaction, transactionBin.slice(2)]);
        }
    }

    return transactionData
}



