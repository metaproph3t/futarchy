import * as anchor from "@coral-xyz/anchor";
import {
  Metadata,
  deserializeMetadata,
  findMetadataPda,
  mplTokenMetadata,
  createMetadataAccountV3,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  GenericFile,
  createGenericFile,
  keypairIdentity,
  publicKey,
  signerIdentity,
  none,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import { PublicKey } from "@solana/web3.js";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsLegacyTransaction,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";

import fs from "fs";
import { DEVNET_USDC } from "./main";

const uploadedAssetMap: Record<string, string> = {
  fMETA: "https://arweave.net/tGxvOjMZw7B0qHsdCcIMO57oH5g5OaItOZdXo3BXKz8",
  fUSDC: "https://arweave.net/DpvxeAyVbaoivhIVCLjdf566k2SwVn0YVBL0sTOezWk",
  pMETA: "https://arweave.net/iuqi7PRRESdDxj1oRyk2WzR90_zdFcmZsuWicv3XGfs",
  pUSDC: "https://arweave.net/e4IO7F59F_RKCiuB--_ABPot7Qh1yFsGkWzVhcXuKDU",
};

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const payer = provider.wallet["payer"];

const umi = createUmi(provider.connection);
umi.use(keypairIdentity(payer));

export const uploadImageJson = async () => {
  // use bundlr, targeting arweave
  umi.use(bundlrUploader());

  const uri = await umi.uploader.uploadJson({
    name: "USD Coin",
    image: "https://image-cdn.solana.fm/images/?imageUrl=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    symbol: "USDC",
    description: "Not the real USDC",
  });

  console.log(uri);
};

const mint = fromWeb3JsPublicKey(DEVNET_USDC);
const createMetadata = async () => {
    let builder = createMetadataAccountV3(umi, {
    mint,
    mintAuthority: payer,
    data: {
      name: "TOKE",
      symbol: "TOKE",
      uri: "METADATA_URI",
      sellerFeeBasisPoints: 0,
      creators: none(),
      collection: none(),
      uses: none(),
    },
    isMutable: false,
    collectionDetails: none(),
  });
  builder = builder.setBlockhash(
    (await umi.rpc.getLatestBlockhash()).blockhash
  );

  const createMetadataResult = await provider.sendAndConfirm(
    toWeb3JsLegacyTransaction(builder.build(umi)),
    [payer],
    {
      skipPreflight: true,
      commitment: "confirmed",
    }
  );

  console.log(createMetadataResult);
}

createMetadata();

// uploadImageJson();