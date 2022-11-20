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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.functions = exports.events = exports.abi = void 0;
const ethers = __importStar(require("ethers"));
const assert_1 = __importDefault(require("assert"));
exports.abi = new ethers.utils.Interface(getJsonAbi());
function decodeEvent(signature, data) {
    return exports.abi.decodeEventLog(exports.abi.getEvent(signature), data.data || "", data.topics);
}
exports.events = {
    "Approval(address,address,uint256)": {
        topic: exports.abi.getEventTopic("Approval(address,address,uint256)"),
        decode(data) {
            return decodeEvent("Approval(address,address,uint256)", data);
        }
    },
    "ApprovalForAll(address,address,bool)": {
        topic: exports.abi.getEventTopic("ApprovalForAll(address,address,bool)"),
        decode(data) {
            return decodeEvent("ApprovalForAll(address,address,bool)", data);
        }
    },
    "MarketItemCreated(uint256,address,address,uint256,bool)": {
        topic: exports.abi.getEventTopic("MarketItemCreated(uint256,address,address,uint256,bool)"),
        decode(data) {
            return decodeEvent("MarketItemCreated(uint256,address,address,uint256,bool)", data);
        }
    },
    "Transfer(address,address,uint256)": {
        topic: exports.abi.getEventTopic("Transfer(address,address,uint256)"),
        decode(data) {
            return decodeEvent("Transfer(address,address,uint256)", data);
        }
    },
};
function decodeFunction(data) {
    return exports.abi.decodeFunctionData(data.slice(0, 10), data);
}
exports.functions = {
    "approve(address,uint256)": {
        sighash: exports.abi.getSighash("approve(address,uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "createMarketSale(uint256)": {
        sighash: exports.abi.getSighash("createMarketSale(uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "createToken(string,uint256)": {
        sighash: exports.abi.getSighash("createToken(string,uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "resellToken(uint256,uint256)": {
        sighash: exports.abi.getSighash("resellToken(uint256,uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "safeTransferFrom(address,address,uint256)": {
        sighash: exports.abi.getSighash("safeTransferFrom(address,address,uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "safeTransferFrom(address,address,uint256,bytes)": {
        sighash: exports.abi.getSighash("safeTransferFrom(address,address,uint256,bytes)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "setApprovalForAll(address,bool)": {
        sighash: exports.abi.getSighash("setApprovalForAll(address,bool)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "transferFrom(address,address,uint256)": {
        sighash: exports.abi.getSighash("transferFrom(address,address,uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
    "updateListingPrice(uint256)": {
        sighash: exports.abi.getSighash("updateListingPrice(uint256)"),
        decode(input) {
            return decodeFunction(input);
        }
    },
};
class Contract {
    constructor(ctx, blockOrAddress, address) {
        this._chain = ctx._chain;
        if (typeof blockOrAddress === 'string') {
            this.blockHeight = ctx.block.height;
            this.address = ethers.utils.getAddress(blockOrAddress);
        }
        else {
            (0, assert_1.default)(address != null);
            this.blockHeight = blockOrAddress.height;
            this.address = ethers.utils.getAddress(address);
        }
    }
    async balanceOf(owner) {
        return this.call("balanceOf", [owner]);
    }
    async fetchItemsListed() {
        return this.call("fetchItemsListed", []);
    }
    async fetchMarketItems() {
        return this.call("fetchMarketItems", []);
    }
    async fetchMyNFTs() {
        return this.call("fetchMyNFTs", []);
    }
    async getApproved(tokenId) {
        return this.call("getApproved", [tokenId]);
    }
    async getListingPrice() {
        return this.call("getListingPrice", []);
    }
    async isApprovedForAll(owner, operator) {
        return this.call("isApprovedForAll", [owner, operator]);
    }
    async name() {
        return this.call("name", []);
    }
    async ownerOf(tokenId) {
        return this.call("ownerOf", [tokenId]);
    }
    async supportsInterface(interfaceId) {
        return this.call("supportsInterface", [interfaceId]);
    }
    async symbol() {
        return this.call("symbol", []);
    }
    async tokenURI(tokenId) {
        return this.call("tokenURI", [tokenId]);
    }
    async call(name, args) {
        const fragment = exports.abi.getFunction(name);
        const data = exports.abi.encodeFunctionData(fragment, args);
        const result = await this._chain.client.call('eth_call', [{ to: this.address, data }, this.blockHeight]);
        const decoded = exports.abi.decodeFunctionResult(fragment, result);
        return decoded.length > 1 ? decoded : decoded[0];
    }
}
exports.Contract = Contract;
function getJsonAbi() {
    return [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "sold",
                    "type": "bool"
                }
            ],
            "name": "MarketItemCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "createMarketSale",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "tokenURI",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "createToken",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "fetchItemsListed",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address payable",
                            "name": "seller",
                            "type": "address"
                        },
                        {
                            "internalType": "address payable",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "price",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "sold",
                            "type": "bool"
                        }
                    ],
                    "internalType": "struct NFTMarketplace.MarketItem[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "fetchMarketItems",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address payable",
                            "name": "seller",
                            "type": "address"
                        },
                        {
                            "internalType": "address payable",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "price",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "sold",
                            "type": "bool"
                        }
                    ],
                    "internalType": "struct NFTMarketplace.MarketItem[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "fetchMyNFTs",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address payable",
                            "name": "seller",
                            "type": "address"
                        },
                        {
                            "internalType": "address payable",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "price",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "sold",
                            "type": "bool"
                        }
                    ],
                    "internalType": "struct NFTMarketplace.MarketItem[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getListingPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "resellToken",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_listingPrice",
                    "type": "uint256"
                }
            ],
            "name": "updateListingPrice",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ];
}
//# sourceMappingURL=NFTMarketplace.js.map