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
exports.getOrCreateContractEntity = void 0;
const typeorm_store_1 = require("@subsquid/typeorm-store");
const evm_processor_1 = require("@subsquid/evm-processor");
const NFTMarketplace = __importStar(require("./abi/NFTMarketplace"));
const model_1 = require("./model");
const typeorm_1 = require("typeorm");
const ethers_1 = require("ethers");
const contractAddress = process.env.MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000';
const processor = new evm_processor_1.EvmBatchProcessor()
    .setDataSource({
    chain: process.env.ETHEREUM_MAINNET_WSS,
    archive: process.env.ARCHIVE_URL || 'https://eth.archive.subsquid.io',
})
    .addLog(contractAddress, {
    filter: [
        // [NFTMarketplace.events["Transfer(address,address,uint256)"].topic],
        [NFTMarketplace.events["MarketItemCreated(uint256,address,address,uint256,bool)"].topic]
    ],
    data: {
        evmLog: {
            topics: true,
            data: true,
        },
        transaction: {
            hash: true,
        },
    },
});
processor.run(new typeorm_store_1.TypeormDatabase(), async (ctx) => {
    const transfersData = [];
    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.kind === "evmLog") {
                ctx.log.info('Found item!');
                if (item.address === contractAddress) {
                    const transfer = handleEvents({
                        ...ctx,
                        block: block.header,
                        ...item,
                    });
                    transfersData.push(transfer);
                }
            }
        }
    }
    await saveTransfers({
        ...ctx,
        block: ctx.blocks[ctx.blocks.length - 1].header,
    }, transfersData);
});
let contractEntity;
async function getOrCreateContractEntity(store) {
    if (contractEntity == null) {
        contractEntity = await store.get(model_1.Contract, contractAddress);
        if (contractEntity == null) {
            contractEntity = new model_1.Contract({
                id: process.env.MARKETPLACE_ADDRESS,
                name: "MassimoTest",
                symbol: "XYZ",
                totalSupply: 0n,
            });
            await store.insert(contractEntity);
        }
    }
    return contractEntity;
}
exports.getOrCreateContractEntity = getOrCreateContractEntity;
function handleEvents(ctx) {
    const { evmLog, transaction, block } = ctx;
    const addr = evmLog.address.toLowerCase();
    const { owner, seller, tokenId, price } = NFTMarketplace.events["MarketItemCreated(uint256,address,address,uint256,bool)"].decode(evmLog);
    const transfer = {
        id: `${transaction.hash}-${addr}-${tokenId.toBigInt()}-${evmLog.index}`,
        tokenId: tokenId.toBigInt(),
        from: seller,
        to: owner,
        price: price.toBigInt(),
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: transaction.hash,
    };
    return transfer;
}
async function saveTransfers(ctx, transfersData) {
    const tokensIds = new Set();
    const ownersIds = new Set();
    for (const transferData of transfersData) {
        tokensIds.add(transferData.tokenId.toString());
        ownersIds.add(transferData.from);
        ownersIds.add(transferData.to);
    }
    const transfers = new Set();
    const tokens = new Map((await ctx.store.findBy(model_1.Token, { id: (0, typeorm_1.In)([...tokensIds]) })).map((token) => [
        token.id,
        token,
    ]));
    const owners = new Map((await ctx.store.findBy(model_1.Owner, { id: (0, typeorm_1.In)([...ownersIds]) })).map((owner) => [
        owner.id,
        owner,
    ]));
    for (const transferData of transfersData) {
        const contract = new NFTMarketplace.Contract(ctx, { height: transferData.block }, contractAddress);
        let from = owners.get(transferData.from);
        if (from == null) {
            from = new model_1.Owner({ id: transferData.from, balance: 0n });
            owners.set(from.id, from);
        }
        let to = owners.get(transferData.to);
        if (to == null) {
            to = new model_1.Owner({ id: transferData.to, balance: 0n });
            owners.set(to.id, to);
        }
        const tokenIdString = transferData.tokenId.toString();
        let token = tokens.get(tokenIdString);
        let tokenURI = "";
        try {
            tokenURI = await contract.tokenURI(ethers_1.BigNumber.from(transferData.tokenId));
        }
        catch (error) {
            ctx.log.warn(`[API] Error during fetch tokenURI of ${tokenIdString}`);
            if (error instanceof Error)
                ctx.log.warn(`${error.message}`);
        }
        if (token == null) {
            token = new model_1.Token({
                id: tokenIdString,
                uri: tokenURI,
                contract: await getOrCreateContractEntity(ctx.store),
            });
            tokens.set(token.id, token);
        }
        token.owner = to;
        const { id, block, transactionHash, timestamp, price } = transferData;
        const transfer = new model_1.Transfer({
            id,
            block,
            timestamp,
            transactionHash,
            from,
            to,
            price,
            token,
        });
        transfers.add(transfer);
    }
    await ctx.store.save([...owners.values()]);
    await ctx.store.save([...tokens.values()]);
    await ctx.store.save([...transfers]);
}
//# sourceMappingURL=processor.js.map