/* eslint-disable */
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
    selectedName: string;
    price: string;
    expo: string;
    gSymbol: string;
    csmSymbol: string; // Ensure this is included
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

const OptionsTable: React.FC<OptionsTableProps> = ({ callOptions, putOptions, loading, selectedName, price, expo, gSymbol, csmSymbol}) => {
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const { address: user } = useAccount();

    const [txing, setTxing] = useState<boolean>(false);
    const [phase, setPhase] = useState<Number>(0);
    const [selectedId, setSelectedId] = useState<string>('');
    const [selectedPremiumCost, setSelectedPremiumCost] = useState<string>('');
    const [selectedAmount, setSelectedAmount] = useState<string>('');
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

    const { isLoading: isOptionConfirming, isSuccess: isOptionConfirmed } =
    useWaitForTransactionReceipt({ hash: optionTxHash });

    const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } =
        useWaitForTransactionReceipt({ hash: approvalTxHash });


    // const { data: allowance } = useReadContract({
    //     address: mockUSDCAddress,
    //     abi: mockUSDCABI,
    //     functionName: 'allowance',
    //     args: [user as `0x${string}`, OptionismAddress as `0x${string}`]
    // });

    
    const handleInputChange = (id: string, value: string) => {
        setInputValues(prev => ({ ...prev, [id]: value }));
    };

    
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        if (phase === 1){
            if (isApprovalConfirmed){
               
                timeoutId = setTimeout(() => {
                    setPhase(2);
                    console.log("app confirmed, setphase2");
                    try {
                        writeOptionContract({
                            address: OptionismAddress,
                            abi: OptionismABI,
                            functionName: 'buyOption',
                            args: [BigInt(selectedId), BigInt(selectedAmount)],
                        });
    
                        if (optionError) {
                        } else {
                        }
                    } catch (error) {
                        console.log(optionError)
                    }
                
                }, 3000);
                // Proceed with the option buy transaction
              
            }
            if (approvalError){
                setTxing(false);
                setPhase(0);
            }
        }
    }, [isApprovalPending, isApprovalConfirmed, isApprovalConfirming, approvalError]);


    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        console.log(optionError)
        if (phase === 2){
              if (isOptionConfirmed){
                  
                timeoutId = setTimeout(() => {
                    setPhase(0);
                    setTxing(false);
                    console.log("option confirmed, setphase0");
                }, 3000);
              }
              if(optionError){
                setTxing(false);
                setPhase(0);
              }
        }
        
    }, [isOptionPending, isOptionConfirmed, isOptionConfirming, optionError]);

    const handleSubmit = async (id: string) => {
        const amount = inputValues[id];

        if (amount) {
         
            const premiumCost = (parseFloat(callOptions.find(option => option.id === id)?.premium || '0') * parseFloat(amount)).toString();
            setSelectedPremiumCost(premiumCost);
            setSelectedId(id);
            setSelectedAmount(amount);
            console.log(id);
            console.log(premiumCost);
            console.log(amount)
                try {
                    // Approve transaction
                    writeApprovalContract({
                        address: mockUSDCAddress,
                        abi: mockUSDCABI,
                        functionName: 'approve',
                        args: [OptionismAddress as `0x${string}`, BigInt(premiumCost)]
                    });
                    setTxing(true);
                    setPhase(1);
                    if (approvalError) {
                  
                        return;
                    }
                } catch (error) {
                    return;
                }
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
                                                    <td className="w-[134px] text-center">{parseFloat(option.strikePrice) * Math.pow(10, Number(expo))}$</td>
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
                                                    <td className="w-[134px] text-center">{parseFloat(option.strikePrice) * Math.pow(10, Number(expo))}$</td>
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
            {txing && (<div className="fixed top-0 right-0 w-screen h-screen flex items-center justify-center backdrop-blur-[1px] bg-gray-900 bg-opacity-30 z-20">
                <div className="bg-primary fixed absolute top-50 right-50 items-center  text-center text-sm rounded-lg z-20 p-6 h-36 w-80">

                    {txing && (
                        <div className="fixed top-0 right-0 w-screen h-screen flex items-center justify-center backdrop-blur-[1px] bg-tv bg-opacity-30 z-20">
                            <div className="bg-tv fixed absolute top-50 right-50 items-center text-center text-sm rounded-lg z-20 p-6 h-36 w-80">

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

                                {txing && (!isOptionConfirming || !isApprovalConfirming) && !optionError && (isOptionPending || isApprovalPending) && (
                                    <div>Waiting for user to confirm . . .</div>
                                )}
                                {(isOptionConfirming || isApprovalConfirming) && !optionError && (
                                    <div>Waiting for confirmation...</div>
                                )}

                                {((isOptionConfirmed || isApprovalConfirmed) && !(isOptionPending||isApprovalPending)) && <div>Transaction confirmed.</div>}
                                {(optionTxHash && phase ==2) && (
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
            </div>
            )}
        </>
    );
};

export default OptionsTable;
