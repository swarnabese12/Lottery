import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { useProgram } from "./WalletContextProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const PROGRAM_ID = "84pCTFayHs72yMh4jd67f4YX4a6rvSjM46w7pbYvvkUz";
const LOTTERY_SEED = "lottery_wallet";

// Predefined constants
const lotteryAccount = new PublicKey(
  "6caUadVa9xCGRhTAxdzfmPZV3cv3we1WT6mWeyEXvoJQ"
);
const lotteryWallet = new PublicKey(
  "13JV9iLH772643P9GL6eYu18CyqFTBtJqj64j1meK1Si"
);
//const ticketBuyer = new PublicKey("4nKcSX3f8J4tbezLATdqNg4Em8TMjDBF11RWZVsmtQ4s");

const LotteryComponent = () => {
  const { connection } = useConnection();
  const { publicKey }: any = useWallet();
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [buyers, setBuyers] = useState<PublicKey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const program = useProgram();

  const fetchLotteryData = async () => {
    try {
      setLoading(true);
      const lotteryAccountData: any =
        await program.account.lotteryAccount.fetch(lotteryAccount);
      console.log("lotteryAccountData:", lotteryAccountData);

      setTicketPrice(lotteryAccountData.ticketPrice.toString());
      setTicketsSold(lotteryAccountData.ticketsSold.toString());
      setBuyers(lotteryAccountData.buyers);
    } catch (error) {
      console.error("Error fetching lottery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeLottery = async () => {
    setLoading(true);
    try {
      const ticketPriceInLamports = new anchor.BN(1_000_000);

      await program.methods
        .initializeLottery(ticketPriceInLamports)
        .accounts({
          lotteryAccount,
          lotteryWallet,
          payer: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Lottery initialized successfully!");
      fetchLotteryData();
    } catch (error) {
      console.error("Error initializing lottery:", error);
    } finally {
      setLoading(false);
    }
  };

  const buyTicket = async () => {
    setLoading(true);
    try {
      const lotteryWalletBalanceBefore = await connection.getBalance(
        lotteryWallet
      );
      console.log(
        "Lottery wallet balance before: ",
        lotteryWalletBalanceBefore,
        "lamports (",
        lotteryWalletBalanceBefore / 1e9,
        "SOL)"
      );

      await program.methods
        .buyTicket()
        .accounts({
          publicKey,
          lotteryAccount,
          lotteryWallet,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Ticket purchased by:", publicKey.toBase58());
      const lotteryWalletBalanceAfter = await connection.getBalance(
        lotteryWallet
      );
      console.log(
        "Lottery wallet balance before: ",
        lotteryWalletBalanceAfter,
        "lamports (",
        lotteryWalletBalanceAfter / 1e9,
        "SOL)"
      );
      fetchLotteryData();
    } catch (error) {
      console.error("Error purchasing ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const drawWinner = async () => {
    if (buyers.length < 5) {
      console.error("Not enough buyers to select a winner");
      return;
    }

    setLoading(true);
    try {
      const winner = buyers[2]; // Select the third buyer as the winner

      // Fetch initial balances
      const winnerBalanceBefore = await connection.getBalance(winner);
      const lotteryWalletBalanceBefore = await connection.getBalance(
        lotteryWallet
      );

      console.log(
        "Winner's balance before: ",
        winnerBalanceBefore,
        "lamports (",
        winnerBalanceBefore / 1e9,
        "SOL)"
      );
      console.log(
        "Lottery wallet balance before: ",
        lotteryWalletBalanceBefore,
        "lamports (",
        lotteryWalletBalanceBefore / 1e9,
        "SOL)"
      );

      // Draw the winner
      await program.methods
        .drawWinner()
        .accounts({
          lotteryAccount,
          lotteryWallet,
          winner,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch updated balances
      const winnerBalanceAfter = await connection.getBalance(winner);
      const lotteryWalletBalanceAfter = await connection.getBalance(
        lotteryWallet
      );

      console.log(
        "Winner's balance after: ",
        winnerBalanceAfter,
        "lamports (",
        winnerBalanceAfter / 1e9,
        "SOL)"
      );
      console.log(
        "Lottery wallet balance after: ",
        lotteryWalletBalanceAfter,
        "lamports (",
        lotteryWalletBalanceAfter / 1e9,
        "SOL)"
      );

      console.log("Winner drawn:", winner.toBase58());
      fetchLotteryData();
    } catch (error) {
      console.error("Error drawing winner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchLotteryData();
    }
  }, [publicKey]);

  return (
    <div className="relative flex flex-col items-center justify-center space-y-6 p-6 bg-gradient-to-r from-blue-200 to-purple-200 shadow-xl rounded-3xl w-full max-w-lg mx-auto">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-800 via-purple-800 to-pink-800">
        SOL Lottery
      </h1>
  
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-50 z-10">
          <div className="text-white text-lg">
            <div className="flex items-center justify-center space-x-3">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-yellow-400 text-4xl"
              />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      )}
  
      {!ticketPrice ? (
        <button
          onClick={initializeLottery}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
        >
          Initialize Lottery
        </button>
      ) : (
        <div className="space-y-6 w-full">
          {/* Ticket Price Card */}
          <div className="p-4 bg-gradient-to-r from-purple-200 to-red-200 rounded-xl shadow-lg flex items-center justify-between space-x-4 w-full max-w-xs">
            <div className="flex-1">
              <p className="text-lg text-gray-900 font-semibold">Ticket Price</p>
              <p className="text-xl font-bold text-gray-900">
                {ticketPrice / 1_000_000_000} SOL
              </p>
            </div>
          </div>
  
          {/* Tickets Sold Card */}
          <div className="p-4 bg-gradient-to-r from-red-200 to-yellow-200 rounded-xl shadow-lg flex items-center justify-between space-x-4 w-full max-w-xs">
            <div className="flex-1">
              <p className="text-lg text-gray-900 font-semibold">Tickets Sold</p>
              <p className="text-xl font-bold text-gray-900">{ticketsSold}/5</p>
            </div>
          </div>
  
          {/* Buyers Card */}
          <div className="p-4 bg-gradient-to-r from-yellow-200 to-green-200 rounded-xl shadow-lg flex items-center justify-between space-x-4 w-full max-w-xs">
            <div className="flex-1">
              <p className="text-lg text-gray-900 font-semibold">Buyers</p>
              <p className="text-xl font-bold text-gray-900">{buyers.length}</p>
            </div>
          </div>
  
          {/* Buttons Section */}
          <div className="space-y-4">
            {ticketsSold != 5 && (
              <button
                onClick={buyTicket}
                className="w-full bg-gradient-to-r from-purple-700 to-pink-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
              >
               $ Buy Ticket 
              </button>
            )}
            {ticketsSold == 5 && (
              <button
                onClick={drawWinner}
                className="w-full bg-gradient-to-r from-purple-700 to-pink-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
              >
                Draw Winner
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

};

export default LotteryComponent;
