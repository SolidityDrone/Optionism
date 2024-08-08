// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    
    constructor()ERC20("MockUsdc", "USDC"){
        _mint(msg.sender, 1e18);
    }
    
    function mintFixedAmount() public {
        _mint(msg.sender, 1e18);
    }

}
    
    

