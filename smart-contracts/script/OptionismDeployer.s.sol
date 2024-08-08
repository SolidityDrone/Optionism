// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import "../src/Optionism.sol";
import "../src/MockUSDC.sol";

contract CounterScript is Script {
    MockUSDC usdc;
    Optionism op;

    address pyth_sepolia = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
    address gelatoSender = address(0); // temporary
    function setUp() public {}

    function run() public {
        vm.broadcast();
        usdc = new MockUSDC();
        vm.broadcast();
        op = new Optionism(gelatoSender, pyth_sepolia, address(usdc));
    }
}
