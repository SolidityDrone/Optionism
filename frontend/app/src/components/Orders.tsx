import React, { useEffect, useState } from 'react';
import { OptionismABI, OptionismAddress } from '@/abi/optionism';
import { mockUSDCABI, mockUSDCAddress } from '@/abi/ierc20';
import {
    useWriteContract,
    useAccount,
    useReadContract,
    useWaitForTransactionReceipt,
} from 'wagmi';
import TradingViewWidget from './Tradingview';

interface Option {
    id: string;
    countervalue: string;
    capPerUnit: string;
    deadlineDate: string;
    expirationDate: string;
    isCall: boolean;
    premium: string;
    sharesLeft: string;
    shares: string;
    strikePrice: string;
}

interface OptionsTableProps {
    callOptions: Option[];
    putOptions: Option[];
    loading: boolean;
    selectedName: string | null;
    price: string;
    expo: string;
    gSymbol: string; // Ensure this is included in the props interface
}

const formatDate = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp) * 1000); // Convert Unix timestamp to milliseconds
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const OptionsTable: React.FC<OptionsTableProps> = ({ callOptions, putOptions, loading, selectedName, price, expo, gSymbol }) => {
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const { address: user } = useAccount();
    const [currentAllowance, setCurrentAllowance] = useState<string>('0');

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
        setCurrentAllowance(allowance?.toString() || '0');
    }, [allowance]);

    const handleInputChange = (id: string, value: string) => {
        setInputValues(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (id: string) => {
        const amount = inputValues[id];
        console.log('Option ID:', id);
        console.log('Amount:', amount);

        if (amount) {
            const premiumCost = (parseFloat(callOptions.find(option => option.id === id)?.premium || '0') * parseFloat(amount)).toString();
            if (BigInt(currentAllowance) > BigInt(premiumCost)) {
                try {
                    // Approve transaction
                    await writeApprovalContract({
                        address: mockUSDCAddress,
                        abi: mockUSDCABI,
                        functionName: 'approve',
                        args: [OptionismAddress as `0x${string}`, BigInt(premiumCost)]
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

            // Proceed with the option buy transaction
            try {
                await writeOptionContract({
                    address: OptionismAddress,
                    abi: OptionismABI,
                    functionName: 'buyOption',
                    args: [BigInt(id), BigInt(amount)],
                });

                if (optionError) {
                    console.error('Transaction Error:', optionError);
                } else {
                    console.log('Transaction Hash:', optionTxHash);
                }
            } catch (error) {
                console.error('Error executing option transaction:', error);
            }
        } else {
            console.error('No amount entered.');
        }
    };

    return (
        <>          
        <div className="fixed bg-tv top-0 left-56 p-4 flex mt-10 flex-col gap-4">
     
            <h2 className="text-lg font-bold">Selected asset: {selectedName ? selectedName : "Void"} - Current price: {price}</h2>

   
            {/* Wrapper for both tables */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
            <TradingViewWidget gSymbol={gSymbol!} />  
                <div className="flex text-[14px] flex-col">
                    {/* Call Options Table (Entries start from the bottom) */}
                    <div className="w-[1200px]">
                        <div className="h-[220px] bg-tv overflow-y-auto scrollbar-hidden flex flex-col-reverse">
                            <table className="table-auto bg-black-950 w-full ">
                                <tbody>
                                    {callOptions.length > 0 ? (
                                        callOptions.map((option) => (
                                            <tr key={option.id} className="border-b  bg-green-900 hover:bg-green-700">
                                                <td className="w-[60px] text-center">{option.id}</td>
                                                <td className="w-[134px] text-center">{(parseFloat(option.premium) / 1000000).toFixed(6)}$</td>
                                                <td className="w-[134px] text-center">{(parseFloat(option.capPerUnit) / 1000000).toFixed(6)}$</td>
                                                <td className="w-[120px] text-center">{formatDate(option.deadlineDate)}</td>
                                                <td className="w-[120px] text-center">{formatDate(option.expirationDate)}</td>
                                                <td className="w-[80px] text-center">
                                                    {option.sharesLeft + "/" + option.shares}
                                                </td>
                                                <td className="w-[134px] text-center">{parseFloat(option.strikePrice) * Math.pow(10, expo) }$</td>
                                                <td className="w-[154px] text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="text"
                                                            className="border rounded h-[22px] px-2 py-1 w-[58px] text-center"
                                                            placeholder="qty"
                                                            value={inputValues[option.id] || ''}
                                                            onChange={(e) => handleInputChange(option.id, e.target.value)}
                                                        />
                                                          <button
                                                            className="bg-gray-900 text-white rounded h-[22px] px-4 w-[144px] flex items-center justify-center hover:bg-gray-800"
                                                            onClick={() => handleSubmit(option.id)}
                                                        >
                                                            Pay {(() => {
                                                                const premium = parseFloat(option.premium) / 1000000;
                                                                const inputValue = parseFloat(inputValues[option.id]);

                                                                if (!isNaN(premium) && !isNaN(inputValue)) {
                                                                    return (premium * inputValue).toFixed(2).toString() + "$";
                                                                } else {
                                                                    return '';
                                                                }
                                                            })()}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center py-2">
                                                No option published for that market
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Shared Header */}
                    <table className="table-auto bg-black-950">
                        <thead className="bg-black-800">
                            <tr>
                                <th className='w-[60px]'>ID</th>
                                <th className='w-[154px]'>Premium price</th>
                                <th className='w-[134px]'>Cap per unit</th>
                                <th className='w-[134px]'>Deadline Date</th>
                                <th className='w-[134px]'>Expiration Date</th>
                                <th className='w-[80px]'>Shares Left</th>
                                <th className='w-[134px]'>Strike Price</th>
                                <th className='w-[234px]'>Action</th>
                            </tr>
                        </thead>
                    </table>

                    {/* Put Options Table */}
                    <div className="w-full bg-black-950">
                        <div className="h-[220px] bg-tv overflow-y-auto scrollbar-hidden">
                            <table className="table-auto w-full">
                                <tbody>
                                    {putOptions.length > 0 ? (
                                        putOptions.map((option) => (
                                            <tr key={option.id} className="border-b bg-red-900 hover:bg-red-700">
                                                <td className="w-[60px] text-center">{option.id}</td>
                                                <td className="w-[134px] text-center">{(parseFloat(option.premium) / 1000000).toFixed(6)}$</td>
                                                <td className="w-[134px] text-center">{(parseFloat(option.capPerUnit) / 1000000).toFixed(6)}$</td>
                                                <td className="w-[120px] text-center">{formatDate(option.deadlineDate)}</td>
                                                <td className="w-[120px] text-center">{formatDate(option.expirationDate)}</td>
                                                <td className="w-[80px] text-center">
                                                    {option.sharesLeft + "/" + option.shares}
                                                </td>
                                                <td className="w-[134px] text-center">{((parseFloat(option.strikePrice) / 1000000) * Math.pow(10, expo) ).toFixed(6)}$</td>
                                                <td className="w-[154px] text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="text"
                                                            className="border rounded h-[22px] px-2 py-1 w-[58px] text-center"
                                                            placeholder="qty"
                                                            value={inputValues[option.id] || ''}
                                                            onChange={(e) => handleInputChange(option.id, e.target.value)}
                                                        />
                                                        <button
                                                            className="bg-gray-900 text-white rounded h-[22px] px-4 w-[144px] flex items-center justify-center hover:bg-gray-800"
                                                            onClick={() => handleSubmit(option.id)}
                                                        >
                                                            Pay {(() => {
                                                                const premium = parseFloat(option.premium) / 1000000;
                                                                const inputValue = parseFloat(inputValues[option.id]);

                                                                if (!isNaN(premium) && !isNaN(inputValue)) {
                                                                    return (premium * inputValue).toFixed(2).toString() + "$";
                                                                } else {
                                                                    return '';
                                                                }
                                                            })()}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center py-2">
                                                No option published for that market
                                            </td>
                                        </tr>
                                    )}
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default OptionsTable;
