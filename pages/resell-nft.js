import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!id) return
    const meta = await axios.get(tokenURI)

    const headers = {
      'content-type': 'application/json',
    };
    const requestBody = {
      query: `query MyQuery ($id: String!) {
        tokens(where: {id_eq: $id}) {
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
      }
      `,
      variables: { id }
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
      updateFormInput(state => ({ ...state, image: squiditems[0].image }))
    }
    catch (err) {
      console.log('ERROR DURING AXIOS REQUEST', err);
    }

  }

  async function listNFTForSale() {
    if (!price) return
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
  )
}