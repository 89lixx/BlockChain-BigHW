pragma solidity ^0.4.4;

import "Company.sol";
import "Deal.sol";

contract Truster{
    
    address public truster;
    string public name; //名字

    uint public creditSeller;   //用于现实的数据
    uint public creditBuyer;

    
    mapping(address => Company) public companies;
    mapping(address => mapping(address => Deal)) public deals;
    constructor(string trusterName) {
        truster = msg.sender;
        name = trusterName;
        creditBuyer = 0;
        creditSeller = 0;
    }

    //加入公司进来
    function addCompany(address addr, string name, uint property) public {
        assert(truster == msg.sender);
        
        assert(truster != addr);
        Company temp = new Company(addr, name, property);
        companies[addr] = temp;
    }

    function makeDeal(address buyer, address seller, uint amount) public {
        // assert(truster == msg.sender);
        
        Company Buyer = companies[buyer];
        Company Seller = companies[seller];
        assert(Buyer.getCredit() >= amount);
        assert(truster != buyer);
        assert(truster != seller);
        //确认这两个公司在记录里面
        //刷新额度
        Buyer.send(amount);
        Seller.recevie(amount);
        companies[buyer] = Buyer;
        companies[seller] = Seller;
        creditSeller = Seller.getCredit();
        creditBuyer = Buyer.getCredit();
        Deal deal = new Deal(buyer, seller, truster, amount);
        deals[buyer][seller] = deal;
    }

    //向银行进行融资
    function dealToMoney(address wantTrash, address oweTrash){
        assert(truster == msg.sender);//确保是银行调用的函数
        
        Deal deal = deals[oweTrash][wantTrash];
        Company company = companies[wantTrash];
        // assert(deal.getAmount() <= company.getCredit());
        
        //将账单的状态设置为，债主还银行
        deal.setStatus(2);
        deals[oweTrash][wantTrash] = deal;
        company.recevieRealTrash(deal.getAmount());
        company.decreaseCredit(deal.getAmount());
    }
    
    //还款
    function payCheck(address buyer, address seller) {
        assert(truster == msg.sender);//确保是银行调用的函数
        
        Deal deal = deals[buyer][seller];
        Company Buyer = companies[buyer];
        Company Seller = companies[seller];
        uint status = deal.getStatus();
        uint amount = deal.getAmount();
        if(status == 1){//表示这个账单正常，就直接卖家到买家
            Buyer.addCredit(amount);
            Buyer.payTrash(amount);
            Seller.decreaseCredit(amount);
            Seller.recevieRealTrash(amount);   
        }
        else if(status == 2) {//这个表示账单已经被卖家兑现，买家的钱直接给银行
            Buyer.addCredit(amount);
            Buyer.payTrash(amount);
        }
        deal.invalidate();  //这个账单已经没用了
        deals[buyer][seller] = deal;
        companies[buyer] = Buyer;
        companies[seller] = Seller;
    }
}