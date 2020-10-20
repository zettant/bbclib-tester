import {getTestEnv} from './prepare';
import {idLength} from '../src/idLength';
import jseu from 'js-encoding-utils';
import * as chai from 'chai';
const expect = chai.expect;

// @ts-ignore
import * as textEncoding from 'text-encoding';
const TextEncoder = textEncoding.default.TextEncoder;

const env = getTestEnv();
const bbclibTester = env.library;
const message = env.message;
const envName = env.envName;


const userId1 = '693792d5850481d38c3859a6cafaf08a755cc12d757fef6b011852ce6802488e'.slice(0, idLength.userId * 2);
const userId2 = '730201e5f80b4a5795e009bc2c50c4d2a64c746d55fd2df1ffddbb7c1ff1a6ec'.slice(0, idLength.userId * 2);
const assetGroupId1 = 'c3f9f38b875680e0e0b59ed4dc528572019f833946f376d27dcbfb4b4e94b141'.slice(0, idLength.assetGroupId * 2);
const assetGroupId2 = '1caa82dfdf71ee073d124bcb7447160f90fd2d044b220618e7e4b00bba9b17f9'.slice(0, idLength.assetGroupId * 2);
const domainId = '82f10651e04288b6ffea5c5ea129244dcf887e25bf939ca302d57c87ed6d1659';

describe(`${envName}: transactionReader`, () => {
  before( async () => {
    console.log(message);
  });

  it('transactionReader test init', async function () {
    this.timeout(50000);
    const data = await bbclibTester.transactionReader.readData();
    for (let i = 0; i < data.length; i++){
      const transactionId = data[i][0];
      const transaction = data[i][1];
      // const transactionBin = data[i][2];
      if (i % 20 === 0){
        expect((await transaction.getTransactionId()).length).to.be.eq(idLength.transactionId);
        expectUint8Array(await transaction.getTransactionId(), transactionId);
        expect(transaction.relations.length).to.be.eq(1);
        expect(transaction.events.length).to.be.eq(1);

        //relations
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[0].assetGroupId)).to.be.eq(assetGroupId1);
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[0].asset.userId)).to.be.eq(userId1);
        const relationBody = (new TextEncoder).encode('relation:asset_0-0');
        expectUint8Array(transaction.relations[0].asset.assetBody, relationBody);
        expect(transaction.relations[0].asset.nonce.length).to.be.eq(idLength.nonce);

        //events
        expect(jseu.encoder.arrayBufferToHexString(transaction.events[0].assetGroupId)).to.be.eq(assetGroupId1);
        expect(jseu.encoder.arrayBufferToHexString(transaction.events[0].mandatoryApprovers[0])).to.be.eq(userId1);
        expect(jseu.encoder.arrayBufferToHexString(transaction.events[0].asset.userId)).to.be.eq(userId1);
        const eventBody = (new TextEncoder).encode('event:asset_0-0');
        expectUint8Array(transaction.events[0].asset.assetBody, eventBody);
        expect(transaction.events[0].asset.nonce.length).to.be.eq(idLength.nonce);

        //witness
        expect(transaction.witness.userIds.length).to.be.eq(1);
        expect(transaction.witness.sigIndices.length).to.be.eq(1);
        expect(transaction.signatures.length).to.be.eq(1);
        if (i < 20){
          expect(await transaction.signatures[0].verify(await transaction.getTransactionBase())).to.be.eq(true);
        }
      }else{
        expect((await transaction.getTransactionId()).length).to.be.eq(idLength.transactionId);
        expect(transaction.relations.length).to.be.eq(4);
        expect(transaction.relations[0].pointers.length).to.be.eq(1);
        expect(transaction.relations[1].pointers.length).to.be.eq(2);
        expect(transaction.events.length).to.be.eq(1);
        expect(transaction.references.length).to.be.eq(1);

        // relations 0
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[0].assetGroupId)).to.be.eq(assetGroupId1);
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[0].asset.userId)).to.be.eq(userId1);
        const relation0Body = (new TextEncoder).encode(`relation:asset_1-${i%20}`);
        expectUint8Array(transaction.relations[0].asset.assetBody, relation0Body);
        expect(transaction.relations[0].asset.nonce.length).to.be.eq(idLength.nonce);

        // pointers 0
        expect(transaction.relations[0].pointers[0].transactionId.length).to.be.eq(idLength.transactionId);
        expect(transaction.relations[0].pointers[0].assetId.length).to.be.eq(idLength.assetId);
        expectUint8Array(transaction.relations[0].pointers[0].assetId, data[i-1][1].relations[0].asset.assetId);

        // relations 1
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[1].assetGroupId)).to.be.eq(assetGroupId2);
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[1].asset.userId)).to.be.eq(userId2);
        const relation1Body = (new TextEncoder).encode(`relation:asset_2-${i%20}`);
        expectUint8Array(transaction.relations[1].asset.assetBody, relation1Body);
        expect(transaction.relations[1].asset.nonce.length).to.be.eq(idLength.nonce);

        // pointers 0
        expect(transaction.relations[1].pointers[0].transactionId.length).to.be.eq(idLength.transactionId);
        expect(transaction.relations[1].pointers[0].assetId.length).to.be.eq(idLength.assetId);
        expectUint8Array(transaction.relations[1].pointers[0].transactionId, await data[i-1][1].getTransactionId());
        expectUint8Array(transaction.relations[1].pointers[0].assetId, data[i-1][1].relations[0].asset.assetId);
        //pointers 1
        expect(transaction.relations[1].pointers[1].transactionId.length).to.be.eq(idLength.transactionId);
        expect(transaction.relations[1].pointers[1].assetId.length).to.be.eq(idLength.assetId);

        // relations 2
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[2].assetGroupId)).to.be.eq(assetGroupId1);
        const relation2Body = (new TextEncoder).encode(`relation:asset_4-${i%20}`);
        expectUint8Array(transaction.relations[2].assetRaw.assetBody, relation2Body);
        expect(transaction.relations[2].pointers[0].transactionId.length).to.be.eq(idLength.transactionId);
        expect(transaction.relations[2].pointers[0].assetId.length).to.be.eq(idLength.assetId);
        expect(transaction.relations[2].pointers[1].transactionId.length).to.be.eq(idLength.transactionId);
        expect(transaction.relations[2].pointers[1].assetId).to.be.eq(null);
        // relations 3
        expect(jseu.encoder.arrayBufferToHexString(transaction.relations[3].assetGroupId)).to.be.eq(assetGroupId2);
        expect(transaction.relations[3].assetHash.assetIds.length).to.be.eq(4);
        expect(transaction.relations[3].pointers[0].transactionId.length).to.be.eq(idLength.transactionId);
        expect(transaction.relations[3].pointers[0].assetId.length).to.be.eq(idLength.assetId);
        if (i < 20){
          expectUint8Array(transaction.relations[1].pointers[1].transactionId, await data[0][1].getTransactionId());
          expectUint8Array(transaction.relations[1].pointers[1].assetId,data[0][1].relations[0].asset.assetId);
          expectUint8Array(transaction.relations[2].pointers[0].transactionId, await data[0][1].getTransactionId());
          expectUint8Array(transaction.relations[2].pointers[0].assetId, data[0][1].relations[0].asset.assetId);
          expectUint8Array(transaction.relations[2].pointers[1].transactionId, await data[0][1].getTransactionId());
          expectUint8Array(transaction.relations[3].pointers[0].transactionId, await data[0][1].getTransactionId());
          expectUint8Array(transaction.relations[3].pointers[0].assetId,data[0][1].relations[0].asset.assetId);
        }else{
          expectUint8Array(transaction.relations[1].pointers[1].transactionId, await data[20][1].getTransactionId());
          expectUint8Array(transaction.relations[1].pointers[1].assetId,data[20][1].relations[0].asset.assetId);
          expectUint8Array(transaction.relations[2].pointers[0].transactionId, await data[20][1].getTransactionId());
          expectUint8Array(transaction.relations[2].pointers[0].assetId,data[20][1].relations[0].asset.assetId);
          expectUint8Array(transaction.relations[2].pointers[1].transactionId, await data[20][1].getTransactionId());
          expectUint8Array(transaction.relations[3].pointers[0].transactionId, await data[20][1].getTransactionId());
          expectUint8Array(transaction.relations[3].pointers[0].assetId,data[20][1].relations[0].asset.assetId);
        }
        // event
        expect(transaction.events[0].assetGroupId.length).to.be.eq(idLength.assetGroupId);
        expect(jseu.encoder.arrayBufferToHexString(transaction.events[0].mandatoryApprovers[0])).to.be.eq(userId1);
        expect(jseu.encoder.arrayBufferToHexString(transaction.events[0].asset.userId)).to.be.eq(userId2);
        const eventBody = (new TextEncoder).encode(`event:asset_3-${i%20}`);
        expectUint8Array(transaction.events[0].asset.assetBody,eventBody);
        expect(transaction.events[0].asset.nonce.length).to.be.eq(idLength.nonce);

        // reference
        expect(jseu.encoder.arrayBufferToHexString(transaction.references[0].assetGroupId)).to.be.eq(assetGroupId1);
        expect(transaction.references[0].eventIndexInRef).to.be.eq(0);
        expect(transaction.references[0].sigIndices.length).to.be.eq(1);

        // crossRef
        expect(jseu.encoder.arrayBufferToHexString(transaction.crossRef.domainId)).to.be.eq(domainId);
        if (i < 20 ){
          expectUint8Array(transaction.crossRef.transactionId, await data[0][1].getTransactionId());
        }else{
          expectUint8Array(transaction.crossRef.transactionId, await data[20][1].getTransactionId());
        }

        // witness
        expect(transaction.witness.userIds.length).to.be.eq(2);
        expect(transaction.witness.sigIndices.length).to.be.eq(2);
        expect(transaction.signatures.length).to.be.eq(2);
        if (transaction.signatures[0].keypair == null){
          continue;
        }else{
          expect(await transaction.signatures[0].verify(await transaction.getTransactionBase())).to.be.eq(true);
        }

        if (transaction.signatures[1].keypair == null){
          continue;
        }else{
          expect(await transaction.signatures[1].verify(await transaction.getTransactionBase())).to.be.eq(true);
        }
      }
    }
  });

});


const expectUint8Array = (bin1: any, bin2: any) => {
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
