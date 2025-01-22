"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import HomeComponent from "./components/HomeComponent";
import { WalletButtonImport } from "./components/WalletContextProvider";

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-gray-100 flex">
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/lot-pic-2.png"
            alt="Lottery"
            width={700}
            height={700}
            layout="intrinsic"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 rounded-lg">

        <div className="flex flex-col gap-4 items-center text-center">
          {publicKey ? (
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-800 via-purple-800 to-pink-800 flex items-center justify-center">
              Wallet connected successfully
              <FaCheckCircle className="ml-2 text-green-500 text-xl rounded-full" />
            </h2>
          ) : (
            <WalletButtonImport />
          )}
        </div>

        <div className="w-full">
          <HomeComponent />
        </div>
      </div>
    </main>
  );
}
