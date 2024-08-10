"use client";
import React, { useState, useEffect } from 'react';
import TransactionModal from '@/components/TransactionModal'; // import the Modal component
import { OptionismABI, OptionismAddress } from '@/abi/optionism';
import { mockUSDCABI, mockUSDCAddress } from '@/abi/ierc20';
import {
    useWaitForTransactionReceipt,
    useWriteContract,
    useAccount,
    useReadContract
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

    const {
        data: approvalTxHash,
        isPending: isApprovalPending,
        error: approvalError,
        writeContract: writeApprovalContract,
    } = useWriteContract();

    const {
        data: hash,
        isPending: isOptionPending,
        error: optionError,
        writeContract: writeOptionContract,
    } = useWriteContract();

    const { data: allowance } = useReadContract({
        address: mockUSDCAddress,
        abi: mockUSDCABI,
        functionName: 'allowance',
        args: [user as `0x${string}`, OptionismAddress as `0x${string}`]
    });
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        setCurrentAllowance(allowance?.toString() || '0');
    }, [allowance]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isConfirming || isOptionPending) {
            setTxing(true);
        }

        if (isConfirmed||optionError) {
            // Set a 3-second delay before setting txing to false
            timeoutId = setTimeout(() => {
                setTxing(false);
            }, 3000);
        }

        // Clean up the timeout if the component unmounts or the effect re-runs
        return () => clearTimeout(timeoutId);
    }, [isConfirming, isConfirmed, isOptionPending, optionError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();



        const formattedMaxPayout = (parseFloat(maxPayout) * 1e6).toString();
        const expoWiseStrikePrice = parseFloat(strikePrice) / Math.pow(10, parseInt(expo));
        const formattedPremiumCost = (parseFloat(premiumCost) * 1e6).toString();

        if (BigInt(currentAllowance) < BigInt(premiumCost) * BigInt(shares)) {
            try {
                writeApprovalContract({
                    address: mockUSDCAddress,
                    abi: mockUSDCABI,
                    functionName: 'approve',
                    args: [OptionismAddress as `0x${string}`, BigInt(formattedPremiumCost) * BigInt(shares)]
                });

                if (approvalError) {

                    return;
                }

                if (approvalTxHash) {
                    const result = useWaitForTransactionReceipt({ hash: approvalTxHash });
                }
            } catch (error) {

                return;
            }
        }

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

            if (optionError) {

            } else {

            }
        } catch (error) {

        }
    };
    useEffect(() => {
        if (isOptionPending) {
            console.log('Option transaction pending');
        } else {
            console.log('Option transaction not pending');
        }
    }, [isOptionPending]);

    // Reset form fields when selectedPriceId changes
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
        <div className="fixed top-48 right-14 p-4 w-[340px] border border-gray-600 rounded-lg bg-tv  shadow-md">

            <form onSubmit={handleSubmit} className="space-y-3">
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
            {txing && (<div className="fixed top-0 right-0 w-screen h-screen flex items-center justify-center backdrop-blur-[1px] bg-gray-900 bg-opacity-30 z-20">
                <div className="bg-primary fixed absolute top-50 right-50 items-center  text-center text-sm rounded-lg z-20 p-6 h-36 w-80">

                    {txing && (
                        <div className="fixed top-0 right-0 w-screen h-screen flex items-center justify-center backdrop-blur-[1px] bg-tv bg-opacity-30 z-20">
                            <div className="bg-tv fixed absolute top-50 right-50 items-center text-center text-sm rounded-lg z-20 p-6 h-36 w-80">

                                {!isConfirmed && !optionError ? (
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
                    `}
                                        </style>
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
                `}
                                        </style>
                                    </div>
                                )}

                                {txing && !isConfirming && !optionError && !isConfirmed && (
                                    <div>Waiting for user confirmation . . .</div>
                                )}
                                {isConfirming && !optionError && (
                                    <div>Waiting for confirmation...</div>
                                )}

                                {isConfirmed && <div>Transaction confirmed.</div>}
                                {hash && (
                                    <div className='mt-2'>
                                        <a
                                            className='bg-slate-200 border border-slate-400 p-0.5 px-1 rounded-md inline-block'
                                            href={`https://base-sepolia.blockscout.com/tx/${hash}`}
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

            </div>
            )}



        </div>
    );
};

export default OptionForm;
