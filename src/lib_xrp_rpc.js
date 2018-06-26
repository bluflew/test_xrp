const axios = require('axios');
const config = require('../config');
const BigNumber = require('bignumber.js');
const WAValidator = require('wallet-address-validator');

class RippleRpcHelper {
  async callRPC(method, params) {
    const url = 'http://' + config.rpcAddress + ':' + config.rpcPort;
    // const url = 'https://s.altnet.rippletest.net:51234';
    const instance = axios.create({
      headers: {
        "Content-Type": "application/json"
      },
    });
    // Data request.
    const jsonRpcData = {
      "method": method,
      "params": params
    };
    // request post data from node server.
    const result = await instance.post(url, jsonRpcData);
    return result.data && result.data.result ? result.data.result : undefined;
  }

  async getFee() {
    try {
      const _feeCushion = config._feeCushion || 1.2;
      const _maxFeeXRP = config._maxFeeXRP || '2';
      // Get server info.
      const serverInfo = (await this.callRPC('server_info', [{}])).info;
      // Base fee xrp from server.
      const baseFeeXrp = new BigNumber(serverInfo.validated_ledger.base_fee_xrp);
      // get fee from server.
      const fee = baseFeeXrp.times(serverInfo.load_factor).times(_feeCushion);

      return {
        success: true,
        data: BigNumber.min(fee, _maxFeeXRP).toString(10)
      };
    } catch (err) {
      // console.log('Err get fee: ', err);
      return {
        success: false,
        data: err
      };
    }
  }

  /** Get balance from address.
   *  Param:
   *    address: address want get balance.
   */
  async getBalance(address) {
    try {
      // Validate address input.
      const valid = WAValidator.validate(address, 'XRP');
      if (!valid) {
        return {
          success: false,
          data: 'Address invalid'
        };
      }
      // Params request server get info account.
      const params = [{
        "account": address,
        "strict": true,
        "ledger_index": "current",
        "queue": true
      }];
      // Request server and get value.
      const getBalances = await this.callRPC('account_info', params);
      return {
        success: true,
        data: getBalances && getBalances.account_data && getBalances.account_data.Balance ?
          (new BigNumber(getBalances.account_data.Balance)).dividedBy(1000000.0).toString(10) : 0
      };
    } catch (err) {
      return {
        success: false,
        data: err
      };
    }
  }

  /** Send Transaction
   *  params:
   *    fromAddress:  address of sender.
   *    secretKey:    secretKey of sender.
   *    toAddress:    address of receiver.
   *    amount:       amount send.
   */
  async sendTransaction(fromAddress, secretKey, toAddress, amount) {
    try {
      // Validate address input.
      let valid = WAValidator.validate(fromAddress, 'XRP');
      if (!valid) {
        return {
          success: false,
          data: 'From address invalid'
        };
      }
      valid = WAValidator.validate(toAddress, 'XRP');
      if (!valid) {
        return {
          success: false,
          data: 'To address invalid'
        };
      }
      // Get balance of from address.
      const getBalanceRipple = await this.getBalance(fromAddress);
      if (getBalanceRipple && !getBalanceRipple.success) {
        return {
          success: false,
          data: 'get balance from address failed'
        };
      }
      // get fee from node server.
      const getMaxFee = await this.callRPC('fee', [{}]);
      if (typeof (getMaxFee) == undefined) {
        return {
          success: false,
          data: 'get fee from server failed'
        };
      }
      const amountSend = amount * Math.pow(10, 6);

      // check 
      if (parseInt(getBalanceRipple.data * Math.pow(10, 6)) < amountSend) {
        return {
          success: false,
          data: 'Insufficient coins XRP for send fee of XRP'
        };
      }

      const dataSignTransaction = [{
        "offline": false,
        "secret": secretKey,
        "tx_json": {
          "Account": fromAddress,
          "Amount": amountSend.toString(),
          "Destination": toAddress,
          "TransactionType": "Payment"
        },
        "fee_mult_max": parseInt(getMaxFee.drops.median_fee)
      }];

      const dataSign = await this.callRPC('sign', dataSignTransaction);
      if (typeof (dataSign) == undefined) {
        return {
          success: false,
          data: 'sign transaction failed'
        };
      }
      const dataSubmitTransaction = [{
        "tx_blob": dataSign.tx_blob
      }]
      const dataSubmit = await this.callRPC('submit', dataSubmitTransaction);

      if (typeof (dataSubmit) == undefined) {
        return {
          success: false,
          data: 'submit transaction failed'
        };
      }

      if (dataSubmit && dataSubmit.tx_json && dataSubmit.tx_json.hash) {
        // return data and save database.
        return {
          success: true,
          data: {
            "currency": "XRP",
            "amount": amount,
            "address": toAddress,
            "txid": dataSubmit.tx_json.hash
          }
        };
      } else {
        return {
          success: false,
          data: "Send fee XRP error, can't create txid"
        };
      }
    } catch (err) {
      return {
        success: false,
        data: err
      };
    }
  }
  /** Get transaction from txHash.
   *  Param:
   *    txtHash: transaction hash want to check from node.
   */

  async getTransaction(txtHash) {
    try {
      const paramsGetTransaction = [{
        "transaction": txtHash,
        "binary": false
      }];
      const dataGetTransaction = await this.callRPC('tx', paramsGetTransaction);
      if (typeof (dataGetTransaction) == undefined) {
        return {
          success: false,
          data: 'get transaction by txtHash failed'
        };
      }
      return {
        success: true,
        data: dataGetTransaction
      };
    } catch (err) {
      return {
        success: false,
        data: err
      };
    }
  }

};

module.exports = new RippleRpcHelper();