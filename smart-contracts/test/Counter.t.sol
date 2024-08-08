// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import "../src/Optionism.sol";
import "../src/MockUSDC.sol";
contract OptionismTest is Test {
    Optionism op;
    MockUSDC usdc;
    address pyth_sepolia = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
    address gelatoSender = address(0); // temporary
    function setUp() public {
        usdc = new MockUSDC();
        op = new Optionism(gelatoSender, pyth_sepolia, address(usdc));
        console.logAddress(address(usdc));
    }

    function testCall() public {
        vm.deal(address(op), 1e18);
        // Example calldata
        bytes memory data = hex"87385bbc000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000062b504e41550100000003b801000000040d00926a76798c2f5c3340b8c2f33be8bd75ce52f726476edece3b55dbb448e7c49a1df26d325ac41bb098b92a289b531a5a15cc44f5e4edfd1f1c14b95c9894343b0102022ce6d34add70f711a74a450ecde20d3aa427a41b5f2fab2f573f7264487f881b79059f3eae65e132f2f43b39bad1a1cf4fac52d6a9e8b10b88fe022610bd7300038fa7c2aae1954b57f1163c495ff22064d3726f22ac3bc11c825c060252a5eee1433d5716f93bbe3ea4e81f3e97a8a7d05b97fee4a4321ad2238acdf8d783ba0e01049dbe9ad4b57bbb6f854025d35c79d979f3f0576247cc9ee3d9c7f7b162a298597f83c8274ef744f1059aadb0dc50eabc2bacaabb4c45b5faedbafa012c67e8a60106a90d02e392dfa6a15c246b33fa143fa3457d5f74e5d3d4b319a8504c999b82b63b2558c75def2b6de2d7a496b90dd5d95f579cfbdd57891cb91469807bdb35390008e3c81a047e9311a8c412411bb963a46842240d5bb01876c1185aa6493107c8ed537515b0f0c4cf304e06d7240d1cdbb22646c95140f3fbb7ca5274d89182e7c1010a79ffbaf2403e730334c3949e4f46c4d5080d2ac6574bf94caeb26c20834f72ce6dfae6b292d6f1a8feca03960294e4981fcba7a6b9e3eaa45657198f4db361cf010cdb9e8a100f5ffe9401ec9016a2d648489e7c06659c9b971fc73208f40bcb538863b30b86c3726486452344dff9521ea18861e90a390e8873ef7863805a8d1d52000d918b3430f66a602bedec7df67a85a36a7d2ff09fd76beadcc409335da2cb2dd8718d143ee110bcf9af0739a256aa9d9f781f34536b9acb7d6ac327f729bd92c9010e2236869e166df8ed8b71dcdfede3d66de33056187e00678b11338941cfad8664557f552c99ae170e66f3e3d40e878109ea8fa61aa8838292b4e7a49af9a168ad010f0660db0bc4e61ee7061fd7c42eeda438f3621152da4ada182ce654d3d13f65b34ebcbdd3e9e4ed316d303ec48d022cba1ce7b3cd3784e8557d88d5458ba5450b01103d61a5a2375dea3426c916b28f93523f5a9613f0a2726f38e4b099beed051d4c44fe11c73183fec0325a50652a2a8f6a2bcee7edac01f23b6a05bd7b1f5311880012c937007ea8134010724a77b01947825de3335d4734acd2f969b96a273742b63f08b1a0538a16d76c6dda885c3b932a82b3dc3c6a01d0efd9c2776b954b49b9040066b4f1d400000000001ae101faedac5851e32b9b23b5f9411a8c2bac4aae3ed4dd7b811dd1a72ea4aa71000000000454899e01415557560000000000095f37df000027106236cf948847a205fc9f78bd6d85d2133124c89a020055009695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d0000000002a8a9060000000000009254fffffffb0000000066b4f1d40000000066b4f1d30000000002a72c0500000000000079d80b01f5ca71c8026dbd668b7aaadb122eeaff8fbd5b75d42edab9acb7fa3930444995883cad8e8ffdec0c27324f447952cd26c5beb599b3095f0ca96186fe24d21c739cfd28c8f5f0148141f5ae92999f20581457c11b3ffa1f172503b145897eb2c0bb1ab9c6d2692c7c22432cc2725bf35c73461e077271e03f8ca9e9ff8afd7e1cb1148bb7bb4057c74a7c55477d4c586e62061d2611e01dcf0685ddb345b759a358fd564c0ca49a115858434ffaa608a61eaf849cfd876ec92e5c57f0ed9e2e07237a467bf556d861f7778453a29408eaa83de5a2139c5ea70882540055009695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d0000000002a8a9060000000000009254fffffffb0000000066b4f1d40000000066b4f1d30000000002a72c0500000000000079d80b01f5ca71c8026dbd668b7aaadb122eeaff8fbd5b75d42edab9acb7fa3930444995883cad8e8ffdec0c27324f447952cd26c5beb599b3095f0ca96186fe24d21c739cfd28c8f5f0148141f5ae92999f20581457c11b3ffa1f172503b145897eb2c0bb1ab9c6d2692c7c22432cc2725bf35c73461e077271e03f8ca9e9ff8afd7e1cb1148bb7bb4057c74a7c55477d4c586e62061d2611e01dcf0685ddb345b759a358fd564c0ca49a115858434ffaa608a61eaf849cfd876ec92e5c57f0ed9e2e07237a467bf556d861f7778453a29408eaa83de5a2139c5ea7088254000000000000000000000000000000000000000000";
        
        // Call the contract with the calldata
        (bool success, bytes memory result) = address(0x8ED346a034F5eD7994937Abe6a48e560FE6488bA).call(data);
        
        // Check if the call was successful
        require(success, "Call failed");
        
        // Optional: Print the result
        console.logBytes(result);
    }
}
