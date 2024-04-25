import * as anchor from "@coral-xyz/anchor";
import { AutocratClient } from "../app/src/AutocratClient";
import { DEAN_DEVNET, DEVNET_MUSDC, FUTURE_DEVNET, META } from "./consts";

let autocratClient: AutocratClient = AutocratClient.createClient({
  provider: anchor.AnchorProvider.env(),
});

async function main() {
  let dean = await autocratClient.initializeDao(
    DEAN_DEVNET,
    0.0009,
    100_000,
    100,
    DEVNET_MUSDC
  );
  let meta = await autocratClient.initializeDao(META, 500, 5, 2500, DEVNET_MUSDC);
  let future = await autocratClient.initializeDao(
    FUTURE_DEVNET,
    0.0007,
    500_000,
    500,
    DEVNET_MUSDC
  );

  console.log("Dean's List: ", dean);
  console.log("MetaDAO: ", meta);
  console.log("Future DAO: ", future);
}

main();
