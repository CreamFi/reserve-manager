const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const cTokenAbi = require("../abi/cToken");
const cTokenAdminAbi = require("../abi/cTokenAdmin");
const erc20Abi = require("../abi/erc20");
const burnerAbi = require("../abi/burner");
const reserveManagerAbi = require("../abi/reserveManager");

describe('integration', () => {
  const toWei = ethers.utils.parseEther;
  const provider = waffle.provider;

  const creamMultisigAddress = '0x6D5a7597896A703Fe8c85775B23395a48f971305';
  const cTokenAdminAddress = '0x3FaE5e5722C51cdb5B0afD8c7082e8a6AF336Ee8';
  const feeDistributorAddress = '0x0Ca0f068edad122f09a39f99E7E89E705d6f6Ace';
  const reserveManagerAddress = '0x0C5Bf19618A8FCDdb132d82BC6c5ea736A1beAED';

  // tokens
  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const xSushiAddress = '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272';
  const vVspAddress = '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc';
  const yvCurveSEthAddress = '0x986b4AFF588a109c09B50A03f42E4110E29D353F';
  const yvWethAddress = '0xa9fE4601811213c340e850ea305481afF02f5b28';
  const uniV2DaiEthAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
  const yCrvAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const sushiAddress = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2';
  const vspAddress = '0x1b40183efb4dd766f11bda7a7c3ad8982e998421';
  const eCrvAddress = '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c';
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
  const fttAddress = '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9';
  const swagAddress = '0x87edffde3e14c7a66c9b9724747a1c5696b742e6';
  const yvCurveIBAddresss = '0x27b7b1ad7288079A66d12350c828D3C00A6F07d7'; // the destination token

  // burners
  const yearnVaultBurnerCurveLP = '0x4367751C896eA01Ee7bc3683f1C2336De6238Ad4';
  const yearnVaultBurnerUniswap = '0xb3c68d69E95B095ab4b33B4cB67dBc0fbF3Edf56';
  const curveLPBurner = '0xD96877ce3771c0504F0643A98F7646CE2226543f';
  const xSushiBurner = '0x7ea7174dD0CB4Ab84f42177F01e9a8a79475d381';
  const vVspBurner = '0xd4409B8D17d5d49a7ed9Ae734B0E8EdBa29b9FFA';
  const uniswapLPBurner = '0x9B21EB2E30D8320c3c1b8d8465284D78E58cB971';
  const uniswapBurner = '0xfBbfa5fd64246046e683c423aa2AB0470fbD328D';
  const usdcBurner = '0x4486835e0C567A320C0636d8F6e6e6679A46a271';
  const manualBurner = '0x4e6b6b9606B4E45C19Dd27D58b2CF3B66B2a8579';

  // cTokens
  const crEthAddress = '0xD06527D5e56A3495252A528C4987003b712860eE'; // uniswapBurner
  const crCrvAddress = '0xc7Fd8Dcee4697ceef5a2fd4608a7BD6A94C77480'; // uniswapBurner
  const crUsdcAddress = '0x44fbebd2f576670a6c33f6fc0b00aa8c5753b322'; // usdcBurner
  const crXsushiAddress = '0x228619CCa194Fbe3Ebeb2f835eC1eA5080DaFbb2'; // xSushiBurner
  const crVvspAddress = '0x1A122348B73B58eA39F822A89e6ec67950c2bBD0'; // vvspBurner
  const crYvCurveSEthAddress = '0x6d1B9e01aF17Dd08d6DEc08E210dfD5984FF1C20'; // yearnVaultBurnerCurveLP
  const crYvwethAddress = '0x4202D97E00B9189936EdF37f8D01cfF88BDd81d4'; // yearnVaultBurnerUniswap
  const crUniV2DaiEthAddress = '0xcD22C4110c12AC41aCEfA0091c432ef44efaAFA0'; // uniswapLPBurner
  const crYcrvAddress = '0x9baF8a5236d44AC410c0186Fe39178d5AAD0Bb87'; // curveLPBurner
  const crUsdtAddress = '0x797aab1ce7c01eb727ab980762ba88e7133d2157'; // uniswapBurner
  const crFttAddress = '0x10FDBD1e48eE2fD9336a482D746138AE19e649Db'; // manualBurner
  const crSwagAddress = '0x22B243B96495C547598D9042B6f94B01C22B2e9E'; // blocked

  let accounts;
  let root, rootAddress;
  let owner, ownerAddress;
  let user, userAddress;

  let creamMultisig;

  let reserveManager;

  let crEth;
  let crCrv;
  let crUsdc;
  let crXsushi;
  let crVvsp;
  let crYvCurveSEth;
  let crYvweth;
  let crUniV2DaiEth;
  let crYcrv;
  let crUsdt;
  let crFtt;
  let crSwag;
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

    crEth = new ethers.Contract(crEthAddress, cTokenAbi, provider);
    crCrv = new ethers.Contract(crCrvAddress, cTokenAbi, provider);
    crUsdc = new ethers.Contract(crUsdcAddress, cTokenAbi, provider);
    crXsushi = new ethers.Contract(crXsushiAddress, cTokenAbi, provider);
    crVvsp = new ethers.Contract(crVvspAddress, cTokenAbi, provider);
    crYvCurveSEth = new ethers.Contract(crYvCurveSEthAddress, cTokenAbi, provider);
    crYvweth = new ethers.Contract(crYvwethAddress, cTokenAbi, provider);
    crUniV2DaiEth = new ethers.Contract(crUniV2DaiEthAddress, cTokenAbi, provider);
    crYcrv = new ethers.Contract(crYcrvAddress, cTokenAbi, provider);
    crUsdt = new ethers.Contract(crUsdtAddress, cTokenAbi, provider);
    crFtt = new ethers.Contract(crFttAddress, cTokenAbi, provider);
    crSwag = new ethers.Contract(crSwagAddress, cTokenAbi, provider);
    cTokenAdmin = new ethers.Contract(cTokenAdminAddress, cTokenAdminAbi, provider);
    yvCurveIB = new ethers.Contract(yvCurveIBAddresss, erc20Abi, provider);
    reserveManager = new ethers.Contract(reserveManagerAddress, reserveManagerAbi, provider);
  });

  it('eth with uniswap burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crEthAddress]);

    const totalReserves1 = await crEth.totalReserves(); // 3.05 ETH
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crEth.connect(root).accrueInterest();

    const totalReserves2 = await crEth.totalReserves(); // 3.08 ETH
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crEthAddress]);

    /**
     * ETH price: $3300
     * ETH reserves: +0.038 ETH ($120)
     * Dispatch value: $60 (120 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 57.94 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('crv with uniswap burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crCrvAddress]);

    const totalReserves1 = await crCrv.totalReserves(); // 7770.09 CRV
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crCrv.connect(root).accrueInterest();

    const totalReserves2 = await crCrv.totalReserves(); // 7815.08 CRV
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crCrvAddress]);

    /**
     * CRV price: $2.26
     * CRV reserves: +44.9 CRV ($100)
     * Dispatch value: $50 (100 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 46.11 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('usdt (non-stadrard) with uniswap burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crUsdtAddress]);

    const totalReserves1 = await crUsdt.totalReserves(); // 23667 usdt
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crUsdt.connect(root).accrueInterest();

    const totalReserves2 = await crUsdt.totalReserves(); // 25339 usdt
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crUsdtAddress]);

    /**
     * usdt price: $1
     * usdt reserves: +1672 usdt ($1672)
     * Dispatch value: $830 (1672 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 759 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('usdc with usdc burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crUsdcAddress]);

    const totalReserves1 = await crUsdc.totalReserves(); // 15406 USDC
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crUsdc.connect(root).accrueInterest();

    const totalReserves2 = await crUsdc.totalReserves(); // 16219 USDC
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crUsdcAddress]);

    /**
     * USDC price: $1
     * USDC reserves: +800 USDC ($813)
     * Dispatch value: $400 (800 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 372 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('xSushi with xSushi burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crXsushiAddress]);

    const totalReserves1 = await crXsushi.totalReserves(); // 62.43 xSUSHI
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crXsushi is too less. Add reserves manually.
    const xSushiWhaleAddress = '0x58f5F0684C381fCFC203D77B2BbA468eBb29B098';
    const addAmount = toWei('70');
    await addReserves(crXsushi, xSushiAddress, xSushiWhaleAddress, addAmount);

    const totalReserves2 = await crXsushi.totalReserves(); // 132.46 xSUSHI
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crXsushiAddress]);

    // xSushi will be converted to SUSHI and stay in the uniswap burner.
    // Also, after the first burn, SUSHI will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(sushiAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * xSUSHI price: $15
     * xSUSHI reserves: +70 xSUSHI ($1000)
     * Dispatch value: $500 (1000 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 472.84 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('vVsp with vVsp burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crVvspAddress]);

    const totalReserves1 = await crVvsp.totalReserves(); // 0.348 vVSP
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crVvsp is too less. Add reserves manually.
    const vVspWhaleAddress = '0x1Beae6AD0F5974D630828164200D4E2d1ce7162a';
    const addAmount = toWei('70');
    await addReserves(crVvsp, vVspAddress, vVspWhaleAddress, addAmount);

    const totalReserves2 = await crVvsp.totalReserves(); // 70.377 vVSP
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crVvspAddress]);

    // vVsp will be converted to VSP and stay in the uniswap burner.
    // Also, after the first burn, VSP will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(vspAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * vVSP price: $10.8
     * vVSP reserves: +70 vVSP ($750)
     * Dispatch value: $370 (750 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 359.76 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('yvCurve-sEth with yearnVault burner (CurveLP)', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crYvCurveSEthAddress]);

    const totalReserves1 = await crYvCurveSEth.totalReserves(); // 0 yvCurve-sEth
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crYvCurveSEth is too less. Add reserves manually.
    const yvCurveSEthWhaleAddress = '0x577eBC5De943e35cdf9ECb5BbE1f7D7CB6c7C647';
    const addAmount = toWei('0.1');
    await addReserves(crYvCurveSEth, yvCurveSEthAddress, yvCurveSEthWhaleAddress, addAmount);

    const totalReserves2 = await crYvCurveSEth.totalReserves(); // 0.1 yvCurve-sEth
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crYvCurveSEthAddress]);

    // yvCurve-sEth will be converted to eCrv and stay in the curveLP burner.
    // Also, after the first burn, eCrv will be converted to WETH and sent to the uniswap burner.
    // After the second burn, WETH will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(curveLPBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner3 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(eCrvAddress);
    await burner2.connect(root).burn(wethAddress);
    await burner3.connect(root).burn(usdcAddress);

    /**
     * yvCurve-sEth price: $5000
     * yvCurve-sEth reserves: +0.1 yvCurve-sEth ($500)
     * Dispatch value: $250 (500 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 289.53 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('yvWeth with yearnVault burner (Uniswap)', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crYvwethAddress]);

    const totalReserves1 = await crYvweth.totalReserves(); // 0 yvWeth
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crYvweth is too less. Add reserves manually.
    const yvWethWhaleAddress = '0x82Fa07Dad4FAF514d4C0fc6dbAFdE8882cB27A32';
    const addAmount = toWei('0.2');
    await addReserves(crYvweth, yvWethAddress, yvWethWhaleAddress, addAmount);

    const totalReserves2 = await crYvweth.totalReserves(); // 0.2 yWeth
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crYvwethAddress]);

    // yWeth will be converted to WETH and stay in the uniswap burner.
    // Also, after the first burn, WETH will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(wethAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * yWeth price: $3300
     * yWeth reserves: +0.2 yWeth ($660)
     * Dispatch value: $330 (660 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 383.31 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('uni-v2-dai-eth with uniswap LP burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crUniV2DaiEthAddress]);

    const totalReserves1 = await crUniV2DaiEth.totalReserves(); // 1.37 uni-v2-dai-eth
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crUniV2DaiEth is too less. Add reserves manually.
    const uniV2DaiEthWhaleAddress = '0x3FE085C03D54E8212Cb81A6A11Fdf84FF0A8bff6';
    const addAmount = toWei('4');
    await addReserves(crUniV2DaiEth, uniV2DaiEthAddress, uniV2DaiEthWhaleAddress, addAmount);

    const totalReserves2 = await crUniV2DaiEth.totalReserves(); // 5.41 uni-v2-dai-eth
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crUniV2DaiEthAddress]);

    // uni-v2-dai-eth will be converted to DAI and WETH and stay in the uniswap burner.
    // Also, after the first burn, DAI and WETH will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(wethAddress);
    await burner1.connect(root).burn(daiAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * uni-v2-dai-eth price: $170
     * uni-v2-dai-eth reserves: +4 uni-v2-dai-eth ($700)
     * Dispatch value: $350 (700 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 322.15 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('yCrv with curve LP burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crYcrvAddress]);

    const totalReserves1 = await crYcrv.totalReserves(); // 963.262 yCrv
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crYcrv is too less. Add reserves manually.
    const yCrvWhaleAddress = '0x77D3C47876e45123C2837Ba68720378Af00a2C0A';
    const addAmount = toWei('600');
    await addReserves(crYcrv, yCrvAddress, yCrvWhaleAddress, addAmount);

    const totalReserves2 = await crYcrv.totalReserves(); // 1566.853 yCrv
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crYcrvAddress]);

    // yCrv will be converted to DAI and stay in the uniswap burner.
    // Also, after the first burn, DAI will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(daiAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * yCrv price: $1.1
     * yCrv reserves: +600 yCrv ($660)
     * Dispatch value: $330 (660 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 307 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('ftt with manual burner', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await reserveManager.connect(root).dispatchMultiple([crFttAddress]);

    const totalReserves1 = await crFtt.totalReserves(); // 1233 ftt
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Add reserves manually.
    const fttWhaleAddress = '0x772589e99bC9C54DD40acb7d73F88Ccbc9D9CF47';
    const addAmount = toWei('10');
    await addReserves(crFtt, fttAddress, fttWhaleAddress, addAmount);

    const totalReserves2 = await crFtt.totalReserves(); // 1250 ftt
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.connect(root).dispatchMultiple([crFttAddress]);

    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance2).to.eq(0);

    const ftt = new ethers.Contract(fttAddress, erc20Abi, provider);
    expect(await ftt.balanceOf(manualBurner)).to.gt(toWei('8')); // 8.5 ftt
  });

  it('swag with blocked', async () => {
    await setUp(reserveManager, cTokenAdmin, creamMultisig);
    await expect(reserveManager.connect(root).dispatchMultiple([crSwagAddress])).to.revertedWith('market is blocked from reserves sharing');
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
