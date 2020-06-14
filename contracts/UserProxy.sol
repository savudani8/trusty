pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@studydefi/money-legos/aave/contracts/ILendingPoolAddressesProvider.sol";
import "./trusty.sol";
import "./LTCR.sol";


contract UserProxy is Ownable {
    address agentOwner;
    uint256 constant INT256_MAX = ~(uint256(1) << 255);

    // only callable by (all the) user protocol proxies
    address[] authorisedContracts;
    address constant aETHAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address constant LendingPoolAddressesProviderAddress = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;
    mapping(address => int256) agentFundsInPool;
    LTCR[] ltcrs;
    trusty trustyContract;



    constructor(address agent, address payable trustyAddress) public {
        trustyContract = trusty(trustyAddress);
        addAuthorisedContract(msg.sender);
        agentOwner = agent;
    }

    function addAuthorisedContract(address authorisedContract) public onlyOwner {
        authorisedContracts.push(authorisedContract);
    }

    function ltcrAlreadyAdded(LTCR ltcr) private view returns(bool) {
        for (uint8 i = 0; i < ltcrs.length; i++) {
            if(address(ltcrs[i]) == address(ltcr)) {
                return true;
            }
        }
        return false;
    }

    function addLTCR(address ltcrAddress) public onlyOwner {
        LTCR ltcr = LTCR(ltcrAddress);
        // perhaps this check is overkill
        require(!ltcrAlreadyAdded(ltcr), "ltcr already added in user proxy");
        ltcrs.push(ltcr);
    }

    modifier onlyAuthorised() {
        bool isAuthorised = false;
        for (uint i = 0; i < authorisedContracts.length; i++) {
            if(authorisedContracts[i] == msg.sender) {
                isAuthorised = true;
                break;
            }
        }
        require(isAuthorised == true, "Caller is not authorised to perform this action");
        _;
    }

    modifier onlyAgentOwner() {
        require(msg.sender == agentOwner, "Caller isn't agentOwner");
        _;
    }

    modifier hasEnoughFunds(address _reserve, uint256 _amount) {
        int256 amount = uintToInt(_amount);
        // agentFundsInPool[_reserve] can be negative but this is accounted for
        if(_reserve != aETHAddress) {
            int256 ERCTokenBalance = uintToInt(IERC20(_reserve).balanceOf(address(this)));
            int256 fundsInPool = agentFundsInPool[_reserve];
            require(ERCTokenBalance + fundsInPool >= amount, "You don't have enough funds");
            if(ERCTokenBalance < amount && ERCTokenBalance + fundsInPool >= amount) {
                uint256 difference = intToUint(amount - ERCTokenBalance);
                trustyContract.moveFundsToUserProxy(agentOwner, _reserve, difference);
                agentFundsInPool[_reserve] -= amount;

            }
        } else {
            int256 ethBalance = uintToInt(address(this).balance);
            int256 fundsInPool = agentFundsInPool[aETHAddress];
            require(ethBalance + fundsInPool >= amount, "You don't have enough funds");
            if(ethBalance < amount && ethBalance + fundsInPool >= amount) {
                uint256 difference = intToUint(amount - ethBalance);
                trustyContract.moveFundsToUserProxy(agentOwner, _reserve, difference);
                agentFundsInPool[_reserve] -= amount;
            }
        }
        _;
    }

    function uintToInt(uint256 a) private pure returns (int256) {
        require(a < INT256_MAX, "uint value is too big to convert to int");
        return int256(a);
    }

    function intToUint(int256 a) private pure returns (uint256) {
        require(a >= 0, "int value is too small to convert to uint");
        return uint256(a);
    }

    function moveFundsToPool(address _reserve, uint256 _amount) public onlyOwner hasEnoughFunds(_reserve, _amount) {
        agentFundsInPool[_reserve] += uintToInt(_amount);
        withdrawFunds(_reserve, _amount);
    }

    function withdrawFunds(address _reserve, uint256 _amount) public onlyAgentOwner hasEnoughFunds(_reserve, _amount) {
        if(_reserve != aETHAddress) {
            IERC20(_reserve).transfer(msg.sender, _amount);
        } else {
            msg.sender.transfer(_amount);
        }
    }

    function depositFunds(address _reserve, uint256 _amount) public payable onlyAgentOwner {
        if(_reserve == aETHAddress) {
            require(msg.value == _amount, "_amount does not match the send ETH");
        } else {
            IERC20(_reserve).transferFrom(msg.sender, address(this), _amount);
        }
    }

    function getFundsInPool(address _reserve) public view returns(int256) {
        return agentFundsInPool[_reserve];
    }

    function getTotalBalance(address _reserve) public view returns(uint256) {
        if(_reserve != aETHAddress) {
            uint256 ERCTokenBalance = IERC20(_reserve).balanceOf(address(this));
            uint256 fundsInPool = intToUint(agentFundsInPool[_reserve]);
            return ERCTokenBalance + fundsInPool;
        } else {
            uint256 balance = address(this).balance;
            uint256 fundsInPool = intToUint(agentFundsInPool[aETHAddress]);
            return balance + fundsInPool;
        }
    }

    function proxyCall(address target, bytes memory abiEncoding) public onlyAuthorised payable returns (bool) {
        // the following variables are set to 0 because they are not applicable to this call
        address currencyReserve = address(0);
        uint256 currencyAmount = 0;
        return proxyCall(target, abiEncoding, currencyReserve, currencyAmount);
    }

// when calling the CM, pass target as a parameter; also pass abiEncoding as a parameter
// 
    function proxyCall(
        address target,
        bytes memory abiEncoding,
        address reserve,
        uint256 amount
    ) public onlyAuthorised hasEnoughFunds(reserve, amount) payable returns (bool) {
        require(target != address(0), "Target address cannot be 0");
        bool success;
        if(msg.value > 0) {
            require(reserve != address(0), "Reserve address cannot be 0");
            if(reserve != aETHAddress) {
                address LendingPoolCoreAddress = ILendingPoolAddressesProvider(LendingPoolAddressesProviderAddress).getLendingPoolCore();
                IERC20(reserve).approve(LendingPoolCoreAddress, amount);
                (success, ) = target.call(abiEncoding);
            } else {
                require(amount == msg.value, "Amount submitted by proxy differs from the amount parameter value");
                (success, ) = target.call.value(msg.value)(abiEncoding);
            }
        } else {
            (success, ) = target.call(abiEncoding);
        }
        
        return success;
    }

}

