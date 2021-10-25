pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CommunityVault is Ownable {

    IERC20 private _fiat;

    constructor (address fiat) public {
        _fiat = IERC20(fiat);
    }

    event SetAllowance(address indexed caller, address indexed spender, uint256 amount);

    function setAllowance(address spender, uint amount) public onlyOwner {
        _fiat.approve(spender, amount);

        emit SetAllowance(msg.sender, spender, amount);
    }
}
