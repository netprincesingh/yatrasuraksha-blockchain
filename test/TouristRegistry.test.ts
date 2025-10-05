import { expect } from "chai";
import { ethers } from "hardhat";
import { TouristRegistry } from "../typechain-types";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers.js";


describe("TouristRegistry Contract", function () {
  let touristRegistry: TouristRegistry;
  let owner: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();

    const touristRegistryFactory = await ethers.getContractFactory("TouristRegistry");
    touristRegistry = (await touristRegistryFactory.deploy(owner.address)) as TouristRegistry;
    await touristRegistry.waitForDeployment();
  });

  it("Should deploy successfully and set the right owner", async function () {
    expect(await touristRegistry.owner()).to.equal(owner.address);
  });

  it("Should allow the owner to register a new tourist hash", async function () {
    const dataHash = ethers.encodeBytes32String("sample-data-123");

    await expect(touristRegistry.connect(owner).registerTourist(dataHash))
      .to.emit(touristRegistry, "TouristRegistered")
      .withArgs(1, dataHash, owner.address);

    expect(await touristRegistry.isRegistered(dataHash)).to.be.true;
    expect(await touristRegistry.totalTourists()).to.equal(1);
  });

  it("Should revert if trying to register a duplicate hash", async function () {
    const dataHash = ethers.encodeBytes32String("duplicate-data");

    await touristRegistry.connect(owner).registerTourist(dataHash);

    await expect(
      touristRegistry.connect(owner).registerTourist(dataHash)
    ).to.be.revertedWith("Tourist data hash already registered.");
  });

  it("Should NOT allow a non-owner to register a hash", async function () {
    const dataHash = ethers.encodeBytes32String("some-other-data");

    await expect(
      touristRegistry.connect(otherAccount).registerTourist(dataHash)
    ).to.be.revertedWithCustomError(touristRegistry, "OwnableUnauthorizedAccount");
  });


  


});
