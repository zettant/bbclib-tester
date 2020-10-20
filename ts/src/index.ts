/**
 * index.ts
 */
import * as transactionReader from './transactionReader';
import * as transactionWriter from './transactionWriter';

export default {transactionReader, transactionWriter }; // both export and export default needs to be declared for compatibility on node and browser.
export {transactionReader, transactionWriter};
