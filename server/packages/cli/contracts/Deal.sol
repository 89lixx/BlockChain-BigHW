pragma solidity ^0.4.4;
contract Deal{
    address private buyer;  //借款的企业
    address private seller;  //收款的企业
    address private truster;    //信任的第三方
    uint private status;    //是否还款
    uint public amount;

    constructor(address addr1, address addr2, address addr3, uint amo) {
        //buyer seller truster
        buyer = addr1;
        seller = addr2;
        truster = addr3;
        status = 1;
        amount = amo;
    }

    function getBuyer() public returns(address) {
        return buyer;
    }
    function getSeller() public returns(address) {
        return seller;
    }
    function getTruster() public returns (address) {
        return truster;
    }
    function invalidate() public {
        status = 3;
    }
    function getAmount() public returns (uint) {
        return amount;
    }
    function getStatus() public returns (uint) {
        return status;
    }
    function setStatus(uint i) public {
        status = i;
    }
}