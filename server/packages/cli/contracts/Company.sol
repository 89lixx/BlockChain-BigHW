pragma solidity ^0.4.4;

contract Company {
    address public company;
    string public name;
    uint public creditAmount;  //信用额度
    uint public property;  //现有的资产
    
    uint public originalProperty;   //原始的资产，这个资产只有银行才可以改变

    constructor(address com, string Name, uint Property){
        company = com;
        name = Name;
        property = Property;
        creditAmount = Property;
        originalProperty = Property;
    }
    function getCredit() public returns(uint) {
        return creditAmount;
    }
    //获取白条的
    //加入到信用额度
    function recevie(uint amount) public returns(bool){
        creditAmount += amount;
        return true;
    }

    function send(uint amount) public returns(bool){
        creditAmount -= amount;
        return true;
    }

    //用于融资的函数，
    //将欠款转化为现金
    //但是
    function recevieRealTrash(uint trash) public {
        property += trash;
    }

    function payTrash(uint trash) public {
        property -= trash;
    }

    function addCredit(uint trash) public {
        creditAmount += trash;
    }

    function decreaseCredit(uint trash) public {
        creditAmount -= trash;
    }
}