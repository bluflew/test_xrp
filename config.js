const testnet = {
  url: 'wss://s.altnet.rippletest.net:51233',
  // url: "wss://54.215.17.178:5006",
  // url: "wss://ibk-token.io:51235",
  rpcAddress: '54.215.17.178',
  _feeCushion: 1.2,
  _maxFeeXRP: '2',
  rpcPort: 51235,
  pathSSL: "./ssl/ibk_test_key.pem",
  username: "username",
  password: "password",
  address: "ra1tCne2qBzWP2HXYDpmkHp9ehXFzvooMJ",
  secret: "shLii71jJCMT3BGqa3n9KSTbSbtdL",
  path: "m/44'/144'/0'/0/0"
};

const maintest = {
  url: "wss://s1.ripple.com",
  address: "",
  secret: "",
  path: "m/44'/144'/0'/0/0"
};

module.exports = testnet;