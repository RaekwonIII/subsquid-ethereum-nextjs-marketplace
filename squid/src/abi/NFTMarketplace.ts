import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './NFTMarketplace.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    Approval: new LogEvent<([owner: string, approved: string, tokenId: ethers.BigNumber] & {owner: string, approved: string, tokenId: ethers.BigNumber})>(
        abi, '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
    ),
    ApprovalForAll: new LogEvent<([owner: string, operator: string, approved: boolean] & {owner: string, operator: string, approved: boolean})>(
        abi, '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31'
    ),
    MarketItemCreated: new LogEvent<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>(
        abi, '0xb640004f1d14576d0c209e240cad0410e0d8c0c33a09375861fbadae2588a98d'
    ),
    Transfer: new LogEvent<([from: string, to: string, tokenId: ethers.BigNumber] & {from: string, to: string, tokenId: ethers.BigNumber})>(
        abi, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    ),
}

export const functions = {
    approve: new Func<[to: string, tokenId: ethers.BigNumber], {to: string, tokenId: ethers.BigNumber}, []>(
        abi, '0x095ea7b3'
    ),
    balanceOf: new Func<[owner: string], {owner: string}, ethers.BigNumber>(
        abi, '0x70a08231'
    ),
    createMarketSale: new Func<[tokenId: ethers.BigNumber], {tokenId: ethers.BigNumber}, []>(
        abi, '0xbe9af536'
    ),
    createToken: new Func<[tokenURI: string, price: ethers.BigNumber], {tokenURI: string, price: ethers.BigNumber}, ethers.BigNumber>(
        abi, '0x72b3b620'
    ),
    fetchItemsListed: new Func<[], {}, Array<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>>(
        abi, '0x45f8fa80'
    ),
    fetchMarketItems: new Func<[], {}, Array<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>>(
        abi, '0x0f08efe0'
    ),
    fetchMyNFTs: new Func<[], {}, Array<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>>(
        abi, '0x202e3740'
    ),
    getApproved: new Func<[tokenId: ethers.BigNumber], {tokenId: ethers.BigNumber}, string>(
        abi, '0x081812fc'
    ),
    getListingPrice: new Func<[], {}, ethers.BigNumber>(
        abi, '0x12e85585'
    ),
    isApprovedForAll: new Func<[owner: string, operator: string], {owner: string, operator: string}, boolean>(
        abi, '0xe985e9c5'
    ),
    name: new Func<[], {}, string>(
        abi, '0x06fdde03'
    ),
    ownerOf: new Func<[tokenId: ethers.BigNumber], {tokenId: ethers.BigNumber}, string>(
        abi, '0x6352211e'
    ),
    resellToken: new Func<[tokenId: ethers.BigNumber, price: ethers.BigNumber], {tokenId: ethers.BigNumber, price: ethers.BigNumber}, []>(
        abi, '0xe219fc75'
    ),
    'safeTransferFrom(address,address,uint256)': new Func<[from: string, to: string, tokenId: ethers.BigNumber], {from: string, to: string, tokenId: ethers.BigNumber}, []>(
        abi, '0x42842e0e'
    ),
    'safeTransferFrom(address,address,uint256,bytes)': new Func<[from: string, to: string, tokenId: ethers.BigNumber, data: string], {from: string, to: string, tokenId: ethers.BigNumber, data: string}, []>(
        abi, '0xb88d4fde'
    ),
    setApprovalForAll: new Func<[operator: string, approved: boolean], {operator: string, approved: boolean}, []>(
        abi, '0xa22cb465'
    ),
    supportsInterface: new Func<[interfaceId: string], {interfaceId: string}, boolean>(
        abi, '0x01ffc9a7'
    ),
    symbol: new Func<[], {}, string>(
        abi, '0x95d89b41'
    ),
    tokenURI: new Func<[tokenId: ethers.BigNumber], {tokenId: ethers.BigNumber}, string>(
        abi, '0xc87b56dd'
    ),
    transferFrom: new Func<[from: string, to: string, tokenId: ethers.BigNumber], {from: string, to: string, tokenId: ethers.BigNumber}, []>(
        abi, '0x23b872dd'
    ),
    updateListingPrice: new Func<[_listingPrice: ethers.BigNumber], {_listingPrice: ethers.BigNumber}, []>(
        abi, '0xae677aa3'
    ),
}

export class Contract extends ContractBase {

    balanceOf(owner: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.balanceOf, [owner])
    }

    fetchItemsListed(): Promise<Array<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>> {
        return this.eth_call(functions.fetchItemsListed, [])
    }

    fetchMarketItems(): Promise<Array<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>> {
        return this.eth_call(functions.fetchMarketItems, [])
    }

    fetchMyNFTs(): Promise<Array<([tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean] & {tokenId: ethers.BigNumber, seller: string, owner: string, price: ethers.BigNumber, sold: boolean})>> {
        return this.eth_call(functions.fetchMyNFTs, [])
    }

    getApproved(tokenId: ethers.BigNumber): Promise<string> {
        return this.eth_call(functions.getApproved, [tokenId])
    }

    getListingPrice(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.getListingPrice, [])
    }

    isApprovedForAll(owner: string, operator: string): Promise<boolean> {
        return this.eth_call(functions.isApprovedForAll, [owner, operator])
    }

    name(): Promise<string> {
        return this.eth_call(functions.name, [])
    }

    ownerOf(tokenId: ethers.BigNumber): Promise<string> {
        return this.eth_call(functions.ownerOf, [tokenId])
    }

    supportsInterface(interfaceId: string): Promise<boolean> {
        return this.eth_call(functions.supportsInterface, [interfaceId])
    }

    symbol(): Promise<string> {
        return this.eth_call(functions.symbol, [])
    }

    tokenURI(tokenId: ethers.BigNumber): Promise<string> {
        return this.eth_call(functions.tokenURI, [tokenId])
    }
}
