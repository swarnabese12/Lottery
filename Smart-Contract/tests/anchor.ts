import BN from "bn.js";
import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { LotteryProgram } from "../target/types/lottery_program";
describe("lottery", async () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.LotteryProgram as anchor.Program<LotteryProgram>;
  
  //let program: any = await program;

  // it("Initializes the lottery", async () => {
  //   const ticketPrice = new anchor.BN(1_000_000); // Ticket price in lamports (0.001 SOL)
  //   const lotteryAccount = anchor.web3.Keypair.generate(); // Generate a new keypair for the lottery account

  //   // Derive the PDA for the lottery wallet
  //   const [lotteryWallet, bump] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("lottery_wallet"), lotteryAccount.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   // Call the initializeLottery method
  //   await program.methods
  //     .initializeLottery(ticketPrice)
  //     .accounts({
  //       lotteryAccount: lotteryAccount.publicKey,
  //       lotteryWallet, // Pass the derived PDA
  //       payer: program.provider.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([lotteryAccount]) // Include the lottery account as a signer
  //     .rpc();

  //   // Fetch the updated lottery account state
  //   const account = await program.account.lotteryAccount.fetch(
  //     lotteryAccount.publicKey
  //   );

  //   // Log the details of the initialized lottery
  //   console.log(
  //     "Lottery Account Public Key:",
  //     lotteryAccount.publicKey.toBase58()
  //   );
  //   console.log("Lottery Wallet (PDA):", lotteryWallet.toBase58());
  //   console.log(
  //     "Lottery Ticket Price:",
  //     account.ticketPrice.toString(),
  //     "LAMPORTS"
  //   );
  //   console.log("Tickets Sold:", account.ticketsSold.toString());

  //   // Ensure the initialized values are as expected
  //   assert.strictEqual(account.ticketPrice.toString(), ticketPrice.toString());
  //   assert.strictEqual(account.ticketsSold, 0);
  //   assert.deepStrictEqual(
  //     account.lotteryWallet.toBase58(),
  //     lotteryWallet.toBase58()
  //   );
  // });

  it("Buys a lottery ticket", async () => {
    const buyer = pg.wallet;

    // Lottery account and wallet public keys
    const lotteryAccountPublicKey = new anchor.web3.PublicKey(
      "56Dc2NNkT3MLPi8Szfh7g5pzFmHsXc81jsWUSNfiWQVJ"
    );
    const lotteryWalletPublicKey = new anchor.web3.PublicKey(
      "yfPZ63ZXhQKMQMQcsdBcp3HEELgHeJFUWqSkbz8PRP4"
    );

    // Fetch the current state of the lottery account
    const lotteryAccount = await program.account.lotteryAccount.fetch(
      lotteryAccountPublicKey
    );

    console.log(
      "Lottery Account Ticket Count (Before Purchase):",
      lotteryAccount.ticketsSold.toString()
    );
    console.log("Buyer Public Key:", buyer.publicKey.toString());

    // Fetch initial balances
    const buyerInitialBalance = await program.provider.connection.getBalance(buyer.publicKey);
    const lotteryWalletInitialBalance = await program.provider.connection.getBalance(
      lotteryWalletPublicKey
    );

    console.log("Buyer Initial Balance:", buyerInitialBalance, "LAMPORTS");
    console.log(
      "Lottery Wallet Initial Balance:",
      lotteryWalletInitialBalance,
      "LAMPORTS"
    );

    // Call the `buy_ticket` function
    await program.methods
      .buyTicket()
      .accounts({
        lotteryAccount: lotteryAccountPublicKey, // Lottery account public key
        lotteryWallet: lotteryWalletPublicKey, // Lottery wallet PDA public key
        ticketBuyer: buyer.publicKey, // Buyer's public key
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch updated balances
    const buyerFinalBalance = await program.provider.connection.getBalance(buyer.publicKey);
    const lotteryWalletFinalBalance = await program.provider.connection.getBalance(
      lotteryWalletPublicKey
    );

    console.log("Buyer Final Balance:", buyerFinalBalance, "LAMPORTS");
    console.log(
      "Lottery Wallet Final Balance:",
      lotteryWalletFinalBalance,
      "LAMPORTS"
    );

    // Fetch the updated lottery account to check ticket count
    const updatedLotteryAccount = await program.account.lotteryAccount.fetch(
      lotteryAccountPublicKey
    );

    console.log(
      "Updated Ticket Count:",
      updatedLotteryAccount.ticketsSold.toString()
    );
    console.log("Buyers List:", updatedLotteryAccount.buyers.toString());

    // Assertions to validate the functionality
    // assert.strictEqual(
    //   updatedLotteryAccount.ticketsSold,
    //   lotteryAccount.ticketsSold + 1
    // );
    // assert.deepStrictEqual(
    //   updatedLotteryAccount.buyers[updatedLotteryAccount.ticketsSold - 1],
    //   buyer.publicKey
    // );
    // assert.strictEqual(
    //   lotteryWalletFinalBalance,
    //   lotteryWalletInitialBalance + lotteryAccount.ticketPrice
    // );
  });

  // it("Draws a lottery winner", async () => {
  //   const lotteryAccountPublicKey = new anchor.web3.PublicKey(
  //     "56Dc2NNkT3MLPi8Szfh7g5pzFmHsXc81jsWUSNfiWQVJ"
  //   );
  //   const lotteryWalletPublicKey = new anchor.web3.PublicKey(
  //     "yfPZ63ZXhQKMQMQcsdBcp3HEELgHeJFUWqSkbz8PRP4"
  //   );

  //   // Fetch the lottery account to validate initial state
  //   const lotteryAccount = await program.account.lotteryAccount.fetch(
  //     lotteryAccountPublicKey
  //   );

  //   console.log("Tickets Sold Before Draw:", lotteryAccount.ticketsSold);
  //   console.log("Buyers List:", lotteryAccount.buyers.toString());

  //   // Ensure enough tickets are sold before drawing a winner
  //   if (lotteryAccount.ticketsSold < 5) {
  //     throw new Error("Not enough tickets sold to draw a winner.");
  //   }

  //   // Winner's initial balance
  //   const winnerInitialBalance = await program.provider.connection.getBalance(
  //     program.provider.publicKey
  //   );
  //   console.log(
  //     "Winner Balance Before Draw:",
  //     winnerInitialBalance,
  //     "LAMPORTS"
  //   );

  //   // Draw a winner
  //   await program.methods
  //     .drawWinner()
  //     .accounts({
  //       lotteryWallet: lotteryWalletPublicKey,
  //       lotteryAccount: lotteryAccountPublicKey,
  //       winner: program.provider.publicKey, // Assuming the test wallet is the winner
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .rpc();

  //   const winnerFinalBalance = await program.provider.connection.getBalance(
  //     program.provider.publicKey
  //   );

  //   console.log("Winner Balance After Draw:", winnerFinalBalance, "LAMPORTS");

  //   const updatedLotteryAccount = await program.account.lotteryAccount.fetch(
  //     lotteryAccountPublicKey
  //   );

  //   console.log("Tickets Sold After Draw:", updatedLotteryAccount.ticketsSold);
  //   console.log("Buyers List After Draw:", updatedLotteryAccount.buyers);

  //   console.log("Lottery draw completed successfully.");
  // });
});

function base58Decode(base58) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const base = 58;

  let decoded = BigInt(0);
  for (let char of base58) {
    const index = alphabet.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base58 character: ${char}`);
    decoded = decoded * BigInt(base) + BigInt(index);
  }

  // Convert BigInt to Uint8Array
  const bytes = [];
  while (decoded > 0) {
    bytes.push(Number(decoded % BigInt(256)));
    decoded = decoded / BigInt(256);
  }
  return new Uint8Array(bytes.reverse());
}
