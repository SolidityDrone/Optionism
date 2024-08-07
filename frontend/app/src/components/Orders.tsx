import React, { useEffect, useState } from 'react';
import { OptionismABI, OptionismAddress } from '@/abi/optionism';
import {
    useWaitForTransactionReceipt,
    useWriteContract,
    useAccount,
} from 'wagmi';
import { writeContract } from 'wagmi/actions';

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
    price: string | null;
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

const OptionsTable: React.FC<OptionsTableProps> = ({ callOptions, putOptions, loading, selectedName, price }) => {
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const {
        data: hash,
        isPending,
        error,
        writeContract
    } = useWriteContract();


    const handleInputChange = (id: string, value: string) => {
        setInputValues(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (id: string) => {
        const amount = inputValues[id];
        console.log('Option ID:', id);
        console.log('Amount:', amount);

        if (amount) {
            try {
                writeContract({
                    address: OptionismAddress,
                    abi: OptionismABI,
                    functionName: 'buyOption',
                    args: [BigInt(id), BigInt(inputValues[id])],
                });

                if (error) {
                    console.error('Transaction Error:', error);
                } else {
                    console.log('Transaction Hash:', hash);
                }
            } catch (error) {
                console.error('Error executing transaction:', error);
            }
        } else {
            console.error('No amount entered.');
        }
    };

    useEffect(() => {
        if (isPending) {
            console.log("pending");
        } else {
            console.log("not pending");
        }
    }, [isPending])


    return (
        <div className="fixed top-0 left-56 p-4 flex mt-10 flex-col gap-4">

            <h2 className="text-lg font-bold">Selected asset: {selectedName ? selectedName : "Void"} - Current price: {price}</h2>


            {/* Wrapper for both tables */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="flex text-[14px] flex-col">
                    {/* Call Options Table (Entries start from the bottom) */}
                    <div className="w-[1200px]">
                        <div className="h-[370px] bg-zinc-900 overflow-y-auto scrollbar-hidden flex flex-col-reverse">
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
                                                <td className="w-[134px] text-center">{(parseFloat(option.strikePrice) / 1000000).toFixed(6)}$</td>
                                                <td className="w-[154px] text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="text"
                                                            className="border rounded h-[22px] px-2 py-1 w-[58px] text-center"
                                                            placeholder="Enter value"
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
                        <div className="h-[370px] bg-zinc-900 overflow-y-auto scrollbar-hidden">
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
                                                <td className="w-[134px] text-center">{(parseFloat(option.strikePrice) / 1000000).toFixed(6)}$</td>
                                                <td className="w-[154px] text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="text"
                                                            className="border rounded h-[22px] px-2 py-1 w-[58px] text-center"
                                                            placeholder="Enter value"
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
    );
};

export default OptionsTable;
