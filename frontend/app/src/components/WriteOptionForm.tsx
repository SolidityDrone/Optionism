"use client";
import React, { useState, useEffect } from 'react';
import { OptionismABI, OptionismAddress } from '@/abi/optionism';
import {
    useWaitForTransactionReceipt,
    useWriteContract,
    useAccount,
} from 'wagmi';

interface OptionFormProps {
    selectedPriceId: string | null;
    selectedName: string | null;
}

const OptionForm: React.FC<OptionFormProps> = ({ selectedPriceId, selectedName }) => {
    const [maxPayout, setMaxPayout] = useState<string>('');
    const [strikePrice, setStrikePrice] = useState<string>('');
    const [premiumCost, setPremiumCost] = useState<string>('');
    const [isCall, setIsCall] = useState<boolean>(true);
    const [shares, setShares] = useState<string>('');
    const [expiry, setExpiry] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');

    const {
        data: hash,
        isPending,
        error,
        writeContract,
    } = useWriteContract();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    
        // Convert values to appropriate formats
        const formattedMaxPayout = (parseFloat(maxPayout) * 1e6).toString();
        const formattedStrikePrice = (parseFloat(strikePrice) * 1e6).toString();
        const formattedPremiumCost = (parseFloat(premiumCost) * 1e6).toString();
    
        try {
            writeContract({
                address: OptionismAddress,
                abi: OptionismABI,
                functionName: 'createOption',
                args: [
                    isCall,
                    BigInt(formattedPremiumCost),
                    BigInt(formattedStrikePrice),
                    BigInt(new Date(deadline).getTime() / 1000),
                    BigInt(new Date(expiry).getTime() / 1000), 
                    selectedPriceId as `0x${string}`,
                    BigInt(shares),
                    BigInt(formattedMaxPayout),
                ],
            });
    
            if (error) {
                console.error('Transaction Error:', error);
            } else {
                console.log('Transaction Hash:', hash);
            }
        } catch (error) {
            console.error('Error executing transaction:', error);
        }
    };
    

    useEffect(() => {
        if (isPending) {
            console.log('pending');
        } else {
            console.log('not pending');
        }
    }, [isPending]);

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
        <div className="fixed top-48 right-14 p-4 w-[340px] border border-gray-600 rounded-lg bg-gray-700 shadow-md">
            
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
