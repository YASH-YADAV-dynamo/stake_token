import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const STAKING_ABI = [
  "function stake(uint256 amount) returns (bool)",
  "function withdraw(uint256 amount) returns (bool)",
  "function getStakedBalance(address account) view returns (uint256)"
];

let TOKEN_ADDRESS, STAKING_ADDRESS, NETWORK_ID;

try {
  TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS;
  STAKING_ADDRESS = process.env.REACT_APP_STAKING_ADDRESS;
  NETWORK_ID = process.env.REACT_APP_NETWORK_ID;

  if (!TOKEN_ADDRESS || !STAKING_ADDRESS || !NETWORK_ID) {
    throw new Error("Missing environment variables");
  }
} catch (error) {
  console.error("Error loading environment variables:", error);
}

export default function TokenStaking() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (!TOKEN_ADDRESS || !STAKING_ADDRESS || !NETWORK_ID) {
        setError("Missing environment variables. Please check your .env file.");
        return;
      }

      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          
          if (network.chainId.toString() !== NETWORK_ID) {
            setError(`Please connect to the correct network. Expected network ID: ${NETWORK_ID}`);
            return;
          }

          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
          const stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);

          setProvider(provider);
          setSigner(signer);
          setAddress(address);
          setTokenContract(tokenContract);
          setStakingContract(stakingContract);
          setIsConnected(true);

          const balance = await tokenContract.balanceOf(address);
          const stakedBalance = await stakingContract.getStakedBalance(address);
          setBalance(ethers.formatEther(balance));
          setStakedBalance(ethers.formatEther(stakedBalance));
        } catch (error) {
          console.error("Failed to connect", error);
          setError("Failed to connect. Please check your wallet and try again.");
        }
      } else {
        setError("No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.");
      }
    };

    init();
  }, []);

  const handleStake = async () => {
    if (!amount || !tokenContract || !stakingContract) return;
    try {
      const amountWei = ethers.parseEther(amount);
      const allowance = await tokenContract.allowance(address, STAKING_ADDRESS);
      if (allowance < amountWei) {
        const approveTx = await tokenContract.approve(STAKING_ADDRESS, amountWei);
        await approveTx.wait();
      }
      const stakeTx = await stakingContract.stake(amountWei);
      await stakeTx.wait();
      alert("Staking successful!");
      // Refresh balances
      const newBalance = await tokenContract.balanceOf(address);
      const newStakedBalance = await stakingContract.getStakedBalance(address);
      setBalance(ethers.formatEther(newBalance));
      setStakedBalance(ethers.formatEther(newStakedBalance));
    } catch (error) {
      console.error("Staking failed", error);
      setError("Staking failed. Please check your balance and try again.");
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !stakingContract) return;
    try {
      const amountWei = ethers.parseEther(amount);
      const withdrawTx = await stakingContract.withdraw(amountWei);
      await withdrawTx.wait();
      alert("Withdrawal successful!");
      // Refresh balances
      const newBalance = await tokenContract.balanceOf(address);
      const newStakedBalance = await stakingContract.getStakedBalance(address);
      setBalance(ethers.formatEther(newBalance));
      setStakedBalance(ethers.formatEther(newStakedBalance));
    } catch (error) {
      console.error("Withdrawal failed", error);
      setError("Withdrawal failed. Please check your staked balance and try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Token Staking</h2>
      <div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {isConnected ? (
          <>
            <p className="mb-2">
              <span className="font-semibold">Address:</span> {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Token Balance:</span> {parseFloat(balance).toFixed(4)}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Staked Balance:</span> {parseFloat(stakedBalance).toFixed(4)}
            </p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="flex justify-between">
              <button onClick={handleStake} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Stake
              </button>
              <button onClick={handleWithdraw} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Withdraw
              </button>
            </div>
          </>
        ) : (
          <p>Please connect your wallet to use this dApp.</p>
        )}
      </div>
    </div>
  );
}