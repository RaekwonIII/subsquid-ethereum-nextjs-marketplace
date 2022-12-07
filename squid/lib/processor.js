"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateContractEntity = void 0;
const typeorm_store_1 = require("@subsquid/typeorm-store");
const evm_processor_1 = require("@subsquid/evm-processor");
const NFTMarketplace_1 = require("./abi/NFTMarketplace");
const model_1 = require("./model");
const typeorm_1 = require("typeorm");
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS?.toLowerCase() ||
    "0x0000000000000000000000000000000000000000";
console.log("Indexing: ", contractAddress);
console.log("On the archive: ", process.env.ARCHIVE_URL);
const processor = new evm_processor_1.EvmBatchProcessor()
    .setDataSource({
    chain: process.env.ETHEREUM_WSS,
    archive: process.env.ARCHIVE_URL || "https://goerli.archive.subsquid.io/",
})
    .addLog(contractAddress, {
    filter: [[NFTMarketplace_1.events.MarketItemCreated.topic]],
    data: {
        evmLog: {
            topics: true,
            data: true,
        },
        transaction: {
            hash: true,
        },
    },
})
    .addTransaction(contractAddress, {
    sighash: NFTMarketplace_1.functions.createMarketSale.sighash,
    data: {
        transaction: {
            from: true,
            input: true,
            to: true,
        },
    },
})
    .addTransaction(contractAddress, {
    sighash: NFTMarketplace_1.functions.resellToken.sighash,
    data: {
        transaction: {
            from: true,
            input: true,
            to: true,
        },
    },
});
processor.run(new typeorm_store_1.TypeormDatabase(), async (ctx) => {
    const marketItemData = [];
    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.kind === "evmLog" && item.address === contractAddress) {
                if (item.evmLog.topics[0] === NFTMarketplace_1.events.MarketItemCreated.topic) {
                    ctx.log.info("found MarketItemCreated Event!");
                    const marketItemDatum = handleMarketItemCreatedEvent({
                        ...ctx,
                        block: block.header,
                        ...item,
                    });
                    marketItemData.push(marketItemDatum);
                }
            }
            if (item.kind === "transaction" && item.address === contractAddress) {
                if (item.transaction.input.slice(0, 10) ===
                    NFTMarketplace_1.functions.createMarketSale.sighash) {
                    ctx.log.info("found createMarketSale transaction!");
                    const marketItemDatum = handleCreateMarketSaleFunction({
                        ...ctx,
                        block: block.header,
                        ...item,
                    });
                    marketItemData.push(marketItemDatum);
                }
                if (item.transaction.input.slice(0, 10) === NFTMarketplace_1.functions.resellToken.sighash) {
                    ctx.log.info("found resellToken transaction!");
                    const marketItemDatum = handleResellTokenFunction({
                        ...ctx,
                        block: block.header,
                        ...item,
                    });
                    marketItemData.push(marketItemDatum);
                }
            }
        }
    }
    await saveItems({
        ...ctx,
        block: ctx.blocks[ctx.blocks.length - 1].header,
    }, marketItemData);
});
let contractEntity;
async function getOrCreateContractEntity(store) {
    if (contractEntity == null) {
        contractEntity = await store.get(model_1.Contract, contractAddress);
        if (contractEntity == null) {
            contractEntity = new model_1.Contract({
                id: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
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
function handleCreateMarketSaleFunction(ctx) {
    const { transaction, block } = ctx;
    const { tokenId } = NFTMarketplace_1.functions.createMarketSale.decode(transaction.input);
    const transactionHash = transaction.input;
    const addr = transaction.to;
    const marketItem = {
        id: `${transactionHash}-${addr}-${tokenId.toBigInt()}-${transaction.index}`,
        tokenId: tokenId.toBigInt(),
        to: transaction.from || "",
        forSale: false,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: transaction.input,
    };
    return marketItem;
}
function handleResellTokenFunction(ctx) {
    const { transaction, block } = ctx;
    const { tokenId, price } = NFTMarketplace_1.functions.resellToken.decode(transaction.input);
    const transactionHash = transaction.input;
    const addr = transaction.to?.toLowerCase();
    const marketItem = {
        id: `${transactionHash}-${addr}-${tokenId.toBigInt()}-${transaction.index}`,
        tokenId: tokenId.toBigInt(),
        price: price.toBigInt(),
        forSale: true,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: transaction.input,
    };
    return marketItem;
}
function handleMarketItemCreatedEvent(ctx) {
    const { evmLog, transaction, block } = ctx;
    // the owner and seller fields are mislabelled
    // when a MarketItem is created, the "seller" is the owner
    // the NFT is just temporarily transferred to the contract itself
    // I decide to use the `sold` field to distinguish between
    // "my nfts" and "my nfts up for sale", reversing the logic
    const { tokenId, seller, owner, price, sold } = NFTMarketplace_1.events.MarketItemCreated.decode(evmLog);
    const marketItem = {
        id: "",
        tokenId: tokenId.toBigInt(),
        to: seller,
        price: price.toBigInt(),
        forSale: !sold,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: transaction.hash,
    };
    return marketItem;
}
async function saveItems(ctx, transfersData) {
    const tokensIds = new Set();
    const ownersIds = new Set();
    for (const transferData of transfersData) {
        tokensIds.add(transferData.tokenId.toString());
        if (transferData.from)
            ownersIds.add(transferData.from.toLowerCase());
        if (transferData.to)
            ownersIds.add(transferData.to.toLowerCase());
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
        const { id, tokenId, from, to, block, transactionHash, price, forSale, timestamp, } = transferData;
        const contract = new NFTMarketplace_1.Contract(ctx, { height: block }, contractAddress);
        // the "" case handles absence of sender, which means it's not an actual transaction
        // likely, it's the token being minted and put up for sale
        let fromOwner = owners.get(from || "");
        if (from && fromOwner == null) {
            fromOwner = new model_1.Owner({ id: from.toLowerCase() });
            owners.set(fromOwner.id, fromOwner);
        }
        // the "" case handles absence of receiver, which means it's not an actual transaction
        // likely it's the token being put up for re-sale
        let toOwner = owners.get(to || "");
        if (to && toOwner == null) {
            toOwner = new model_1.Owner({ id: to.toLowerCase() });
            owners.set(toOwner.id, toOwner);
        }
        const tokenIdString = tokenId.toString();
        let token = tokens.get(tokenIdString);
        let tokenURI, name, description, imageURI = "";
        try {
            tokenURI = await contract.tokenURI(ethers_1.BigNumber.from(tokenId));
        }
        catch (error) {
            ctx.log.warn(`[API] Error during fetch tokenURI of ${tokenIdString}`);
            if (error instanceof Error)
                ctx.log.warn(`${error.message}`);
        }
        if (tokenURI !== "") {
            // fetch metadata and assign name, description, imageURI
            const meta = await axios_1.default.get(tokenURI || "1");
            imageURI = meta.data.image;
            name = meta.data.name;
            description = meta.data.description;
        }
        if (token == null) {
            token = new model_1.Token({
                id: tokenIdString,
                uri: tokenURI,
                name,
                description,
                imageURI,
                price,
                contract: await getOrCreateContractEntity(ctx.store),
            });
            tokens.set(token.id, token);
        }
        token.owner = toOwner;
        token.forSale = forSale;
        token.price = price || token.price; // change the price ONLY if changed by function/event
        if (toOwner && fromOwner) {
            const transfer = new model_1.Transfer({
                id,
                block,
                timestamp,
                transactionHash,
                from: fromOwner,
                to: toOwner,
                price: token.price,
                token,
            });
            transfers.add(transfer);
        }
    }
    await ctx.store.save([...owners.values()]);
    await ctx.store.save([...tokens.values()]);
    await ctx.store.save([...transfers]);
}
//# sourceMappingURL=processor.js.map