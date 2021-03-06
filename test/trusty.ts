import env = require("@nomiclabs/buidler");
import CEtherABI from "./ABIs/CEther.json";
import DaiTokenABI from "./ABIs/DAItoken.json";
import LendingPoolAddressesProviderABI from "./ABIs/LendingPoolAddressesProvider.json";
import LendingPoolABI from "./ABIs/LendingPool.json";
import ATokenABI from "./ABIs/AToken.json"
import ltcrABI from "./ABIs/LTCR.json"
import { assert } from "console";


var web3 = env.web3;
var artifacts = env.artifacts;
var contract = env.contract;

const Trusty = artifacts.require("Trusty");
const SimpleLendingProxy = artifacts.require("SimpleLendingProxy");
const UserProxyFactory = artifacts.require("UserProxyFactory");
const userProxy = artifacts.require("UserProxy");
const LTCR = artifacts.require("LTCR");
const SimpleLending = artifacts.require("SimpleLending");
const DaiMock = artifacts.require("DaiMock");
// const AaveCollateralManager = artifacts.require("AaveCollateralManager");

const privateKey = "01ad2f5ee476f3559b0d2eb8ec22968e847f0dcf3e1fc7ec02e57ecce5000548";
web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const ethAmountInWei = web3.utils.toWei('1', 'ether')
const aETHToken = '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04'
const aETHContract = new web3.eth.Contract(ATokenABI, aETHToken)

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // mainnet
const daiAmount = '1'

let trusty: typeof Trusty
let accs: typeof Trusty
let simpleLending: typeof Trusty
let simpleLendingTwo: typeof Trusty
let simpleLendingAddress: any
let simpleLendingTwoAddress: any
let daiMock: typeof Trusty


contract("SimpleLending Protocol", accounts => {

    async function initializeSimpleLendingLTCR(trusty: typeof Trusty) {
        const simpleLendingLTCRAddress = await trusty.getSimpleLendingLTCR();
        let simpleLendingLayers = [1, 2, 3, 4, 5];
        let simpleLendingLayerFactors = [1000, 900, 850, 800, 750];
        let simpleLendingLayerLowerBounds = [0, 20, 40, 60, 80];
        let simpleLendingLayerUpperBounds = [25, 45, 65, 85, 10000];
        await initializeLTCR(simpleLendingLTCRAddress, simpleLendingLayers, simpleLendingLayerFactors, simpleLendingLayerLowerBounds, simpleLendingLayerUpperBounds);
    }

    async function initializeSimpleLendingTwoLTCR(trusty: typeof Trusty) {
        const simpleLendingLTCRAddress = await trusty.getSimpleLendingTwoLTCR();
        let simpleLendingLayers = [1, 2, 3, 4, 5];
        let simpleLendingLayerFactors = [1000, 900, 850, 800, 750];
        let simpleLendingLayerLowerBounds = [0, 20, 40, 60, 80];
        let simpleLendingLayerUpperBounds = [25, 45, 65, 85, 10000];
        await initializeLTCR(simpleLendingLTCRAddress, simpleLendingLayers, simpleLendingLayerFactors, simpleLendingLayerLowerBounds, simpleLendingLayerUpperBounds);
    }

    async function initializeLTCR(LTCRAddress: string, layers: number[], layerFactors: number[], layerLowerBounds: number[], layerUpperBounds: number[]) {
        const ltcr = await LTCR.at(LTCRAddress)
        await ltcr.resetLayers();
        for(let i = 0; i < layers.length; i++) {
            await ltcr.addLayer(layers[i]);
        }
        for(let i = 0; i < layers.length; i++) {
            await ltcr.setFactor(layers[i], layerFactors[i]);
        }
        for(let i = 0; i < layers.length; i++) {
            await ltcr.setBounds(layers[i], layerLowerBounds[i], layerUpperBounds[i]);
        }

        // setting the reward for each action
        // ideally, the reward depends on call parameters
        // Mapping of actions to their id:
        const depositAction = 1;
        const borrowAction = 2;
        const repayAction = 3;
        const liquidationCallAction = 4;
        const flashLoanAction = 5;
        const redeemAction = 6;
        await ltcr.setReward(depositAction, 15);
        await ltcr.setReward(borrowAction, 0);
        await ltcr.setReward(repayAction, 5);
        await ltcr.setReward(liquidationCallAction, 10);
        await ltcr.setReward(flashLoanAction, 10);
        await ltcr.setReward(redeemAction, 0);
    }

    async function initializeLendingProtocol(protocolAddress: string) {
        if(protocolAddress == simpleLendingAddress) {
            await initializeSimpleLendingLTCR(trusty);
        } else {
            await initializeSimpleLendingTwoLTCR(trusty);
        }
        let lendingProtocol = await SimpleLending.at(protocolAddress);
        lendingProtocol.addReserve(daiMock.address);

        // generating 3 ETH worth of Dai at price 228 ETH per Dai
        await daiMock.mint(accs[1], 684);

        await daiMock.approve(
            lendingProtocol.address,
            684,
            {
                from: accs[1],
            }
        );
        await lendingProtocol.deposit(
            daiMock.address,
            684,
            {
                from: accs[1],
            }
        );

        await lendingProtocol.deposit(
            ethAddress,
            web3.utils.toWei('2', 'ether'),
            {
                from: accs[1],
                value: web3.utils.toHex(web3.utils.toWei('2', 'ether'))
            }
        );

        return lendingProtocol;
    }

    function divideByConversionDecimals(obj: {0: number, 1: number}) {
        return (obj[0] / (10 ** obj[1]))
    }

    // async function deposit

    before(async function() {
        accs = await web3.eth.getAccounts();
        trusty = await Trusty.new();
        daiMock = await DaiMock.new();

        simpleLendingAddress = await trusty.getSimpleLendingAddress();
        simpleLending = await initializeLendingProtocol(simpleLendingAddress);

        simpleLendingTwoAddress = await trusty.getSimpleLendingTwoAddress();
        simpleLendingTwo = await initializeLendingProtocol(simpleLendingTwoAddress);

        // let daiMocks = await daiMock.balanceOf(simpleLending.address)
        // console.log(`daiMock balance in SL: ${daiMocks}`);

        let conversionRate = await simpleLending.conversionRate(ethAddress, daiMock.address);
        console.log(`(conversion rate from eth to daiMock: ${divideByConversionDecimals(conversionRate)})`);

        // let conversionValue = await simpleLending.convert(daiMock.address, ethAddress, 684);
        // console.log(`converting 684 from daiMock to eth: ${conversionValue}`);

        // let userSimpleLendingBalance = await simpleLending.getAccountDeposits(accs[1]);
        // console.log(`Account balance in SimpleLending: ${userSimpleLendingBalance}`)
    });

    xit("Should deposit to SimpleLending", async function () {
        const userProxyFactoryAddress = await trusty.getUserProxyFactoryAddress();
        const userProxyFactory = await UserProxyFactory.at(userProxyFactoryAddress);
        await userProxyFactory.addAgent();
        const simpleLendingProxyAddress = await trusty.getSimpleLendingProxy();
        const simpleLendingProxy = await SimpleLendingProxy.at(simpleLendingProxyAddress);

        const userProxyAddress = await userProxyFactory.getUserProxyAddress(accs[0]);
        const up = await userProxy.at(userProxyAddress);
        let tr = await up.depositFunds(
            ethAddress,
            web3.utils.toWei('2', 'ether'),
            {
                from: accs[0],
                gasLimit: web3.utils.toHex(1500000),
                gasPrice: web3.utils.toHex(20000000000),
                value: web3.utils.toHex(web3.utils.toWei('2', 'ether'))
            }
        );

        console.log("The base collateralization ratio in SimpleLending is 150%");
        // await trusty.getAggregateAgentFactor(up.address); //prints to console in buidler
        
        tr = await simpleLendingProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLending")

        tr = await simpleLendingProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLending")
        await simpleLending.getBorrowableAmountInETH(up.address); //prints to console in buidler
        console.log("gotBorrowableAmountInETH");

        // const agentScore = await simpleLendingLTCR.getScore(up.address);
        // console.log(`the score of the agent in Trusty (before round end): ${agentScore}`);
        console.log("Ending round. User wil be promoted to a higher layer.");
        await trusty.curateLTCRs();
        // await trusty.getAggregateAgentFactor(up.address); //prints to console in buidler
        await simpleLending.getBorrowableAmountInETH(up.address); //prints to console in buidler

        let conversionRate = await simpleLending.conversionRate(daiMock.address, ethAddress);
        console.log(`(conversion rate from daiMock to eth: ${conversionRate})`);
    });

    xit("Should deposit to, borrow from and repay to SimpleLending", async function () {
        const userProxyFactoryAddress = await trusty.getUserProxyFactoryAddress();
        const userProxyFactory = await UserProxyFactory.at(userProxyFactoryAddress);
        await userProxyFactory.addAgent();
        const simpleLendingProxyAddress = await trusty.getSimpleLendingProxy();
        const simpleLendingProxy = await SimpleLendingProxy.at(simpleLendingProxyAddress);

        const userProxyAddress = await userProxyFactory.getUserProxyAddress(accs[0]);
        const up = await userProxy.at(userProxyAddress);
        let tr = await up.depositFunds(
            ethAddress,
            web3.utils.toWei('2', 'ether'),
            {
                from: accs[0],
                gasLimit: web3.utils.toHex(1500000),
                gasPrice: web3.utils.toHex(20000000000),
                value: web3.utils.toHex(web3.utils.toWei('2', 'ether'))
            }
        );

        console.log("The base collateralization ratio in SimpleLending is 150%");
        // await trusty.getAggregateAgentFactor(up.address); //prints to console in buidler
        
        tr = await simpleLendingProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLending")

        tr = await simpleLendingProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLending")
        await simpleLending.getBorrowableAmountInETH(up.address); //prints to console in buidler

        // const agentScore = await simpleLendingLTCR.getScore(up.address);
        // console.log(`the score of the agent in Trusty (before round end): ${agentScore}`);
        console.log("Ending round. User wil be promoted to a higher layer.");
        await trusty.curateLTCRs();
        await simpleLending.getBorrowableAmountInETH(up.address); //prints to console in buidler

        let conversionRate = await simpleLending.conversionRate(daiMock.address, ethAddress);
        console.log(`(conversion rate from DaiMock to eth: ${divideByConversionDecimals(conversionRate)})`);

        tr = await simpleLendingProxy.borrow(
            daiMock.address,
            "1"
        );
        console.log("Borrowed 1 DaiMock");

        tr = await simpleLendingProxy.repay(
            daiMock.address,
            "1",
            up.address
        );
        console.log("Repaid loan of 1 DaiMock");

        conversionRate = await simpleLending.conversionRate(ethAddress, daiMock.address);
        console.log(`(conversion rate from ETH to DaiMock: ${divideByConversionDecimals(conversionRate)})`);

        conversionRate = await simpleLending.convert(daiMock.address, ethAddress, "1");
        console.log(`(conversion rate from DaiMock to ETH: ${divideByConversionDecimals(conversionRate)})`);

        let userSimpleLendingBorrows = await simpleLending.getAccountBorrows(up.address);
        console.log(`User borrows in SimpleLending (in ETH):   ${divideByConversionDecimals(userSimpleLendingBorrows)}`)

        tr = await simpleLendingProxy.redeem(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Redeemed 1 ETH");
    });

    it("Should deposit to SimpleLending and SimpleLendingTwo", async function () {
        const userProxyFactoryAddress = await trusty.getUserProxyFactoryAddress();
        const userProxyFactory = await UserProxyFactory.at(userProxyFactoryAddress);
        await userProxyFactory.addAgent();

        const simpleLendingProxyAddress = await trusty.getSimpleLendingProxy();
        const simpleLendingProxy = await SimpleLendingProxy.at(simpleLendingProxyAddress);

        const simpleLendingTwoProxyAddress = await trusty.getSimpleLendingTwoProxy();
        const simpleLendingTwoProxy = await SimpleLendingProxy.at(simpleLendingTwoProxyAddress);

        const userProxyAddress = await userProxyFactory.getUserProxyAddress(accs[0]);
        const up = await userProxy.at(userProxyAddress);
        let tr = await up.depositFunds(
            ethAddress,
            web3.utils.toWei('3', 'ether'),
            {
                from: accs[0],
                gasLimit: web3.utils.toHex(1500000),
                gasPrice: web3.utils.toHex(20000000000),
                value: web3.utils.toHex(web3.utils.toWei('3', 'ether'))
            }
        );

        console.log("The base collateralization ratio in SimpleLending is 150%");
        
        tr = await simpleLendingProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLending")

        tr = await simpleLendingProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLending")

        tr = await simpleLendingTwoProxy.deposit(
            ethAddress,
            web3.utils.toWei('1', 'ether')
        );
        console.log("Deposited 1 Ether in SimpleLendingTwo")
        console.log();
        console.log("Borrowable amount in SimpleLending:");
        await simpleLending.getBorrowableAmountInETH(up.address); //prints to console in buidler
        console.log();

        console.log("Borrowable amount in SimpleLendingTwo:");
        await simpleLendingTwo.getBorrowableAmountInETH(up.address); //prints to console in buidler
        console.log();
        
        console.log("Ending round. User wil be promoted to a higher layer in SimpleLending, but not in SimpleLendingTwo.");
        await trusty.curateLTCRs();
        console.log();

        console.log("Borrowable amount in SimpleLending:");
        await simpleLending.getBorrowableAmountInETH(up.address); //prints to console in buidler
        console.log();

        console.log("Borrowable amount in SimpleLendingTwo:");
        await simpleLendingTwo.getBorrowableAmountInETH(up.address); //prints to console in buidler

        let conversionRate = await simpleLending.conversionRate(daiMock.address, ethAddress);
        console.log(`(conversion rate from daiMock to eth: ${divideByConversionDecimals(conversionRate)})`);
    });

});

// contract("TrustyAaveProxy", accounts => {
//     const referralCode = '0'
    // const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // mainnet
    // const daiAmountinWei = web3.utils.toWei("0.1", "ether")
//     const interestRateMode = 2 // variable rate
//     const lpAddressProviderAddress = '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8'
//     const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressesProviderABI, lpAddressProviderAddress)

//     xit("Should take an Aave flashloan using Trusty", async function () {
//         // const FlashLoanExecutor = artifacts.require("FlashLoanExecutor");

//         this.timeout(1000000);
//         const t = await Trusty.new();
//         await t.addAgent();
//         const taAddress = await t.getTrustyAaveProxy({
//             from: myWalletAddress,
//             gasLimit: web3.utils.toHex(150000),
//             gasPrice: web3.utils.toHex(20000000000),
//         });
//         const ta = await TrustyAaveProxy.at(taAddress)

//         // const flr = await FlashLoanExecutor.new(lpAddressProviderContract.options.address);
//         // let amount = web3.utils.toWei("100", "ether");
//         // let params = "0x0";

//         // let feeRate = 0.0009;
//         // let fee = Number(amount) * feeRate;

//         // // send enough funds to FlashLoanExecutor to pay the flashloan fee

//         // await web3.eth.sendTransaction({
//         //     from: myWalletAddress,
//         //     to: flr.address,
//         //     value: web3.utils.toHex(fee),
//         //     gasLimit: web3.utils.toHex(150000),
//         //     gasPrice: web3.utils.toHex(20000000000),
//         // });

//         // var balance = await web3.eth.getBalance(flr.address); 
//         // console.log(`Balance before the flashloan (0.09%): ${balance}`);
//         // let tr = await ta.flashLoan(
//         //     flr.address, 
//         //     ethAddress, 
//         //     amount,
//         //     params,
//         //     {
//         //         from: myWalletAddress,
//         //         gasLimit: web3.utils.toHex(1500000000),
//         //         gasPrice: web3.utils.toHex(20000000000),
//         //     }
//         // );
//         // balance = await web3.eth.getBalance(flr.address); 
//         // console.log(`Balance after the flashloan                 : ${balance}`);
//         // console.log(tr)
//         // assert(balance == 0);
//     });

//     xit("Should call Aave from Trusty", async function () {
//         this.timeout(1000000);

//         // Get the latest LendingPool contract address
//         const lpAddress = await lpAddressProviderContract.methods
//             .getLendingPool()
//             .call()
//             .catch((e: { message: any; }) => {
//                 throw Error(`Error getting lendingPool address: ${e.message}`)
//             })

//         console.log(lpAddress)

//         // Make the deposit transaction via LendingPool contract
//         const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress)

//         const t = await Trusty.new();
//         await t.addAgent();
//         const taAddress = await t.getTrustyAaveProxy({
//             from: myWalletAddress,
//             gasLimit: web3.utils.toHex(150000),
//             gasPrice: web3.utils.toHex(20000000000),
//         });
//         const ta = await TrustyAaveProxy.at(taAddress);

//         const userProxyAddress = await t.getUserProxy(
//             myWalletAddress,
//             {
//                 from: myWalletAddress,
//                 gasLimit: web3.utils.toHex(150000),
//                 gasPrice: web3.utils.toHex(20000000000),
//             }
//         );
//         const up = await userProxy.at(userProxyAddress);
//         let tr = await up.depositFunds(
//             ethAddress,
//             ethAmountInWei,
//             {
//                 from: myWalletAddress,
//                 gasLimit: web3.utils.toHex(1500000),
//                 gasPrice: web3.utils.toHex(20000000000),
//                 value: web3.utils.toHex(web3.utils.toWei('1', 'ether'))
//             }
//         );

//         console.log("Deposited funds in UserProxy");
//         let balanceAfterDeposit = await web3.eth.getBalance(up.address)
//         console.log(`Balance:                                                    ${balanceAfterDeposit}`)

//         tr = await ta.deposit(
//             ethAddress,
//             ethAmountInWei,
//             referralCode,
//             {
//                 from: myWalletAddress,
//                 gasLimit: web3.utils.toHex(1500000),
//                 gasPrice: web3.utils.toHex(20000000000),
//             }
//         );
//         console.log(tr);
//         console.log("Deposited 1 Ether")

//         let balanceAfterAaveDeposit = await web3.eth.getBalance(up.address)
//         console.log(`Balance left:                                         ${balanceAfterAaveDeposit}`)

//         let ethContractBalance = await aETHContract.methods.balanceOf(up.address).call()
//         console.log(`Balance in the Aave ETH contract: ${ethContractBalance}`)

//         const aaveCollateralManagerAddress = await t.getAaveCollateralManager(
//             {
//                 from: myWalletAddress,
//                 gasLimit: web3.utils.toHex(150000),
//                 gasPrice: web3.utils.toHex(20000000000),
//             }
//         );

//         let aaveCollateralManagerContractBalanceInAToken = await aETHContract.methods.balanceOf(aaveCollateralManagerAddress).call()
//         console.log(`Balance in the Aave ETH contract for CM: ${aaveCollateralManagerContractBalanceInAToken}`)

//         let aaveCollateralManagerContractBalance = await web3.eth.getBalance(aaveCollateralManagerAddress)
//         console.log(`Balance left in CM:                                         ${aaveCollateralManagerContractBalance}`)


//         // Borrowing Dai using the deposited Eth as collateral
//         // tr = await ta.borrow(
//         //         daiAddress,
//         //         daiAmountinWei,
//         //         interestRateMode,
//         //         referralCode,
//         //         {
//         //                 from: myWalletAddress,
//         //                 gasLimit: web3.utils.toHex(1500000),
//         //                 gasPrice: web3.utils.toHex(20000000000)
//         //         }
//         // );
//         // console.log(`Borrowed ${daiAmountinWei} Dai amount in Wei`)
//         // let d = await lpContract.methods.getUserAccountData(up.address).call()
//         // console.log(d);

//         // // // await delay(2000);
//         // console.log(`Paying back ${daiAmountinWei} gwei`)
//         // tr = await ta.repay(
//         //         daiAddress,
//         //         daiAmountinWei,
//         //         myWalletAddress,
//         //         {
//         //                 from: myWalletAddress,
//         //                 gasLimit: web3.utils.toHex(15000000),
//         //                 gasPrice: web3.utils.toHex(200000000000),
//         //         }
//         // );
//         // console.log(tr)
//         // console.log("Repaid the borrow")
//         // // d = await lpContract.methods.getUserAccountData(up.address).call()
//         // // console.log(d);

//         // let balanceBeforeRedeem = await aETHContract.methods.balanceOf(up.address).call()

//         // // account for slippage from borrow repayment
//         // balanceBeforeRedeem = parseInt(balanceBeforeRedeem) - 30000000000000
//         // balanceBeforeRedeem = balanceBeforeRedeem.toString()
//         // console.log(`Redeeming the balance of: ${balanceBeforeRedeem}`)

//         // tr = await ta.redeem(
//         //         aETHToken,
//         //         balanceBeforeRedeem,
//         //         {
//         //                 from: myWalletAddress,
//         //                 gasLimit: web3.utils.toHex(15000000),
//         //                 gasPrice: web3.utils.toHex(200000000000),
//         //         }
//         // );
//         // let balanceAfterRedeem = await aETHContract.methods.balanceOf(up.address).call()
//         // console.log(`Balance left:                         ${balanceAfterRedeem}`)

//         // let balanceInUserProxyAfterRedeem = await web3.eth.getBalance(up.address)
//         // console.log(`Balance in UserProxy:                                         ${balanceInUserProxyAfterRedeem}`)
//         // console.log(tr)
//         // assert(balanceAfterRedeem < balanceBeforeRedeem);


//         // let agentScore = await ta.getAgentScore({
//         //                 from: myWalletAddress,
//         //                 gasLimit: web3.utils.toHex(15000000),
//         //                 gasPrice: web3.utils.toHex(200000000000),
//         //         });
//         // console.log(`Based on the tested actions, the test agent has achieved a score of ${agentScore}. `);
//         // console.log(`Keep performing desired Aave actions to further reduce your collateral!`);

//         // await ta.curate({
//         //         from: myWalletAddress,
//         //         gasLimit: web3.utils.toHex(15000000),
//         //         gasPrice: web3.utils.toHex(200000000000),
//         // });
//     });

//     xit("Should call Aave directly from javascript", async function () {
//         this.timeout(1000000);

//         // Get the latest LendingPool contract address
//         const lpAddress = await lpAddressProviderContract.methods
//             .getLendingPool()
//             .call()
//             .catch((e: { message: any; }) => {
//                 throw Error(`Error getting lendingPool address: ${e.message}`)
//             })

//         // Make the deposit transaction via LendingPool contract
//         const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress)

//         let tr = await lpContract.methods
//             .deposit(
//                 ethAddress,
//                 ethAmountInWei,
//                 referralCode
//             )
//             .send({
//                 from: myWalletAddress,
//                 gasLimit: web3.utils.toHex(1500000),
//                 gasPrice: web3.utils.toHex(20000000000),
//                 value: web3.utils.toHex(web3.utils.toWei('1', 'ether'))
//             })

//         // console.log(tr)
//         console.log("Deposited 1 Ether")

//         tr = await lpContract.methods
//             .getUserReserveData(ethAddress, myWalletAddress)
//             .call()
//             .catch((e: { message: any; }) => {
//                 throw Error(`Error with getUserReserveData() call to the LendingPool contract: ${e.message}`)
//             })
//         // console.log(tr)

//         // Borrowing Dai using the deposited Eth as collateral

//         // await lpContract.methods
//         // .borrow(
//         //         daiAddress,
//         //         daiAmountinWei,
//         //         interestRateMode,
//         //         referralCode
//         // )
//         // .send({
//         //         from: myWalletAddress,
//         //         gasLimit: web3.utils.toHex(1500000),
//         //         gasPrice: web3.utils.toHex(20000000000)
//         // })


//         // console.log(`Borrowed ${daiAmountinWei} Dai amount in Wei`)

//         // let d = await lpContract.methods.getUserAccountData(myWalletAddress).call()
//         // console.log(d);

//         // console.log(`Paying back ${daiAmountinWei} gwei`)

//         // // Get the latest LendingPoolCore address
//         // const lpCoreAddress = await lpAddressProviderContract.methods
//         //         .getLendingPoolCore()
//         //         .call()

//         // // Approve the LendingPoolCore address with the DAI contract
//         // const daiContract = new web3.eth.Contract(DaiTokenABI, daiAddress)
//         // await daiContract.methods
//         //         .approve(
//         //                 lpCoreAddress,
//         //                 daiAmountinWei
//         //         )
//         //         .send({
//         //                 from: myWalletAddress,
//         //                 gasLimit: web3.utils.toHex(15000000),
//         //                 gasPrice: web3.utils.toHex(200000000000),
//         //         })

//         // await lpContract.methods
//         // .repay(
//         //         daiAddress,
//         //         daiAmountinWei,
//         //         myWalletAddress
//         // )
//         // .send({
//         //         from: myWalletAddress,
//         //         gasLimit: web3.utils.toHex(15000000),
//         //         gasPrice: web3.utils.toHex(200000000000),
//         // })

//         // console.log("Repaid the borrow")
//         // d = await lpContract.methods.getUserAccountData(myWalletAddress).call()
//         // console.log(d);

//         let balance = await aETHContract.methods.balanceOf(myWalletAddress).call()
//         console.log(`Redeeming the balance of: ${balance}`)
//         // tr = await aETHContract.methods
//         //         .redeem(balance)
//         //         .send({
//         //                 from: myWalletAddress,
//         //                 gasLimit: web3.utils.toHex(15000000),
//         //                 gasPrice: web3.utils.toHex(200000000000),
//         //         })

//         // // console.log(tr)
//         // balance = await aETHContract.methods.balanceOf(myWalletAddress).call()
//         // console.log(`Balance left:                         ${balance}`)
//         // There seems to be some slippage occuring
//     });
// });




function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}