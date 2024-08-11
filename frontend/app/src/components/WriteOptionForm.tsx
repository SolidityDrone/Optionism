/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import { OptionismABI, OptionismAddress } from '@/abi/optionism';
import { mockUSDCABI, mockUSDCAddress } from '@/abi/ierc20';
import {
    useWaitForTransactionReceipt,
    useWriteContract,
    useAccount
} from 'wagmi';

interface OptionFormProps {
    selectedPriceId: string | null;
    selectedName: string | null;
    expo: string;
}

const OptionForm: React.FC<OptionFormProps> = ({ selectedPriceId, selectedName, expo }) => {
    const account = useAccount();
    const user = account.address;
    const [maxPayout, setMaxPayout] = useState<string>('');
    const [strikePrice, setStrikePrice] = useState<string>('');
    const [premiumCost, setPremiumCost] = useState<string>('');
    const [isCall, setIsCall] = useState<boolean>(true);
    const [shares, setShares] = useState<string>('');
    const [expiry, setExpiry] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [currentAllowance, setCurrentAllowance] = useState<string>('');
    const [txing, setTxing] = useState<boolean>(false);
    const [phase, setPhase] = useState<number>(0);

    const {
        data: approvalTxHash,
        isPending: isApprovalPending,
        error: approvalError,
        writeContract: writeApprovalContract,
    } = useWriteContract();

    const {
        data: optionTxHash,
        isPending: isOptionPending,
        error: optionError,
        writeContract: writeOptionContract,
    } = useWriteContract();
    
    // Removed the commented out code as it's not being used
    // const { data: allowance } = useReadContract({
    //     address: mockUSDCAddress,
    //     abi: mockUSDCABI,
    //     functionName: 'allowance',
    //     args: [user as `0x${string}`, OptionismAddress as `0x${string}`]
    // });

    const { isLoading: isOptionConfirming, isSuccess: isOptionConfirmed } = useWaitForTransactionReceipt({ hash: optionTxHash });
    const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({ hash: approvalTxHash });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const formattedMaxPayout = (parseFloat(maxPayout) * 1e6).toString();
        const expoWiseStrikePrice = parseFloat(strikePrice) / Math.pow(10, parseInt(expo));
        const formattedPremiumCost = (parseFloat(premiumCost) * 1e6).toString();

        if (phase === 1 && isApprovalConfirmed) {
            timeoutId = setTimeout(() => {
                setPhase(2);
                console.log("app confirmed, setphase2");
                try {
                    writeOptionContract({
                        address: OptionismAddress,
                        abi: OptionismABI,
                        functionName: 'createOption',
                        args: [
                            isCall,
                            BigInt(formattedPremiumCost),
                            BigInt(expoWiseStrikePrice),
                            BigInt(new Date(deadline).getTime() / 1000),
                            BigInt(new Date(expiry).getTime() / 1000),
                            selectedPriceId as `0x${string}`,
                            BigInt(shares),
                            BigInt(formattedMaxPayout),
                        ],
                    });
                } catch (error) {
                    console.error(error);
                }
            }, 3000);
        }

        if (approvalError) {
            setTxing(false);
            setPhase(0);
        }

        return () => clearTimeout(timeoutId); // Clean up timeout
    }, [isApprovalConfirmed, approvalError, phase, maxPayout, strikePrice, premiumCost, deadline, expiry, isCall, shares, selectedPriceId, writeOptionContract, expo]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (phase === 2 && isOptionConfirmed) {
            timeoutId = setTimeout(() => {
                setPhase(0);
                setTxing(false);
                console.log("option confirmed, setphase0");
            }, 3000);
        }

        if (optionError) {
            setTxing(false);
            setPhase(0);
        }

        return () => clearTimeout(timeoutId); // Clean up timeout
    }, [isOptionConfirmed, optionError, phase, isOptionPending]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formattedMaxPayout = (parseFloat(maxPayout) * 1e6).toString();

        try {
            writeApprovalContract({
                address: mockUSDCAddress,
                abi: mockUSDCABI,
                functionName: 'approve',
                args: [OptionismAddress as `0x${string}`, BigInt(formattedMaxPayout) * BigInt(shares)]
            });
            setTxing(true);
            setPhase(1);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setMaxPayout('');
        setStrikePrice('');
        setPremiumCost('');
        setIsCall(true);
        setShares('');
        setExpiry('');
        setDeadline('');
    }, [selectedPriceId]);

    return (
        <div className="fixed top-48 right-14 p-4 w-[340px] border border-gray-600 rounded-lg bg-tv shadow-md">
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Form fields */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-md font-semibold">Write a New Option</h2>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isCall}
                                onChange={() => setIsCall(!isCall)}
                            />
                            <span>{isCall ? 'Call Option' : 'Put Option'}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Premium Cost ($)</label>
                    <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={premiumCost}
                        onChange={(e) => setPremiumCost(e.target.value)}
                        placeholder="Enter premium cost"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Strike Price ($)</label>
                    <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={strikePrice}
                        onChange={(e) => setStrikePrice(e.target.value)}
                        placeholder="Enter strike price"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Expiry Date</label>
                    <input
                        type="datetime-local"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Buy-In Deadline</label>
                    <input
                        type="datetime-local"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Shares</label>
                    <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="Enter number of shares"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Max Payout per Share ($)</label>
                    <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={maxPayout}
                        onChange={(e) => setMaxPayout(e.target.value)}
                        placeholder="Enter max payout per share"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600 text-sm"
                >
                    Write
                </button>
            </form>
            {txing && (
                <div className="fixed top-0 right-0 w-screen h-screen flex items-center justify-center backdrop-blur-[1px] bg-gray-900 bg-opacity-30 z-20">
                    <div className="bg-primary fixed absolute top-50 right-50 items-center text-center text-sm rounded-lg z-20 p-6 h-36 w-80">
                        {(isApprovalPending || isOptionPending) && !optionError ? (
                            <span className="loading loading-color loading-ring text-success mb-4 loading-lg"></span>
                        ) : !optionError ? (
                            <div className="flex mb-2 items-center justify-center">
                                <div
                                    className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center"
                                    style={{
                                        animation: `scaleOpacityAnimation 0.4s ease-out forwards`,
                                        transformOrigin: 'center',
                                        transform: 'scale(0)',
                                        opacity: 0,
                                    }}
                                >
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <style>{`
                                    @keyframes scaleOpacityAnimation {
                                        0% {
                                            transform: scale(0);
                                            opacity: 0;
                                        }
                                        65% {
                                            opacity: 0.5;
                                        }
                                        100% {
                                            transform: scale(0.6);
                                            opacity: 1;
                                        }
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <div className="flex mb-2 items-center justify-center">
                                <div
                                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"
                                    style={{
                                        animation: `scaleOpacityAnimation 0.7s ease-out forwards`,
                                        transformOrigin: 'center',
                                        transform: 'scale(0)',
                                        opacity: 0,
                                    }}
                                >
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <style>{`
                                    @keyframes scaleOpacityAnimation {
                                        0% {
                                            transform: scale(0);
                                            opacity: 0;
                                        }
                                        65% {
                                            opacity: 0.5;
                                        }
                                        100% {
                                            transform: scale(0.6);
                                            opacity: 1;
                                        }
                                    }
                                `}</style>
                            </div>
                        )}

                        {txing && (!isOptionConfirming || !isApprovalConfirming) && !optionError && (isOptionPending || isApprovalPending) && (
                            <div>Waiting for user to confirm . . .</div>
                        )}
                        {(isOptionConfirming || isApprovalConfirming) && !optionError && (
                            <div>Waiting for confirmation...</div>
                        )}

                        {((isOptionConfirmed || isApprovalConfirmed) && !(isOptionPending || isApprovalPending)) && <div>Transaction confirmed.</div>}
                        {(optionTxHash && phase === 2) && (
                            <div className='mt-2'>
                                <a
                                    className='bg-slate-200 border border-slate-400 p-0.5 px-1 rounded-md inline-block'
                                    href={`https://base-sepolia.blockscout.com/tx/${optionTxHash}`}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    View on Explorer
                                </a>
                            </div>
                        )}
                        {(approvalTxHash && phase === 1) && (
                            <div className='mt-2'>
                                <a
                                    className='bg-slate-200 border border-slate-400 p-0.5 px-1 rounded-md inline-block'
                                    href={`https://base-sepolia.blockscout.com/tx/${approvalTxHash}`}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    View on Explorer
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionForm;
