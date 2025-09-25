import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const touristRegistry = await ethers.deployContract("TouristRegistry", [deployer.address]);

  await touristRegistry.waitForDeployment();

  console.log(
    `TouristRegistry contract deployed to ${touristRegistry.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});