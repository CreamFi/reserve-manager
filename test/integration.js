const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const cTokenAbi = require("../abi/cToken");
const cTokenAdminAbi = require("../abi/cTokenAdmin");
const erc20Abi = require("../abi/erc20");
const burnerAbi = require("../abi/burner");

describe.skip('integration', () => {
  const toWei = ethers.utils.parseEther;
  const provider = waffle.provider;

  const comptrollerAddress = '0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258';
  const creamMultisigAddress = '0x6D5a7597896A703Fe8c85775B23395a48f971305';
  const creamDeployerAddress = '0x197939c1ca20c2b506d6811d8b6cdb3394471074';
  const cTokenAdminAddress = '0x139Dd8Bb6355d20342e08ff013150b1aE5040a42';
  const feeDistributorAddress = '0x0Ca0f068edad122f09a39f99E7E89E705d6f6Ace';

  // tokens
  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const xSushiAddress = '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272';
  const vVspAddress = '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc';
  const yvCurveSEthAddress = '0x986b4AFF588a109c09B50A03f42E4110E29D353F';
  const yWethAddress = '0xe1237aa7f535b0cc33fd973d66cbf830354d16c7';
  const uniV2DaiEthAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
  const yCrvAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const sushiAddress = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2';
  const vspAddress = '0x1b40183efb4dd766f11bda7a7c3ad8982e998421';
  const eCrvAddress = '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c';
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const yvCurveIBAddresss = '0x27b7b1ad7288079A66d12350c828D3C00A6F07d7'; // the destination token

  // burners
  const yearnVaultBurnerCurveLP = '0x5b4058A9000e86fe136Ac896352C4DFD539E32a1';
  const yearnVaultBurnerUniswap = '0xf976C9bc0E16B250E0B1523CffAa9E4c07Bc5C8a';
  const curveLPBurner = '0x73CF8c5D14Aa0EbC89f18272A568319F5BAB6cBD';
  const xSushiBurner = '0x06288754f31d100039b21e62a429e4B81E56B626';
  const vVspBurner = '0x379555965fcdbA7A40e8B5b5eF4786f51ADeeF31';
  const uniswapLPBurner = '0x98d6AFDA3A488bB8B080c66009326466e986D583';
  const uniswapBurner = '0x79EA17bEE0a8dcb900737E8CAa247c8358A5dfa1';
  const usdcBurner = '0x0980f2F0D2af35eF2c4521b2342D59db575303F7';

  // cTokens
  const crEthAddress = '0xD06527D5e56A3495252A528C4987003b712860eE'; // uniswapBurner
  const crCrvAddress = '0xc7Fd8Dcee4697ceef5a2fd4608a7BD6A94C77480'; // uniswapBurner
  const crUsdcAddress = '0x44fbebd2f576670a6c33f6fc0b00aa8c5753b322'; // usdcBurner
  const crXsushiAddress = '0x228619CCa194Fbe3Ebeb2f835eC1eA5080DaFbb2'; // xSushiBurner
  const crVvspAddress = '0x1A122348B73B58eA39F822A89e6ec67950c2bBD0'; // vvspBurner
  const crYvCurveSEthAddress = '0x6d1B9e01aF17Dd08d6DEc08E210dfD5984FF1C20'; // yearnVaultBurnerCurveLP
  const crYwethAddress = '0x01da76dea59703578040012357b81ffe62015c2d'; // yearnVaultBurnerUniswap
  const crUniV2DaiEthAddress = '0xcD22C4110c12AC41aCEfA0091c432ef44efaAFA0'; // uniswapLPBurner
  const crYcrvAddress = '0x9baF8a5236d44AC410c0186Fe39178d5AAD0Bb87'; // curveLPBurner

  let accounts;
  let root, rootAddress;
  let owner, ownerAddress;
  let user, userAddress;

  let creamMultisig;
  let creamDeployer;

  let reserveManager;

  let crEth;
  let crCrv;
  let crUsdc;
  let crXsushi;
  let crVvsp;
  let crYvCurveSEth;
  let crYweth;
  let crUniV2DaiEth;
  let crYcrv;
  let cTokenAdmin;

  let yvCurveIB;

  beforeEach(async () => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [{
        forking: {
          jsonRpcUrl: "https://mainnet-eth.compound.finance",
          blockNumber: 12944220
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
    creamDeployer = ethers.provider.getSigner(creamDeployerAddress);

    const reserveManagerFactory = await ethers.getContractFactory("ReserveManager");

    reserveManager = await reserveManagerFactory.deploy(rootAddress, comptrollerAddress, usdcBurner, wethAddress, usdcAddress);

    crEth = new ethers.Contract(crEthAddress, cTokenAbi, provider);
    crCrv = new ethers.Contract(crCrvAddress, cTokenAbi, provider);
    crUsdc = new ethers.Contract(crUsdcAddress, cTokenAbi, provider);
    crXsushi = new ethers.Contract(crXsushiAddress, cTokenAbi, provider);
    crVvsp = new ethers.Contract(crVvspAddress, cTokenAbi, provider);
    crYvCurveSEth = new ethers.Contract(crYvCurveSEthAddress, cTokenAbi, provider);
    crYweth = new ethers.Contract(crYwethAddress, cTokenAbi, provider);
    crUniV2DaiEth = new ethers.Contract(crUniV2DaiEthAddress, cTokenAbi, provider);
    crYcrv = new ethers.Contract(crYcrvAddress, cTokenAbi, provider);
    cTokenAdmin = new ethers.Contract(cTokenAdminAddress, cTokenAdminAbi, provider);
    yvCurveIB = new ethers.Contract(yvCurveIBAddresss, erc20Abi, provider);
  });

  it('eth with uniswap burner', async () => {
    await setUp(reserveManager, crEth, cTokenAdmin, creamMultisig, creamDeployer, uniswapBurner);
    await reserveManager.dispatchMultiple([crEthAddress]);

    const totalReserves1 = await crEth.totalReserves(); // 13.437 ETH
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crEth.connect(root).accrueInterest();

    const totalReserves2 = await crEth.totalReserves(); // 13.488 ETH
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crEthAddress]);

    /**
     * ETH price: $2600
     * ETH reserves: +0.051 ETH ($130)
     * Dispatch value: $65 (130 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 59.597 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('crv with uniswap burner', async () => {
    await setUp(reserveManager, crCrv, cTokenAdmin, creamMultisig, creamDeployer, uniswapBurner);
    await reserveManager.dispatchMultiple([crCrvAddress]);

    const totalReserves1 = await crCrv.totalReserves(); // 7351.249 CRV
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crCrv.connect(root).accrueInterest();

    const totalReserves2 = await crCrv.totalReserves(); // 7423.943 CRV
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crCrvAddress]);

    /**
     * CRV price: $1.68
     * CRV reserves: +72.7 CRV ($122)
     * Dispatch value: $61 (122 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 55.017 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('usdc with usdc burner', async () => {
    await setUp(reserveManager, crUsdc, cTokenAdmin, creamMultisig, creamDeployer, usdcBurner);
    await reserveManager.dispatchMultiple([crUsdcAddress]);

    const totalReserves1 = await crUsdc.totalReserves(); // 40704 USDC
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // We mine multiple blocks and accrue interests to increase the reserves.
    for (let i = 0; i < 10000; i++) {
      await provider.send("evm_mine");
    }
    await crUsdc.connect(root).accrueInterest();

    const totalReserves2 = await crUsdc.totalReserves(); // 41400 USDC
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crUsdcAddress]);

    /**
     * USDC price: $1
     * USDC reserves: +696 USDC ($700)
     * Dispatch value: $350 (700 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 320.707 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('xSushi with xSushi burner', async () => {
    await setUp(reserveManager, crXsushi, cTokenAdmin, creamMultisig, creamDeployer, xSushiBurner);
    await reserveManager.dispatchMultiple([crXsushiAddress]);

    const totalReserves1 = await crXsushi.totalReserves(); // 60.818 xSUSHI
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crXsushi is too less. Add reserves manually.
    const xSushiWhaleAddress = '0x58f5F0684C381fCFC203D77B2BbA468eBb29B098';
    const addAmount = toWei('70');
    await addReserves(crXsushi, xSushiAddress, xSushiWhaleAddress, addAmount);

    const totalReserves2 = await crXsushi.totalReserves(); // 130.818 xSUSHI
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crXsushiAddress]);

    // xSushi will be converted to SUSHI and stay in the uniswap burner.
    // Also, after the first burn, SUSHI will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(sushiAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * xSUSHI price: $10
     * xSUSHI reserves: +70 xSUSHI ($700)
     * Dispatch value: $350 (700 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 317.889 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('vVsp with vVsp burner', async () => {
    await setUp(reserveManager, crVvsp, cTokenAdmin, creamMultisig, creamDeployer, vVspBurner);
    await reserveManager.dispatchMultiple([crVvspAddress]);

    const totalReserves1 = await crVvsp.totalReserves(); // 0.313 vVSP
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crVvsp is too less. Add reserves manually.
    const vVspWhaleAddress = '0x1Beae6AD0F5974D630828164200D4E2d1ce7162a';
    const addAmount = toWei('70');
    await addReserves(crVvsp, vVspAddress, vVspWhaleAddress, addAmount);

    const totalReserves2 = await crVvsp.totalReserves(); // 70.324 vVSP
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crVvspAddress]);

    // vVsp will be converted to VSP and stay in the uniswap burner.
    // Also, after the first burn, VSP will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(vspAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * vVSP price: $10.5
     * vVSP reserves: +70 vVSP ($735)
     * Dispatch value: $360 (735 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 343.134 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('yvCurve-sEth with yearnVault burner (CurveLP)', async () => {
    await setUp(reserveManager, crYvCurveSEth, cTokenAdmin, creamMultisig, creamDeployer, yearnVaultBurnerCurveLP);
    await reserveManager.dispatchMultiple([crYvCurveSEthAddress]);

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

    await reserveManager.dispatchMultiple([crYvCurveSEthAddress]);

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
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 225.9 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('yWeth with yearnVault burner (Uniswap)', async () => {
    await setUp(reserveManager, crYweth, cTokenAdmin, creamMultisig, creamDeployer, yearnVaultBurnerUniswap);
    await reserveManager.dispatchMultiple([crYwethAddress]);

    const totalReserves1 = await crYweth.totalReserves(); // 1.676 yWeth
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crYweth is too less. Add reserves manually.
    const yWethWhaleAddress = '0xf75200b7684A120fBa433145609112616749C082';
    const addAmount = toWei('0.25');
    await addReserves(crYweth, yWethAddress, yWethWhaleAddress, addAmount);

    const totalReserves2 = await crYweth.totalReserves(); // 1.947 yWeth
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crYwethAddress]);

    // yWeth will be converted to WETH and stay in the uniswap burner.
    // Also, after the first burn, WETH will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(wethAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * yWeth price: $2600
     * yWeth reserves: +0.25 yWeth ($650)
     * Dispatch value: $325 (650 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 323.236 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('uni-v2-dai-eth with uniswap LP burner', async () => {
    await setUp(reserveManager, crUniV2DaiEth, cTokenAdmin, creamMultisig, creamDeployer, uniswapLPBurner);
    await reserveManager.dispatchMultiple([crUniV2DaiEthAddress]);

    const totalReserves1 = await crUniV2DaiEth.totalReserves(); // 1.289 uni-v2-dai-eth
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crUniV2DaiEth is too less. Add reserves manually.
    const uniV2DaiEthWhaleAddress = '0x3FE085C03D54E8212Cb81A6A11Fdf84FF0A8bff6';
    const addAmount = toWei('4');
    await addReserves(crUniV2DaiEth, uniV2DaiEthAddress, uniV2DaiEthWhaleAddress, addAmount);

    const totalReserves2 = await crUniV2DaiEth.totalReserves(); // 5.34 uni-v2-dai-eth
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crUniV2DaiEthAddress]);

    // uni-v2-dai-eth will be converted to DAI and WETH and stay in the uniswap burner.
    // Also, after the first burn, DAI and WETH will be converted to USDC and sent to the usdc burner.
    const burner1 = new ethers.Contract(uniswapBurner, burnerAbi, provider);
    const burner2 = new ethers.Contract(usdcBurner, burnerAbi, provider);
    await burner1.connect(root).burn(wethAddress);
    await burner1.connect(root).burn(daiAddress);
    await burner2.connect(root).burn(usdcAddress);

    /**
     * uni-v2-dai-eth price: $150
     * uni-v2-dai-eth reserves: +4 uni-v2-dai-eth ($600)
     * Dispatch value: $300 (600 * 0.5)
     */
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 284.597 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });

  it('yCrv with curve LP burner', async () => {
    await setUp(reserveManager, crYcrv, cTokenAdmin, creamMultisig, creamDeployer, curveLPBurner);
    await reserveManager.dispatchMultiple([crYcrvAddress]);

    const totalReserves1 = await crYcrv.totalReserves(); // 963.262 yCrv
    const yvCurveIBBalance1 = await yvCurveIB.balanceOf(feeDistributorAddress);
    expect(yvCurveIBBalance1).to.eq(0);

    await provider.send("evm_increaseTime", [86500]); // leave some buffer (1 day == 86400 seconds)

    // Borrow demand in crYcrv is too less. Add reserves manually.
    const yCrvWhaleAddress = '0x77D3C47876e45123C2837Ba68720378Af00a2C0A';
    const addAmount = toWei('600');
    await addReserves(crYcrv, yCrvAddress, yCrvWhaleAddress, addAmount);

    const totalReserves2 = await crYcrv.totalReserves(); // 1564.842 yCrv
    expect(totalReserves2).to.gt(totalReserves1);

    await reserveManager.dispatchMultiple([crYcrvAddress]);

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
    const yvCurveIBBalance2 = await yvCurveIB.balanceOf(feeDistributorAddress); // 306.956 yvCurve-IB
    expect(yvCurveIBBalance2).to.gt(0);
  });
});

async function setUp(reserveManager, cToken, cTokenAdmin, creamMultisig, creamDeployer, burnerAddress) {
  const creamMultisigAddress = await creamMultisig.getAddress();
  const creamDeployerAddress = await creamDeployer.getAddress();

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [creamMultisigAddress]
  });

  // 1. Change cTokens admin to cTokenAdmin.
  await cToken.connect(creamMultisig)._setPendingAdmin(cTokenAdmin.address);

  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [creamMultisigAddress]
  });

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [creamDeployerAddress]
  });

  // 2. cTokenAdmin accepts the admin and sets the reserve amanger.
  await cTokenAdmin.connect(creamDeployer)._acceptAdmin(cToken.address);
  await cTokenAdmin.connect(creamDeployer).setReserveManager(reserveManager.address);

  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [creamDeployerAddress]
  });

  // 3. Setup reserve manager.
  await Promise.all([
    reserveManager.setCTokenAdmins([cToken.address], [cTokenAdmin.address]),
    reserveManager.setBurners([cToken.address], [burnerAddress])
  ]);
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
