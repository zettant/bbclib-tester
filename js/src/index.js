/**
 * index.js
 */
import * as transactionReader from './transactionReader.js';
import * as transactionWriter from './transactionWriter.js';

export default {transactionReader, transactionWriter }; // both export and export default needs to be declared for compatibility on node and browser.
export {transactionReader, transactionWriter};