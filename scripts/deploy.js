const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MyToken
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy("1000000000000000000000000"); // 1 million tokens
  await myToken.waitForDeployment();

  console.log("MyToken deployed to:", await myToken.getAddress());

  // Deploy Staking
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await myToken.getAddress());
  await staking.waitForDeployment();

  console.log("Staking contract deployed to:", await staking.getAddress());

  // Optional: Transfer some tokens to the Staking contract
  const transferAmount = "100000000000000000000000"; // 100,000 tokens
  await myToken.transfer(await staking.getAddress(), transferAmount);
  console.log(`Transferred ${transferAmount} tokens to the Staking contract`);

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });