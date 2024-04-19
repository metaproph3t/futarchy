import { initializeProposal, daoTreasury, META, autocratProgram, dao, initializeVault, USDC } from "./main";
import * as anchor from "@coral-xyz/anchor";
import { MEMO_PROGRAM_ID } from "@solana/spl-memo";
import * as token from "@solana/spl-token";

const { PublicKey, Keypair, SystemProgram } = anchor.web3;
const { BN, Program } = anchor;

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const payer = provider.wallet["payer"];


async function main() {
  const storedDAO = await autocratProgram.account.dao.fetch(dao);
  console.log(storedDAO);

  // least signficant 32 bits of nonce are proposal number
  // most significant bit of nonce is 0 for base and 1 for quote

  let baseNonce = new BN(storedDAO.proposalCount+5);

  const baseVault = await initializeVault(daoTreasury, META, baseNonce);
  console.log(baseVault);

  const quoteVault = await initializeVault(
    daoTreasury,
    USDC,
    baseNonce.or(new BN(1).shln(63))
  );
  console.log(quoteVault);
//   const senderAcc = await token.getOrCreateAssociatedTokenAccount(
//     provider.connection,
//     payer,
//     META,
//     daoTreasury,
//     true
//   );

//   const receiverAcc = await token.getOrCreateAssociatedTokenAccount(
//     provider.connection,
//     payer,
//     META,
//     PANTERA_PUBKEY,
//     true
//   );

//   const transferIx = token.createTransferInstruction(
//     senderAcc.address,
//     receiverAcc.address,
//     daoTreasury,
//     1_000 * 1_000_000_000 // 1,000 META
//   );

//   const ix = {
//     programId: transferIx.programId,
//     accounts: transferIx.keys,
//     data: transferIx.data,
//   };

//   await initializeProposal(ix, "https://hackmd.io/@0xNallok/Hy2WJ46op");
}

main();
