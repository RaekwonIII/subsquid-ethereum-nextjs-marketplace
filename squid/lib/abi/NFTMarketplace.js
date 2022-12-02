"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.functions = exports.events = exports.abi = void 0;
const ethers = __importStar(require("ethers"));
const abi_support_1 = require("./abi.support");
const NFTMarketplace_abi_1 = require("./NFTMarketplace.abi");
exports.abi = new ethers.utils.Interface(NFTMarketplace_abi_1.ABI_JSON);
exports.events = {
    Approval: new abi_support_1.LogEvent(exports.abi, '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'),
    ApprovalForAll: new abi_support_1.LogEvent(exports.abi, '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31'),
    MarketItemCreated: new abi_support_1.LogEvent(exports.abi, '0xb640004f1d14576d0c209e240cad0410e0d8c0c33a09375861fbadae2588a98d'),
    Transfer: new abi_support_1.LogEvent(exports.abi, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'),
};
exports.functions = {
    approve: new abi_support_1.Func(exports.abi, '0x095ea7b3'),
    balanceOf: new abi_support_1.Func(exports.abi, '0x70a08231'),
    createMarketSale: new abi_support_1.Func(exports.abi, '0xbe9af536'),
    createToken: new abi_support_1.Func(exports.abi, '0x72b3b620'),
    fetchItemsListed: new abi_support_1.Func(exports.abi, '0x45f8fa80'),
    fetchMarketItems: new abi_support_1.Func(exports.abi, '0x0f08efe0'),
    fetchMyNFTs: new abi_support_1.Func(exports.abi, '0x202e3740'),
    getApproved: new abi_support_1.Func(exports.abi, '0x081812fc'),
    getListingPrice: new abi_support_1.Func(exports.abi, '0x12e85585'),
    isApprovedForAll: new abi_support_1.Func(exports.abi, '0xe985e9c5'),
    name: new abi_support_1.Func(exports.abi, '0x06fdde03'),
    ownerOf: new abi_support_1.Func(exports.abi, '0x6352211e'),
    resellToken: new abi_support_1.Func(exports.abi, '0xe219fc75'),
    'safeTransferFrom(address,address,uint256)': new abi_support_1.Func(exports.abi, '0x42842e0e'),
    'safeTransferFrom(address,address,uint256,bytes)': new abi_support_1.Func(exports.abi, '0xb88d4fde'),
    setApprovalForAll: new abi_support_1.Func(exports.abi, '0xa22cb465'),
    supportsInterface: new abi_support_1.Func(exports.abi, '0x01ffc9a7'),
    symbol: new abi_support_1.Func(exports.abi, '0x95d89b41'),
    tokenURI: new abi_support_1.Func(exports.abi, '0xc87b56dd'),
    transferFrom: new abi_support_1.Func(exports.abi, '0x23b872dd'),
    updateListingPrice: new abi_support_1.Func(exports.abi, '0xae677aa3'),
};
class Contract extends abi_support_1.ContractBase {
    balanceOf(owner) {
        return this.eth_call(exports.functions.balanceOf, [owner]);
    }
    fetchItemsListed() {
        return this.eth_call(exports.functions.fetchItemsListed, []);
    }
    fetchMarketItems() {
        return this.eth_call(exports.functions.fetchMarketItems, []);
    }
    fetchMyNFTs() {
        return this.eth_call(exports.functions.fetchMyNFTs, []);
    }
    getApproved(tokenId) {
        return this.eth_call(exports.functions.getApproved, [tokenId]);
    }
    getListingPrice() {
        return this.eth_call(exports.functions.getListingPrice, []);
    }
    isApprovedForAll(owner, operator) {
        return this.eth_call(exports.functions.isApprovedForAll, [owner, operator]);
    }
    name() {
        return this.eth_call(exports.functions.name, []);
    }
    ownerOf(tokenId) {
        return this.eth_call(exports.functions.ownerOf, [tokenId]);
    }
    supportsInterface(interfaceId) {
        return this.eth_call(exports.functions.supportsInterface, [interfaceId]);
    }
    symbol() {
        return this.eth_call(exports.functions.symbol, []);
    }
    tokenURI(tokenId) {
        return this.eth_call(exports.functions.tokenURI, [tokenId]);
    }
}
exports.Contract = Contract;
//# sourceMappingURL=NFTMarketplace.js.map