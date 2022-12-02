"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateContractEntity = void 0;
const typeorm_store_1 = require("@subsquid/typeorm-store");
const evm_processor_1 = require("@subsquid/evm-processor");
const NFTMarketplace_1 = require("./abi/NFTMarketplace");
const model_1 = require("./model");
const typeorm_1 = require("typeorm");
const ethers_1 = require("ethers");
const contractAddress = process.env.MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000';
const processor = new evm_processor_1.EvmBatchProcessor()
    .setDataSource({
    chain: "https://goerli.infura.io/v3/2a1be98f319e4b059b85f853a140b315",
    archive: 'http://goerli.archive.subsquid.io/', //process.env.ARCHIVE_URL || 'http://goerli.archive.subsquid.io/',
})
    .addLog("0xF6a9720a7900409f7C3cffda3436D3E9901838A7" //contractAddress
, {
    filter: [
        [NFTMarketplace_1.events.Transfer.topic],
        [NFTMarketplace_1.events.MarketItemCreated.topic]
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
    const marketData = [];
    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.kind === "evmLog") {
                if (item.address === contractAddress) {
                    if (item.evmLog.topics[0] === NFTMarketplace_1.events.Transfer.topic) {
                        //   const transfer = handleTransfers({
                        //     ...ctx,
                        //     block: block.header,
                        //     ...item,
                        //   });
                        //   transfersData.push(transfer);
                        ctx.log.info("Transfer data found: ");
                        ctx.log.info(item.evmLog.data);
                    }
                    if (item.evmLog.topics[0] === NFTMarketplace_1.events.MarketItemCreated.topic) {
                        // const marketItem = handleMarketItems({
                        //   ...ctx,
                        //   block: block.header,
                        //   ...item,
                        // });
                        // marketData.push(marketItem);
                        ctx.log.info("Market item created: ");
                        ctx.log.info(item.evmLog.data);
                    }
                }
            }
        }
    }
    // await saveTransfers({
    //   ...ctx,
    //   block: ctx.blocks[ctx.blocks.length - 1].header,
    // }, transfersData);
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
function handleTransfers(ctx) {
    const { evmLog, transaction, block } = ctx;
    const addr = evmLog.address.toLowerCase();
    const { from, to, tokenId } = NFTMarketplace_1.events.Transfer.decode(evmLog);
    const transfer = {
        id: `${transaction.hash}-${addr}-${tokenId.toBigInt()}-${evmLog.index}`,
        tokenId: tokenId.toBigInt(),
        from,
        to,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: transaction.hash,
    };
    return transfer;
}
function handleMarketItems(ctx) {
    const marketData = {
        id: "",
        from: "",
        to: "",
        tokenId: 0n,
        timestamp: 0n,
        block: 0,
        transactionHash: ""
    };
    return marketData;
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
        const contract = new NFTMarketplace_1.Contract(ctx, { height: transferData.block }, contractAddress);
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
        const { id, block, transactionHash, timestamp } = transferData;
        const transfer = new model_1.Transfer({
            id,
            block,
            timestamp,
            transactionHash,
            from,
            to,
            price: 0n,
            token,
        });
        transfers.add(transfer);
    }
    await ctx.store.save([...owners.values()]);
    await ctx.store.save([...tokens.values()]);
    await ctx.store.save([...transfers]);
}
//# sourceMappingURL=processor.js.map