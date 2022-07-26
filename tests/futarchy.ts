import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Futarchy } from "../target/types/futarchy";

describe("futarchy", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Futarchy as Program<Futarchy>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    assert.fail();
  });
});
