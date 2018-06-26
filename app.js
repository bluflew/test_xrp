'use strict';

const config = require('./config');
const RippleService = require('./src/lib_xrp');
const RippleRPCService = require('./src/lib_xrp_rpc');

(async () => {
  // const data = await RippleService.getBalance(config.address);

  // console.log('Data response get balance: ', data);

  const getFee = await RippleService.getTransactionFee();

  console.log('Get Fee: ', getFee);

  const getFeeRPC = await RippleRPCService.getFee();
  console.log('Get fee rpc: ', getFeeRPC);

  // const getBalance = await RippleRPCService.getBalance('ra1tCne2qBzWP2HXYDpmkHp9ehXFzvooMJ');
  // const getBalance = await RippleRPCService.getBalance('rUGwRBTvEXrnn6HhzM1SGpLkA6RaGKdkjS');
  // console.log('Get balance from address rpc: ', getBalance);
  // const createWallet = await RippleService.createWallet('123123');
  // console.log(
  //   createWallet.data
  // );

  // const testTransaction = await RippleRPCService.sendTransaction('rUGwRBTvEXrnn6HhzM1SGpLkA6RaGKdkjS', 'ssQNQqEx1AoXRMaNMLBqYWzPLKCbz', 'ra1tCne2qBzWP2HXYDpmkHp9ehXFzvooMJ', 5);

  // console.log({
  //   testTransaction
  // });

  // E23D6AECAA24C55F2B655C80FC93C0CC6A084758C93FFFC1682DC1CDBC7E9AE8

  // console.log('Get transaction by txtHash: ', await RippleRPCService.getTransaction('E23D6AECAA24C55F2B655C80FC93C0CC6A084758C93FFFC1682DC1CDBC7E9AE8'))

  // const test = 'almost input young swear reveal stamp shove item access improve stem vault';
  // const recoverWallet = await RippleService.recoverWallet(test, '123123');
  // console.log(
  //   recoverWallet.data ? recoverWallet.data : 'No data'
  // );

  // const dataSendToken = await RippleService.sendTransaction('rUGwRBTvEXrnn6HhzM1SGpLkA6RaGKdkjS', 'ssQNQqEx1AoXRMaNMLBqYWzPLKCbz', 'ra1tCne2qBzWP2HXYDpmkHp9ehXFzvooMJ', 5);

  // console.log('Data send token: ', dataSendToken);

  // if (dataSendToken && dataSendToken.success) {
  //   console.log('Id token: ', dataSendToken.data);
  //   const dataGetTransaction = await RippleService.getTransaction(dataSendToken.data);
  //   console.log('Data get transaction: ', dataGetTransaction);
  // }

  // 2B05C9E3F12247D4B5C94345870619EF5EB1AC1097457000EB966B8CAA3E0242
  // DBA4BDBD0D203CA589114FB4D1FF7D42AFF060C0B5E477D4F06D8B75DFF2B8CE
  // 24A655D00261850CF7CF1DEEA83BB8C9B75F8043FDEB68D85C5B7E75FB5AC7B3
  // const dataGetTransaction = await RippleService.getTransaction('2B05C9E3F12247D4B5C94345870619EF5EB1AC1097457000EB966B8CAA3E0242');
  // console.log('Data get transaction: ', dataGetTransaction);

  const dataAddressOne = await RippleService.getBalance('rUGwRBTvEXrnn6HhzM1SGpLkA6RaGKdkjS');

  const dataAddressTwo = await RippleService.getBalance('ra1tCne2qBzWP2HXYDpmkHp9ehXFzvooMJ');

  console.log('Data Address One: ', dataAddressOne);

  console.log('Data Address Two: ', dataAddressTwo);

})().catch(err => {
  console.log('Err app.js: ', err);
})