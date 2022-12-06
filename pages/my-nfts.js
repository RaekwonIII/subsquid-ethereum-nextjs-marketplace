import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

const auth =
'Basic ' + Buffer.from(process.env. NEXT_PUBLIC_IPFS_PROJECT_ID + ':' + process.env. NEXT_PUBLIC_IPFS_PROJECT_SECRET).toString('base64');

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const owner = await (await signer.getAddress()).toLowerCase();

    const headers = {
      'content-type': 'application/json',
    };
    const requestBody = {
      query: `query MyQuery ($owner: String!){
        tokens(orderBy: id_ASC, where: {AND: [
          {owner: { id_eq: $owner }}, 
          {forSale_eq: false}
        ]}) {
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
      variables: { owner }
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
          owner: i.owner.id,
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
  function listNFT(nft) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}