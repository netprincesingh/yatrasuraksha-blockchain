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


  it("Should return a unique Digital ID for a registered hash", async function () {
    // 1. INPUT -> Prepare a hash digest
    const dataHash = ethers.encodeBytes32String("test-for-digital-id");

    // 2. ACTION -> Register the tourist (this is done in the beforeEach for other tests,
    // but here we do it explicitly to get the transaction result)
    await touristRegistry.connect(owner).registerTourist(dataHash);

    // 3. OUTPUT -> Call the getter function to retrieve the Digital ID
    // Note: Assuming your contract has a function like `getDigitalId(bytes32)`
    const digitalId = await touristRegistry.getDigitalId(dataHash);
    console.log("      ✨ Generated Digital ID:", digitalId.toString());
    // 4. VERIFY -> Check if the first registered tourist gets ID 1
    expect(digitalId).to.equal(1);
  });

  
});
