require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MyToken if it's not already deployed
  let myTokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
  if (!myTokenAddress) {
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy("1000000000000000000000000"); // 1 million tokens
    await myToken.waitForDeployment();
    myTokenAddress = await myToken.getAddress();
    console.log("MyToken deployed to:", myTokenAddress);
  } else {
    console.log("Using existing MyToken at:", myTokenAddress);
  }

  let stakingAddress = process.env.REACT_APP_STAKING_ADDRESS;
  if (!stakingAddress) {
    const Staking = await hre.ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(myTokenAddress);
    await staking.waitForDeployment();
    stakingAddress = await staking.getAddress();
    console.log("Staking contract deployed to:", stakingAddress);
  } else {
    console.log("Using existing Staking contract at:", stakingAddress);
  }

  // Deploy Airdrop
  const Airdrop = await hre.ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(myTokenAddress);
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  console.log("Airdrop contract deployed to:", airdropAddress);

  // Transfer tokens to the contracts if they're newly deployed
  const myToken = await hre.ethers.getContractAt("MyToken", myTokenAddress);
  
  if (!process.env.REACT_APP_STAKING_ADDRESS) {
    const stakingTransferAmount = hre.ethers.parseEther("1000"); // 1000 tokens
    await myToken.transfer(stakingAddress, stakingTransferAmount);
    console.log(`Transferred ${stakingTransferAmount} tokens to the Staking contract`);
  }

  const airdropTransferAmount = hre.ethers.parseEther("1000"); // 1000 tokens airdropping
  await myToken.transfer(airdropAddress, airdropTransferAmount);
  console.log(`Transferred ${airdropTransferAmount} tokens to the Airdrop contract`);

  console.log("Deployment completed!");

  // Log all contract addresses for easy reference
  console.log("\nContract Addresses:");
  console.log("--------------------");
  console.log("MyToken:", myTokenAddress);
  console.log("Staking:", stakingAddress);
  console.log("Airdrop:", airdropAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });