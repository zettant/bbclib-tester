import {getTestEnv} from './prepare';
import * as chai from 'chai';
const expect = chai.expect;

const env = getTestEnv();
const bbclibTester = env.library;
const message = env.message;
const envName = env.envName;

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
