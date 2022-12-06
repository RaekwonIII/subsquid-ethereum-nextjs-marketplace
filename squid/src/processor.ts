import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import {
  EvmBatchProcessor,
  BlockHandlerContext,
  LogHandlerContext,
  TransactionHandlerContext,
} from "@subsquid/evm-processor";
import {
  events,
  functions,
  Contract as ContractAPI,
} from "./abi/NFTMarketplace";
import { Contract, Owner, Token, Transfer } from "./model";
import { In } from "typeorm";
import { BigNumber } from "ethers";
import axios from "axios";

const contractAddress =
  process.env.MARKETPLACE_ADDRESS?.toLowerCase() ||
  "0x0000000000000000000000000000000000000000";

const processor = new EvmBatchProcessor()
  .setDataSource({
    chain: process.env.ETHEREUM_WSS,
    archive: process.env.ARCHIVE_URL || "https://goerli.archive.subsquid.io/",
  })
  .addLog(contractAddress, {
    filter: [[events.MarketItemCreated.topic]],
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
    sighash: functions.createMarketSale.sighash,
    data: {
      transaction: {
        from: true,
        input: true,
        to: true,
      },
    },
  })
  .addTransaction(contractAddress, {
    sighash: functions.resellToken.sighash,
    data: {
      transaction: {
        from: true,
        input: true,
        to: true,
      },
    },
  });
processor.run(new TypeormDatabase(), async (ctx) => {
  const marketItemData: MarketItemData[] = [];

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind === "evmLog" && item.address === contractAddress) {
        if (item.evmLog.topics[0] === events.MarketItemCreated.topic) {
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
        if (
          item.transaction.input.slice(0, 10) ===
          functions.createMarketSale.sighash
        ) {
          ctx.log.info("found createMarketSale transaction!");
          
          const marketItemDatum = handleCreateMarketSaleFunction({
            ...ctx,
            block: block.header,
            ...item,
          });
          marketItemData.push(marketItemDatum);
        }
        if (
          item.transaction.input.slice(0, 10) === functions.resellToken.sighash
        ) {
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

  await saveItems(
    {
      ...ctx,
      block: ctx.blocks[ctx.blocks.length - 1].header,
    },
    marketItemData
  );
});

type MarketItemData = {
  id: string;
  from?: string;
  to?: string;
  tokenId: bigint;
  price?: bigint;
  forSale: boolean;
  timestamp: bigint;
  block: number;
  transactionHash: string;
};

let contractEntity: Contract | undefined;

export async function getOrCreateContractEntity(
  store: Store
): Promise<Contract> {
  if (contractEntity == null) {
    contractEntity = await store.get(Contract, contractAddress);
    if (contractEntity == null) {
      contractEntity = new Contract({
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

function handleCreateMarketSaleFunction(
  ctx: TransactionHandlerContext<
    Store,
    {
      transaction: {
        from: true;
        input: true;
        to: true;
      };
    }
  >
): MarketItemData {
  const { transaction, block } = ctx;

  const { tokenId } = functions.createMarketSale.decode(
    transaction.input
  );
  const transactionHash = transaction.input;
  const addr = transaction.to;

  const marketItem: MarketItemData = {
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

function handleResellTokenFunction(
  ctx: TransactionHandlerContext<
    Store,
    {
      transaction: {
        from: true;
        input: true;
        to: true;
      };
    }
  >
): MarketItemData {
  const { transaction, block } = ctx;

  const { tokenId, price } = functions.resellToken.decode(
    transaction.input
  );

  const transactionHash = transaction.input;
  const addr = transaction.to?.toLowerCase();

  const marketItem: MarketItemData = {
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

function handleMarketItemCreatedEvent(
  ctx: LogHandlerContext<
    Store,
    { evmLog: { topics: true; data: true }; transaction: { hash: true } }
  >
): MarketItemData {
  const { evmLog, transaction, block } = ctx;

  // the owner and seller fields are mislabelled
  // when a MarketItem is created, the "seller" is the owner
  // the NFT is just temporarily transferred to the contract itself
  // I decide to use the `sold` field to distinguish between
  // "my nfts" and "my nfts up for sale", reversing the logic
  const { tokenId, seller, owner, price, sold } =
    events.MarketItemCreated.decode(evmLog);

  const marketItem: MarketItemData = {
    id: "", // `${transaction.hash}-${addr}-${tokenId.toBigInt()}-${evmLog.index}`,
    tokenId: tokenId.toBigInt(),
    to: seller,
    price: price.toBigInt(),
    forSale: !sold, // when the item is created, `sold` is set to false, so it's up for sale
    timestamp: BigInt(block.timestamp),
    block: block.height,
    transactionHash: transaction.hash,
  };

  return marketItem;
}

async function saveItems(
  ctx: BlockHandlerContext<Store>,
  transfersData: MarketItemData[]
) {
  const tokensIds: Set<string> = new Set();
  const ownersIds: Set<string> = new Set();

  for (const transferData of transfersData) {
    tokensIds.add(transferData.tokenId.toString());
    if (transferData.from)
      ownersIds.add(transferData.from.toLowerCase());
    if (transferData.to)
      ownersIds.add(transferData.to.toLowerCase());
  }

  const transfers: Set<Transfer> = new Set();

  const tokens: Map<string, Token> = new Map(
    (await ctx.store.findBy(Token, { id: In([...tokensIds]) })).map((token) => [
      token.id,
      token,
    ])
  );

  const owners: Map<string, Owner> = new Map(
    (await ctx.store.findBy(Owner, { id: In([...ownersIds]) })).map((owner) => [
      owner.id,
      owner,
    ])
  );

  for (const transferData of transfersData) {
    const { id, tokenId, from, to, block, transactionHash, price, forSale, timestamp } = transferData;
    const contract = new ContractAPI(
      ctx,
      { height: block },
      contractAddress
    );

    // the "" case handles absence of sender, which means it's not an actual transaction
    // likely, it's the token being minted and put up for sale
    let fromOwner = owners.get(from || "");
    if (from && fromOwner == null) {
      fromOwner = new Owner({ id: from.toLowerCase() });
      owners.set(fromOwner.id, fromOwner);
    }
    
    // the "" case handles absence of receiver, which means it's not an actual transaction
    // likely it's the token being put up for re-sale
    let toOwner = owners.get(to || "");
    if (to && toOwner == null) {
      toOwner = new Owner({ id: to.toLowerCase() });
      owners.set(toOwner.id, toOwner);
    }

    const tokenIdString = tokenId.toString();

    let token = tokens.get(tokenIdString);

    let tokenURI,
      name,
      description,
      imageURI = "";
    try {
      tokenURI = await contract.tokenURI(BigNumber.from(tokenId));
    } catch (error) {
      ctx.log.warn(`[API] Error during fetch tokenURI of ${tokenIdString}`);
      if (error instanceof Error) ctx.log.warn(`${error.message}`);
    }

    if (tokenURI !== "") {
      // fetch metadata and assign name, description, imageURI
      const meta = await axios.get(tokenURI || "1");

      imageURI = meta.data.image;
      name = meta.data.name;
      description = meta.data.description;
    }

    if (token == null) {
      token = new Token({
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
  
      const transfer = new Transfer({
        id,
        block,
        timestamp,
        transactionHash,
        from: fromOwner,
        to: toOwner,
        price: token.price,
        token,
      });
  
      transfers.add(transfer);}
  }

  await ctx.store.save([...owners.values()]);
  await ctx.store.save([...tokens.values()]);
  await ctx.store.save([...transfers]);
}
