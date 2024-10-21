// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    IERC20 public token;
    uint256 public constant AIRDROP_AMOUNT = 1000 * 10**18; // 1000 tokens with 18 decimals
    mapping(address => bool) public hasReceived;

    event AirdropPerformed(address indexed recipient, uint256 amount);

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    function airdrop(address _recipient) external onlyOwner {
        require(!hasReceived[_recipient], "Address has already received the airdrop");
        require(token.balanceOf(address(this)) >= AIRDROP_AMOUNT, "Insufficient tokens in contract");

        hasReceived[_recipient] = true;
        require(token.transfer(_recipient, AIRDROP_AMOUNT), "Transfer failed");

        emit AirdropPerformed(_recipient, AIRDROP_AMOUNT);
    }

    function withdrawRemainingTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "Transfer failed");
    }
}