
var express             = require('express');
var app                 = express();
var bodyParse           = require('body-parser')
var cli = require('./cli')
// const Web3jService = require('../api/web3j/web3jService').Web3jService

// var web3 = new Web3jService()
app.use(bodyParse.json())
app.use(bodyParse.urlencoded({extended:false})) ;

const path = require('path');
const utils = require('../api/common/utils');
const fs = require('fs');
const { Web3jService, ConsensusService, SystemConfigService } = require('../api');
const { ContractsDir, ContractsOutputDir } = require('./constant');

const web3 = new Web3jService();
const consensusService = new ConsensusService();
const systemConfigService = new SystemConfigService();

const { check, string, boolean } = require('../api/common/typeCheck');
const channelPromise = require('../api/common/channelPromise');
const web3Sync = require('../api/common/web3lib/web3sync');
const isArray = require('isarray');
const ServiceBase = require('../api/common/serviceBase').ServiceBase;
const { produceSubCommandInfo, FLAGS, getAbi } = require('./interfaces/base');
//deploy

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})
app.post('/deploy',function(req, res){
    
    //处理前端发回来的数据
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp.contractName)

    let name = temp.contractName
    
    let contractName = name;

        if (!contractName.endsWith('.sol')) {
            contractName += '.sol';
        }
       
        let contractPath = path.join(ContractsDir, contractName);
        // res.send(contractPath)
        if (!fs.existsSync(contractPath)) {
            throw new Error(`${contractName} doesn't exist`);
        }
        let outputDir = ContractsOutputDir;

        web3.deploy(contractPath, outputDir).then(result => {
            let contractAddress = result.contractAddress;
            if (result.status === '0x0') {
                let addressPath = path.join(outputDir, `.${path.basename(contractName, '.sol')}.address`);

                try {
                    fs.appendFileSync(addressPath, contractAddress + '\n');
                } catch (error) { }
            }
            res.send({ contractAddress: contractAddress, status: result.status })
        });
})

//测试一个函数
app.post('/register',function(req,res){
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)

    let content = temp
    // res.send(content)
    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];
    parameters.push(content.account)
    parameters.push(parseInt(content.property))
    parameters.push(parseInt(content.credit))
    
    // console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})


app.post('/transfer',function(req,res){
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)
    let content = temp
    // res.send(content)
    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];
    // let s = content.params
    // s = s.split(',')
    // let num = parseInt(s[2])
    // if(content.params) {
        // parameters = content.params
        // parameters.push(content.params.toString())
        parameters.push(content.fromAccount)
        parameters.push(content.toAccount)
        parameters.push(parseInt(content.amount))
    // }
    // console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

//将信用转化为现金
app.post('/makeMoney',function(req,res){
    let content = req.body
    // res.send(content)
    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];
    parameters.push(content.account)
    parameters.push(parseInt(content.amount))
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

app.post('/select',function(req,res){
    let data = req.body
    let temp = {}
    for(let item in data){
        temp = item
    }
    temp = JSON.parse(temp)
    console.info('temp',temp)
    let content = temp
    // res.send(content)
    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];
    parameters.push(content.account)
    // console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    // console.info(ret.output[1].toString())
                    //16进制大数转化成10进制
                    ret.output[1] = ret.output[1].toString()
                    ret.output[2] = ret.output[2].toString()
                    // console.info('res',ret)
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    ret.output[1] = ret.output[1].toString()
                    // ret.output[2] = ret.output[2].toString()
                    // console.info(ret.output)
                    res.send(ret)
                });
            }
        }
    }
})
// 处理根目录的get请求
app.get('/test',function(req,res){
    // var c = web3.getGroupPeerss();
    // console.info(c.length)
    // res.send(c)
    res.send("ssssss")
})
app.get('/',function(req,res){
    res.send('这里是根目录') ;
    console.log('main page is required ');
}) ;

// 处理/login的get请求
app.post('/add', function (req,res) {
    console.info(req.body)
    let data = req.body
    console.info(data.key)
    let temp = {}
    for(let item in data){
        console.info(item.key)
        temp = item
    }
    temp = JSON.parse(temp)
    console.info(temp.name)
    // req.on("data",function(data){
    //     console.info(111,data)
    //     let name=querystring.parse(decodeURIComponent(data)).contractName;
    //     let password=querystring.parse(decodeURIComponent(data)).password;
    //     console.log(name,password)
    // });
    console.log('add page is required ')
}) ;

// 处理/login的post请求
app.post('/login',function(req,res){
    name=req.body.name ;
    pwd=req.body.pwd   ;
    console.log(name+'--'+pwd) ;
    res.status(200).send(name+'--'+pwd) ;
});

// 监听3000端口
console.info('listen 3000')
var server=app.listen(3000) ;