const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('ReserveManager', () => {
  const toWei = ethers.utils.parseEther;

  let accounts;
  let owner, ownerAddress;
  let user, userAddress;

  let usdcBurner;
  let burner;
  let comptroller;
  let reserveManager;
  let underlying;
  let cTokenAdmin;
  let cToken;
  let cEth;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[1];
    ownerAddress = await owner.getAddress();
    user = accounts[2];
    userAddress = await user.getAddress();

    const burnerFactory = await ethers.getContractFactory("MockBurner");
    const comptrollerFactory = await ethers.getContractFactory("MockComptroller");
    const reserveManagerFactory = await ethers.getContractFactory("ReserveManager");
    const tokenFactory = await ethers.getContractFactory("MockToken");
    const cTokenAdminFactory = await ethers.getContractFactory("MockCTokenAdmin");
    const cTokenFactory = await ethers.getContractFactory("MockCToken");
    const cEthFactory = await ethers.getContractFactory("MockCEth");

    usdcBurner = await burnerFactory.deploy();
    burner = await burnerFactory.deploy();
    comptroller = await comptrollerFactory.deploy();
    reserveManager = await reserveManagerFactory.deploy(ownerAddress, comptroller.address, usdcBurner.address);
    underlying = await tokenFactory.deploy();
    cTokenAdmin = await cTokenAdminFactory.deploy();
    cToken = await cTokenFactory.deploy(cTokenAdmin.address, underlying.address);
    cEth = await cEthFactory.deploy(cTokenAdmin.address);
  });

  describe('setCTokenAdmins', async () => {
    beforeEach(async () => {
      await Promise.all([
        comptroller.setmarketListed(cToken.address, true),
        comptroller.setmarketListed(cEth.address, true)
      ]);
    });

    it('sets cToken admin successfully', async () => {
      await reserveManager.connect(owner).setCTokenAdmins([cToken.address, cEth.address], [cTokenAdmin.address, cTokenAdmin.address]);
      expect(await reserveManager.cTokenAdmins(cToken.address)).to.eq(cTokenAdmin.address);
      expect(await reserveManager.cTokenAdmins(cEth.address)).to.eq(cTokenAdmin.address);
    });

    it('failed to set cToken admin for non-owner', async () => {
      await expect(reserveManager.setCTokenAdmins([cToken.address, cEth.address], [cTokenAdmin.address, cTokenAdmin.address])).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('failed to set cToken admin for invalid data', async () => {
      await expect(reserveManager.connect(owner).setCTokenAdmins([cToken.address], [cTokenAdmin.address, cTokenAdmin.address])).to.be.revertedWith('invalid data');
    });

    it('failed to set cToken admin for market not listed', async () => {
      await comptroller.setmarketListed(cToken.address, false);
      await expect(reserveManager.connect(owner).setCTokenAdmins([cToken.address], [cTokenAdmin.address])).to.be.revertedWith('market not listed');
    });

    it('failed to set cToken admin for mismatch admin', async () => {
      await expect(reserveManager.connect(owner).setCTokenAdmins([cToken.address], [userAddress])).to.be.revertedWith('mismatch admin');
    });
  });

  describe('setBurners', async () => {
    it('sets burner successfully', async () => {
      await reserveManager.connect(owner).setBurners([cToken.address, cEth.address], [burner.address, burner.address]);
      expect(await reserveManager.burners(cToken.address)).to.eq(burner.address);
      expect(await reserveManager.burners(cEth.address)).to.eq(burner.address);
    });

    it('failed to set burner for non-owner', async () => {
      await expect(reserveManager.setBurners([cToken.address, cEth.address], [burner.address, burner.address])).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('failed to set burner for invalid data', async () => {
      await expect(reserveManager.connect(owner).setBurners([cToken.address], [burner.address, burner.address])).to.be.revertedWith('invalid data');
    });
  });

  describe('adjustRatio', async () => {
    const newRatio = toWei('0.6');

    it('adjusts ratio successfully', async () => {
      expect(await reserveManager.ratio()).to.eq(toWei('0.5'));
      await reserveManager.connect(owner).adjustRatio(newRatio);
      expect(await reserveManager.ratio()).to.eq(newRatio);
    });

    it('failed to adjust ratio for non-owner', async () => {
      await expect(reserveManager.adjustRatio(newRatio)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('failed to adjust ratio for invalid ratio', async () => {
      const invalidRatio = toWei('1.1');
      await expect(reserveManager.connect(owner).adjustRatio(invalidRatio)).to.be.revertedWith('invalid ratio');
    });
  });
});
