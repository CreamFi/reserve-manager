const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const cTokenAbi = require("../abi/cToken");
const cTokenAdminAbi = require("../abi/cTokenAdmin");
const erc20Abi = require("../abi/erc20");
const burnerAbi = require("../abi/burner");
const reserveManagerAbi = require("../abi/reserveManager");

describe('integration-IB', () => {
  const toWei = ethers.utils.parseEther;
  const provider = waffle.provider;

  const creamMultisigAddress = '0x6D5a7597896A703Fe8c85775B23395a48f971305';
  const cTokenAdminAddress = '0xA67B44E37200e92e6Da6249d8ae6D48f832A038d';
  const feeDistributorAddress = '0x0Ca0f068edad122f09a39f99E7E89E705d6f6Ace';
  const reserveManagerAddress = '0x1533ba49Dd0A5c8cD9E2e3666dd11128E70B2BcB';

  // tokens
  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const cDaiAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const musdAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';
  const krwAddress = '0x95dFDC8161832e4fF7816aC4B6367CE201538253';
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
  const yvCurveIBAddresss = '0x27b7b1ad7288079A66d12350c828D3C00A6F07d7'; // the destination token

  // burners
  const musdBurner = '0x98182BF525A4252C436ac349a4b79c7E6cd0EB7A';
  const synthBurner = '0xe32421a4E0544F7a25f006901167CF2310d3b86f';
  const cTokenBurner = '0x8B9a81B66131A62aEF5f229d218EE22b42E92aC2';
  const uniswapV3Burner = '0xc29C28132a5b84d38d17660F0580Aa6AdDB5a837';
  const uniswapBurner = '0xfBbfa5fd64246046e683c423aa2AB0470fbD328D';
  const usdcBurner = '0x4486835e0C567A320C0636d8F6e6e6679A46a271';
  const manualBurner = '0x4e6b6b9606B4E45C19Dd27D58b2CF3B66B2a8579';

  // cTokens
  const cyWethAddress = '0x41c84c0e2ee0b740cf0d31f63f3b6f627dc6b393'; // uniswapBurner
  const cyUsdtAddress = '0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a'; // uniswapBurner
  const cyUsdcAddress = '0x76eb2fe28b36b3ee97f3adae0c69606eedb2a37c'; // usdcBurner
  const cyCDaiAddress = '0x4f12c9dabb5319a252463e6028ca833f1164d045'; // cTokenBurner
  const cyMusdAddress = '0xBE86e8918DFc7d3Cb10d295fc220F941A1470C5c'; // musdBurner
  const cySeurAddress = '0xCA55F9C4E77f7B8524178583b0f7c798De17fD54'; // synthBurner
  const cyKrwAddress = '0x3c9f5385c288cE438Ed55620938A4B967c080101'; // manualBurner
  const cySusdAddress = '0x4e3a36A633f63aee0aB57b5054EC78867CB3C0b8'; // blocked

  let accounts;
  let root, rootAddress;
  let owner, ownerAddress;
  let user, userAddress;

  let creamMultisig;

  let reserveManager;

  let cyWeth;
  let cyUsdt;
  let cyUsdc;
  let cyCDai;
  let cyMusd;
  let cySeur;
  let cyKrw;
  let cySusd;
  let cTokenAdmin;

  let yvCurveIB;

  beforeEach(async () => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [{
        forking: {
          jsonRpcUrl: "https://mainnet-eth.compound.finance",
          blockNumber: 13035820
        }
      }]
    });

    accounts = await ethers.getSigners();
    root = accounts[0];
    rootAddress = await root.getAddress();
    owner = accounts[1];
    ownerAddress = await owner.getAddress();
    user = accounts[2];
    userAddress = await user.getAddress();

    creamMultisig = ethers.provider.getSigner(creamMultisigAddress);

    cyWeth = new ethers.Contract(cyWethAddress, cTokenAbi, provider);
    cyUsdt = new ethers.Contract(cyUsdtAddress, cTokenAbi, provider);
    cyUsdc = new ethers.Contract(cyUsdcAddress, cTokenAbi, provider);
    cyCDai = new ethers.Contract(cyCDaiAddress, cTokenAbi, provider);
    cyMusd = new ethers.Contract(cyMusdAddress, cTokenAbi, provider);
    cySeur = new ethers.Contract(cySeurAddress, cTokenAbi, provider);
    cyKrw = new ethers.Contract(cyKrwAddress, cTokenAbi, provider);
    cySusd = new ethers.Contract(cySusdAddress, cTokenAbi, provider);
    cTokenAdmin = new ethers.Contract(cTokenAdminAddress, cTokenAdminAbi, provider);
    yvCurveIB = new ethers.Contract(yvCurveIBAddresss, erc20Abi, provider);
    reserveManager = new ethers.Contract(reserveManagerAddress, reserveManagerAbi, provider);
  });

  it('weth with uniswap burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([cyWethAddress]);

    const totalReserves1 = await cyWeth.totalReserves(); // 46.40 weth
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await cyWeth.connect(root).accrueInterest();

    const totalReserves2 = await cyWeth.totalReserves(); // 49.67 weth
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([cyWethAddress]);

    /**
     * ETH price: $3300
     * ETH reserves: +3.27 ETH ($10000)
     * Dispatch value: $5000 (10000 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 4919 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('usdt (non-stadrard) with uniswap burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([cyUsdtAddress]);

    const totalReserves1 = await cyUsdt.totalReserves(); // 56050 usdt
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await cyUsdt.connect(root).accrueInterest();

    const totalReserves2 = await cyUsdt.totalReserves(); // 59777 usdt
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([cyUsdtAddress]);

    /**
     * usdt price: $1
     * usdt reserves: +3727 usdt ($3727)
     * Dispatch value: $1900 (3727 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 1702 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('usdc with usdc burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([cyUsdcAddress]);

    const totalReserves1 = await cyUsdc.totalReserves(); // 99887 USDusdcC
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await cyUsdc.connect(root).accrueInterest();

    const totalReserves2 = await cyUsdc.totalReserves(); // 102287 usdc
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([cyUsdcAddress]);

    /**
     * USDC price: $1
     * USDC reserves: +2400 USDC ($2400)
     * Dispatch value: $1200 (2400 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 1101 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('cDai with cDai burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([cyCDaiAddress]);

    const totalReserves1 = await cyCDai.totalReserves(); // 0 cDai
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in cyCDai is too less. Add reserves manually.
    const cDaiWhaleAddress = '0xab4CE310054A11328685ecE1043211b68BA5d082';
    const addAmount = '1000000000000'; // 10000e8
    await addReserves(cyCDai, cDaiAddress, cDaiWhaleAddress, addAmount);

    const totalReserves2 = await cyCDai.totalReserves(); // 10000 cDai
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([cyCDaiAddress]);

    // cDai will be converted to DAI and stay in the uniswap burner.
    // Also, after the first burn, DAI will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(daiAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * cDai price: $0.02
     * cDai reserves: +10000 cDai ($200)
     * Dispatch value: $100 (200 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 98.54 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('musd with musd burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([cyMusdAddress]);

    const totalReserves1 = await cyMusd.totalReserves(); // 49.37 musd
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in cyMusd is too less. Add reserves manually.
    const musdWhaleAddress = '0x3ad1d5cfcf9169da73c23d85d5f2bf53bc9d39df';
    const addAmount = toWei('1000');
    await addReserves(cyMusd, musdAddress, musdWhaleAddress, addAmount);

    const totalReserves2 = await cyMusd.totalReserves(); // 1060.67 musd
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([cyMusdAddress]);

    /**
     * musd price: $1
     * musd reserves: +1000 yvCurve-sEth ($1000)
     * Dispatch value: $500 (1000 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 464.30 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('krw with manual burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([cyKrwAddress]);

    const totalReserves1 = await cyKrw.totalReserves(); // 910848 krw
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Add reserves manually.
    const krwWhaleAddress = '0xF555eA7a85C2Cf13DB640148e2d4c8a8027e8eF4';
    const addAmount = toWei('100');
    await addReserves(cyKrw, krwAddress, krwWhaleAddress, addAmount);

    const totalReserves2 = await cyKrw.totalReserves(); // 911312 krw
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([cyKrwAddress]);

    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance2).to.eq(0);

    const krw = new ethers.Contract(krwAddress, erc20Abi, provider);
    expect(await krw.balanceOf(manualBurner)).to.gt(toWei('200')); // 464 krw
  });

  it('susd with blocked', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await expect(reserveManager.connect(root).dispatchMultiple([cySusdAddress])).to.revertedWith('market is blocked from reserves sharing');
  });
});

async function setUp(reserveManager, cTokenAdmin, creamMultisig) {
  const creamMultisigAddress = await creamMultisig.getAddress();

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [creamMultisigAddress]
  });

  // Set the reserve amanger.
  await cTokenAdmin.connect(creamMultisig).setReserveManager(reserveManager.address);

  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [creamMultisigAddress]
  });
}

async function addReserves(cToken, underlyingAddress, donatorAddress, amount) {
  const donator = ethers.provider.getSigner(donatorAddress);
  const underlying = new ethers.Contract(underlyingAddress, erc20Abi, donator);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [donatorAddress]
  });

  await underlying.connect(donator).approve(cToken.address, amount);
  await cToken.connect(donator)._addReserves(amount);

  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [donatorAddress]
  });
}
