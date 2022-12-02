import { TypeormDatabase } from "@subsquid/typeorm-store";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { events } from './abi/NFTMarketplace'

const processor = new EvmBatchProcessor()
  .setDataSource({
    chain: "https://goerli.infura.io/v3/2a1be98f319e4b059b85f853a140b315",
    archive: 'http://goerli.archive.subsquid.io/', 
  })
  .addLog(
    "0xF6a9720a7900409f7C3cffda3436D3E9901838A7"
  , {
    filter: [
      [events.Transfer.topic],
      [events.MarketItemCreated.topic]
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

processor.run(new TypeormDatabase(), async (ctx) => {

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind === "evmLog") {
        if (item.address === "0xF6a9720a7900409f7C3cffda3436D3E9901838A7") {
          if (item.evmLog.topics[0] === events.Transfer.topic) {
            ctx.log.info("Transfer data found: ")
            ctx.log.info(item.evmLog.data);
          }
          if (item.evmLog.topics[0] === events.MarketItemCreated.topic) {
            ctx.log.info("Market item created: ")
            ctx.log.info(item.evmLog.data);
          }
        }
      }
    }
  }
});
