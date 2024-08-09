"use client";
import React, { useState, useEffect } from 'react';
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
    const [pending, setPending] = useState<boolean>(false);

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

    const { data: allowance } = useReadContract({
        address: mockUSDCAddress,
        abi: mockUSDCABI,
        functionName: 'allowance',
        args: [user as `0x${string}`, OptionismAddress as `0x${string}`]
    });

    useEffect(() => {
        console.log("Allowance:", allowance);
        setCurrentAllowance(allowance?.toString() || '0');
    }, [allowance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert values to appropriate formats
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
                    console.error('Approval Transaction Error:', approvalError);
                    return;
                }

                // Wait for the approval transaction to be confirmed
                if (approvalTxHash) {
                    await useWaitForTransactionReceipt({ hash: approvalTxHash });
                }

                console.log('Approval Transaction Hash:', approvalTxHash);
            } catch (error) {
                console.error('Error executing approval transaction:', error);
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
                console.error('Option Transaction Error:', optionError);
            } else {
                console.log('Option Transaction Hash:', optionTxHash);
            }
        } catch (error) {
            console.error('Error executing option transaction:', error);
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
        </div>
    );
};

export default OptionForm;
