import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AddressLookupTableAccount, Keypair, PublicKey } from "@solana/web3.js";

import {
  ConditionalVault,
  IDL as ConditionalVaultIDL,
} from "./types/conditional_vault";

import BN from "bn.js";
import { CONDITIONAL_VAULT_PROGRAM_ID } from "./constants";
import {
  getATA,
  getVaultAddr,
  getVaultFinalizeMintAddr,
  getVaultRevertMintAddr,
} from "./utils";
import { MethodsBuilder } from "@coral-xyz/anchor/dist/cjs/program/namespace/methods";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";

export type CreateClientParams = {
  provider: AnchorProvider;
  conditionalVaultProgramId?: PublicKey;
};

export class ConditionalVaultClient {
  public readonly provider: AnchorProvider;
  public readonly vaultProgram: Program<ConditionalVault>;
  public readonly luts: AddressLookupTableAccount[];

  constructor(
    provider: AnchorProvider,
    conditionalVaultProgramId: PublicKey,
    luts: AddressLookupTableAccount[]
  ) {
    this.provider = provider;
    this.vaultProgram = new Program<ConditionalVault>(
      ConditionalVaultIDL,
      conditionalVaultProgramId,
      provider
    );
    this.luts = luts;
  }

  public static createClient(
    createVaultClientParams: CreateClientParams
  ): ConditionalVaultClient {
    let { provider, conditionalVaultProgramId } = createVaultClientParams;

    const luts: AddressLookupTableAccount[] = [];

    return new ConditionalVaultClient(
      provider,
      conditionalVaultProgramId || CONDITIONAL_VAULT_PROGRAM_ID,
      luts
    );
  }

  async getVault(vault: PublicKey) {
    return this.vaultProgram.account.conditionalVault.fetch(vault);
  }

  async initializeVault(
    settlementAuthority: PublicKey,
    underlyingTokenMint: PublicKey,
    proposal: PublicKey
  ): Promise<PublicKey> {
    const [vault] = getVaultAddr(
      this.vaultProgram.programId,
      settlementAuthority,
      underlyingTokenMint,
      proposal
    );

    await this.initializeVaultIx(
      settlementAuthority,
      underlyingTokenMint,
      proposal
    ).rpc();

    return vault;
  }

  initializeVaultIx(
    settlementAuthority: PublicKey,
    underlyingTokenMint: PublicKey,
    proposal: PublicKey
  ): MethodsBuilder<ConditionalVault, any> {
    const [vault] = getVaultAddr(
      this.vaultProgram.programId,
      settlementAuthority,
      underlyingTokenMint,
      proposal
    );

    const [conditionalOnFinalizeTokenMint] = getVaultFinalizeMintAddr(
      this.vaultProgram.programId,
      vault
    );
    const [conditionalOnRevertTokenMint] = getVaultRevertMintAddr(
      this.vaultProgram.programId,
      vault
    );

    const [vaultUnderlyingTokenAccount] = getATA(underlyingTokenMint, vault);

    return this.vaultProgram.methods
      .initializeConditionalVault(settlementAuthority, proposal)
      .accounts({
        vault,
        underlyingTokenMint,
        vaultUnderlyingTokenAccount,
        conditionalOnFinalizeTokenMint,
        conditionalOnRevertTokenMint,
      })
      .preInstructions([
        createAssociatedTokenAccountIdempotentInstruction(
          this.provider.publicKey,
          vaultUnderlyingTokenAccount,
          vault,
          underlyingTokenMint
        ),
      ]);
  }

  
}
