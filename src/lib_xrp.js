"use strict";

const RippleAPI = require("ripple-lib").RippleAPI;
const BigNumber = require("bignumber.js");
const bip39 = require("bip39");
const bip32 = require("ripple-bip32");
const rippleKeyPairs = require("ripple-keypairs");

const config = require("../config");

const rippleAPI = new RippleAPI({
  server: config.url, // Public rippled server
  // server: 'ws://s.altnet.rippletest.net:51233', // Public rippled server
});

/* Number of ledgers to check for valid transaction before failing */
const ledgerOffset = 5;
const myInstructions = {
  maxLedgerVersionOffset: ledgerOffset
};

// get seed from mnemonic and password.
const getSeed = (mnemonic, password = '') => {
  let seed = '';
  // validate mnemonic using bip39 library.
  if (bip39.validateMnemonic(mnemonic, bip39.wordlists.EN)) {
    seed = bip39.mnemonicToSeedHex(mnemonic, password);
  }
  if (seed === '') {
    return undefined;
  } else {
    // return buffer seed.
    return bip32.fromSeedBuffer(Buffer.from(seed, 'hex'));
  }
}

const RippleService = {

  // Create wallet from password.
  createWallet: async (password = '', path = config.path) => {
    // generate mnemonic using bip39 library.
    const mnemonic = bip39.generateMnemonic();
    // get seed from mnemonic and password.
    const rootKey = getSeed(mnemonic, password);
    // check data get seed.
    if (rootKey === 'undefined') {
      return {
        success: false,
        data: undefined
      }
    }
    // Get key pairs from seed by path contains publickey and privatekey.
    const keyPairs = rootKey.derivePath(path).keyPair.getKeyPairs();
    // get address from seed by path.
    const address = rootKey.derivePath(path).getAddress();

    const wallet = {
      mnemonic: mnemonic,
      XRP: {
        address: address,
        privatekey: keyPairs.privateKey
      }
    }
    return {
      success: true,
      data: wallet
    }
  },

  /** Get password from mnemonic and password.
   * 
   */
  getPrivateKey: async (mnemonic, password = '') => {
    // get seed from mnemonic and password.
    const rootKey = getSeed(mnemonic, password);
    // check data get seed.
    if (rootKey === 'undefined') {
      return {
        success: false,
        data: undefined
      }
    }
    // Get key pairs from seed by path contains publickey and privatekey.
    const keyPairs = rootKey.derivePath(path).keyPair.getKeyPairs();
    return {
      success: true,
      data: keyPairs.privateKey
    }
  },

  // recover wallet from mnemonic and password.
  recoverWallet: async (mnemonic, password = '', path = config.path) => {
    // get seed from mnemonic and password.
    const rootKey = getSeed(mnemonic, password);
    // check data get seed.
    if (rootKey === 'undefined') {
      return {
        success: false,
        data: undefined
      }
    }
    // Get key pairs from seed by path contains publickey and privatekey.
    const keyPairs = rootKey.derivePath(path).keyPair.getKeyPairs();
    // get address from seed by path.
    const address = rootKey.derivePath(path).getAddress();

    const wallet = {
      mnemonic: mnemonic,
      XRP: {
        address: address,
        privatekey: keyPairs.privateKey
      }
    }
    return {
      success: true,
      data: wallet
    }
  },

  /** Get balance from address.
   *  Param:
   *    address: address want get balance.
   */
  getBalance: async address => {
    return new Promise(resolve => {
      // connect to server and get balnce from address.
      rippleAPI
        .connect()
        .then(() => rippleAPI.getBalances(address))
        .then(balances => {
          // console.log(balances);
          // filter balance from data by XRP currency
          const xrpBalance = balances.find(
            balance => balance.currency === "XRP"
          );
          if (!xrpBalance)
            resolve({
              success: false,
              data: "xrp Balance null"
            });
          // console.log(xrpBalance);
          resolve({
            success: true,
            data: xrpBalance.value
          });
        })
        .catch(err => {
          resolve({
            success: false,
            data: err
          });
        });
    });
  },

  // Get fee from server api.
  getTransactionFee: async () => {
    return new Promise(resolve => {
      // connect to server and get fee.
      rippleAPI
        .connect()
        .then(() => rippleAPI.getFee())
        .then(fee =>
          resolve({
            success: true,
            data: fee
          })
        )
        .catch(err =>
          resolve({
            success: false,
            data: err
          })
        );
    });
  },

  /** Send Transaction
   *  params:
   *    fromAddress:  address of sender.
   *    secretKey:    secretKey of sender.
   *    toAddress:    address of receiver.
   *    amount:       amount send.
   */
  sendTransaction: async (fromAddress, secretKey, toAddress, amount) => {
    console.log("send token...");
    return new Promise(resolve => {
      try {
        if (!secretKey || !fromAddress || !toAddress || amount == null) {
          resolve({
            success: false,
            data: "error"
          });
        }
        amount = new BigNumber(amount).toFixed(5);
        const transactionData = {
          source: {
            address: fromAddress,
            maxAmount: {
              value: amount,
              currency: "XRP"
            }
          },
          destination: {
            address: toAddress,
            amount: {
              value: amount,
              currency: "XRP"
            }
          }
        };
        console.log('Transaction data: ', transactionData);
        console.log('My Instructions: ', myInstructions);

        // connect to server and send transaction.
        rippleAPI
          .connect()
          .then(() => {
            return rippleAPI
              .preparePayment(fromAddress, transactionData, myInstructions)
              .then(prepared => {
                console.log("Payment transaction prepared...");
                console.log('Prepared: ', prepared);
                const {
                  signedTransaction,
                  id
                } = rippleAPI.sign(
                  prepared.txJSON,
                  secretKey
                );
                console.log('signedTransaction: ', signedTransaction);
                console.log("Payment transaction signed...");
                return rippleAPI.submit(signedTransaction).then(result => {
                  console.log('Result: ', result);
                  console.log("sendTransaction", result.resultCode);
                  console.log(result.resultCode);
                  if (result && result.resultCode === "tesSUCCESS") {
                    resolve({
                      success: true,
                      data: id
                    });
                  } else {
                    resolve({
                      success: false,
                      data: "Ripple transaction error",
                      extra: result
                    });
                  }
                });
              });
          })
          .catch(error => {
            console.log("preparePayment error: ", error);
            resolve({
              success: false,
              data: "Ripple transaction error",
              extra: error
            });
          });
      } catch (error) {
        console.log("RippleService ", error);
        resolve({
          success: false,
          data: "system error",
          extra: error
        });
      }
    });
  },

  /** Get transaction from txHash.
   *  Param:
   *    txtHash: transaction hash want to check from node.
   */
  getTransaction: async txtHash => {
    return new Promise(resolve => {
      try {
        if (!txtHash) {
          resolve({
            success: false,
            data: "VALIDATION_ERROR"
          });
        }
        // connect to server and get transaction by transaction hash.
        rippleAPI
          .connect()
          .then(() => rippleAPI.getTransaction(txtHash))
          .then(transaction => {
            console.log({
              transaction
            });
            if (!transaction || !transaction.outcome) {
              resolve({
                success: true,
                data: "PENDING"
              });
            }
            if (
              transaction.outcome.result === "tesSUCCESS" &&
              transaction.outcome.indexInLedger >= 0
            ) {
              resolve({
                success: true,
                data: "SUCCESS",
                extra: transaction
              });
            }
            resolve({
              success: true,
              data: "FAID",
              extra: transaction
            });
          })
          .catch(error => {
            console.log("Catch error: ", error);
            resolve({
              success: false,
              data: "ERROR",
              extra: error
            });
          });
      } catch (error) {
        console.log("RippleService getTransaction", error);
        resolve({
          success: false,
          data: "ERROR",
          extra: error
        });
      }
    });
  }
};

module.exports = RippleService;