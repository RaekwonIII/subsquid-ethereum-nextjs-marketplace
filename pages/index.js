import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const headers = {
      'content-type': 'application/json',
    };
    const requestBody = {
      query: `query MyQuery{
        tokens(orderBy: id_ASC, where: {forSale_eq: true}
        ) {
          description
          forSale
          id
          imageURI
          name
          price
          uri
          owner {
            id
          }
        }
      }`,
    };
    const options = {
      method: 'POST',
      url: process.env.NEXT_PUBLIC_SQUID_URL,
      headers,
      data: requestBody
    };

    try {
      const response = await axios(options);

      const squiditems = await Promise.all(response.data.data.tokens.map(async i => {
        let item = {
          price: ethers.utils.formatUnits(i.price, 'ether'),
          tokenId: Number(i.id),
          owner: i.owner?.id || "",
          image: i.imageURI,
          tokenURI: i.uri,
          name: i.name,
          description: i.description,
        }
        return item
      }))
      setNfts(squiditems)
      setLoadingState('loaded') 
    }
    catch (err) {
      console.log('ERROR DURING AXIOS REQUEST', err);
    }
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}