"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa"; // Import the check circle icon
import HomeComponent from "./components/HomeComponent";

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-gray-100 flex">
      {/* Left Side: Image */}
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/lot-pic-2.png"
            alt="Lottery"
            width={700} // Adjusted width for the image
            height={700} // Adjusted height for the image
            layout="intrinsic" // Use intrinsic to maintain image ratio
          />
        </div>
      </div>

      {/* Right Side: Text and Components */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 rounded-lg">

        <div className="flex flex-col gap-4 items-center text-center">
          {publicKey ? (
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-800 via-purple-800 to-pink-800 flex items-center justify-center">
              Wallet connected successfully
              <FaCheckCircle className="ml-2 text-green-500 text-xl rounded-full" />
            </h2>
          ) : (
            <h2 className="text-xl font-semibold text-red-600">
              Please connect your wallet to continue
            </h2>
          )}
        </div>

        <div className="w-full">
          <HomeComponent />
        </div>
      </div>
    </main>
  );
}