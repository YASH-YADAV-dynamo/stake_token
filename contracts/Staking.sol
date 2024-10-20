pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    IERC20 public stakingToken;
    mapping(address => uint256) public stakedBalance;

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Cannot withdraw 0");
        require(stakedBalance[msg.sender] >= amount, "Not enough staked");
        stakedBalance[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
    }
}