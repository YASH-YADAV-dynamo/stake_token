import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AirdropABI from '../contracts/Airdrop.json';
import TokenABI from '../contracts/MyToken.json';

const Airdrop = () => {
    const [airdropContract, setAirdropContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [account, setAccount] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [pendingAddresses, setPendingAddresses] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setAccount(address);

                    const airdropAddress = process.env.REACT_APP_AIRDROP_ADDRESS;
                    const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;

                    const airdropContract = new ethers.Contract(airdropAddress, AirdropABI.abi, signer);
                    const tokenContract = new ethers.Contract(tokenAddress, TokenABI.abi, signer);

                    setAirdropContract(airdropContract);
                    setTokenContract(tokenContract);

                    // Check if the connected account is the admin
                    const adminAddress = await airdropContract.owner();
                    setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase());

                } else {
                    setError('Please install MetaMask to use this dApp');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to initialize. Please check your network connection and try again.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ethers.utils.isAddress(userAddress)) {
            try {
                const hasReceived = await airdropContract.hasReceived(userAddress);
                if (!hasReceived) {
                    setPendingAddresses([...pendingAddresses, userAddress]);
                    setUserAddress('');
                } else {
                    setError('This address has already received the airdrop.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to check address. Please try again.');
            }
        } else {
            setError('Invalid Ethereum address');
        }
    };

    const performAirdrop = async () => {
        if (!isAdmin) {
            setError('Only admin can perform airdrops');
            return;
        }
        setLoading(true);
        try {
            for (let address of pendingAddresses) {
                const tx = await airdropContract.airdrop(address);
                await tx.wait();
            }
            setPendingAddresses([]);
            alert('Airdrop completed successfully!');
        } catch (err) {
            console.error(err);
            setError('Failed to perform airdrop. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">HTK Token Airdrop</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                            Ethereum Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="address"
                            type="text"
                            placeholder="0x..."
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                        />
                    </div>
                    <button
                        className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Submit Address
                    </button>
                </form>
                {isAdmin && (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Pending Addresses: {pendingAddresses.length}</h2>
                        <button
                            onClick={performAirdrop}
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={pendingAddresses.length === 0 || loading}
                        >
                            {loading ? 'Processing...' : 'Perform Airdrop'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Airdrop;