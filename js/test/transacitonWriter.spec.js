import {getTestEnv} from './prepare.js';
import {idLength} from "../src/idLength";
import jseu from 'js-encoding-utils';

import * as textEncoding from 'text-encoding';
const TextEncoder = textEncoding.default.TextEncoder;
const TextDecoder = textEncoding.default.TextDecoder;

const env = getTestEnv();
const bbclibTester = env.library;
const message = env.message;
const envName = env.envName;

const userId1 = "693792d5850481d38c3859a6cafaf08a755cc12d757fef6b011852ce6802488e".slice(0, idLength.user_id * 2);
const userId2 = "730201e5f80b4a5795e009bc2c50c4d2a64c746d55fd2df1ffddbb7c1ff1a6ec".slice(0, idLength.user_id * 2);
const assetGroupId1 = "c3f9f38b875680e0e0b59ed4dc528572019f833946f376d27dcbfb4b4e94b141".slice(0, idLength.asset_group_id * 2);
const assetGroupId2 = "1caa82dfdf71ee073d124bcb7447160f90fd2d044b220618e7e4b00bba9b17f9".slice(0, idLength.asset_group_id * 2);
const domainId = "82f10651e04288b6ffea5c5ea129244dcf887e25bf939ca302d57c87ed6d1659";

describe(`${envName}: transactionWriter`, () => {
  before( async () => {
    console.log(message);
  });

  it('transactionWriter test init', async function () {
    this.timeout(50000);
    const flag = await bbclibTester.transactionWriter.writeData();

    expect(flag).to.be.equal(true);
  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}