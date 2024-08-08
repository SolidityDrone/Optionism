"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import OptionsTable from '@/components/Orders';
import OptionForm from '@/components/WriteOptionForm';
import { useAccount } from 'wagmi';

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
  priceId: string;
  responseValue: string | null;
}

interface OptionUnitMapping {
  capPerUnit: string;
  expirationDate: string;
  hasToPay: string;
  isCall: boolean;
  premium: string;
  priceId: string;
  responseValue: string | null;
  shares: string;
  strikePrice: string;
  units: string;  // Added units field
  claimed: boolean;  // Added claimed field
}

interface PriceFeedData {
  id: string;
  price: number;
  conf: number;
  expo: number;
}

interface PriceFeedSymbolMap {
  [key: string]: string;
}

interface LatestPriceData {
  [key: string]: {
    price: number;
    expo: number;
  };
}

export default function Dashboard() {
  const account = useAccount();
  const [wrote, setWrote] = useState<Option[]>([]);
  const [bought, setBought] = useState<OptionUnitMapping[]>([]); // Updated state type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priceFeedSymbolMap, setPriceFeedSymbolMap] = useState<PriceFeedSymbolMap>({});
  const [latestPriceData, setLatestPriceData] = useState<LatestPriceData>({});

  const getSymbolFromPriceId = (priceId: string): string => {
    return priceFeedSymbolMap[priceId.toLowerCase()] || 'Unknown';
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp) * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchLatestPrices = async (priceIds: string[]) => {
    const baseURL = "https://hermes.pyth.network/v2/updates/price/latest";
    const idsQueryString = priceIds.map(id => `ids%5B%5D=${id}`).join("&");
    const url = `${baseURL}?${idsQueryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
     
      const latestPrices: LatestPriceData = {};
      data.parsed.forEach((item: any) => {
        latestPrices[`0x${item.id.toLowerCase()}`] = {
          price: parseFloat(item.price.price),
          expo: parseInt(item.price.expo)
        };
      });

      setLatestPriceData(latestPrices);
    } catch (err) {
      console.error('Error fetching latest prices:', err);
      setError('Failed to load latest prices');
    }
  };

  useEffect(() => {
    const fetchPythData = async () => {
      try {
        const response = await fetch('https://hermes.pyth.network/v2/price_feeds');
        const data = await response.json();

        const symbolMap: PriceFeedSymbolMap = {};
        data.forEach((item: any) => {
          const id = `0x${item.id}`.toLowerCase();
          const symbol = item.attributes.symbol || 'Unknown';
          symbolMap[id] = symbol;
        });

        setPriceFeedSymbolMap(symbolMap);
      } catch (err) {
        console.error('Error fetching Pyth data:', err);
        setError('Failed to load Pyth data');
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch options data from The Graph
        const optionsResponse = await fetch('https://api.goldsky.com/api/public/project_clzf3hstqye4x01x8hbgnch6n/subgraphs/optionism/v0.0.1/gn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              {
                options(where: {writer_contains_nocase: "${account.address}"}) {
                  id
                  countervalue
                  capPerUnit
                  deadlineDate
                  expirationDate
                  isCall
                  premium
                  sharesLeft
                  shares
                  strikePrice
                  priceId
                  responseValue
                }
              }
            `,
          }),
        });

        const optionsJson = await optionsResponse.json();
        if (optionsJson.data && optionsJson.data.options) {
          setWrote(optionsJson.data.options);

          const priceIds = optionsJson.data.options.map((option: Option) => option.priceId);
          fetchLatestPrices(priceIds);
        } else {
          setError('No options data found');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    const fetchOptionUnitsMappings = async () => {
      try {
        const response = await fetch('https://api.goldsky.com/api/public/project_clzf3hstqye4x01x8hbgnch6n/subgraphs/optionism/v0.0.1/gn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              {
                optionUnitsMappings(where: {user_contains_nocase: "${account.address}", units_gt: "0"}) {
                  option {
                    capPerUnit
                    expirationDate
                    hasToPay
                    isCall
                    premium
                    priceId
                    responseValue
                    shares
                    strikePrice
                  }
                  units
                  claimed
                }
              }
            `,
          }),
        });

        const jsonResponse = await response.json();
        if (jsonResponse.data && jsonResponse.data.optionUnitsMappings) {
          // Transform data to match OptionUnitMapping interface
          const mappings = jsonResponse.data.optionUnitsMappings.map((mapping: any) => ({
            ...mapping.option,
            id: mapping.option.priceId, 
            sharesLeft: mapping.option.shares, 
            units: mapping.units, 
            claimed: mapping.claimed 
          }));

          setBought(mappings);

          // Fetch latest prices for all priceIds in the mappings
          const priceIds = mappings.map((option: OptionUnitMapping) => option.priceId);
          fetchLatestPrices(priceIds);
        } else {
          setError('No option units mappings found');
        }
      } catch (err) {
        console.error('Error fetching option units mappings:', err);
        setError('Failed to load option units mappings');
      }
    };

    fetchPythData();
    fetchData();
    fetchOptionUnitsMappings();

    const intervalId = setInterval(() => {
      fetchData();
      fetchOptionUnitsMappings();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [account.address]);

  return (
    <div className="flex">
      {/* User-specific options */}
      <div
        className="fixed left-[20px] top-[200px] bg-gray-800 text-white p-4"
        style={{ width: '850px', height: '600px' }}
      >
        <h2 className="text-lg font-bold">Your writings</h2>
        <div className="w-full bg-black-950">
          <div className="h-[520px] bg-zinc-900 overflow-y-auto scrollbar-hidden">
            <table className="text-[14px] table-auto w-full">
              <thead className='sticky top-0 bg-zinc-900'>
                <tr>
                  <th>Call/Put</th> {/* New column for Call/Put */}
                  <th>Symbol</th>
                  <th>Current Price</th>
                  <th>Strike Price</th>
                  <th>Cap Per Unit</th>
                  <th>Premium</th>
                  <th>Shares</th>
                  <th>Expiry</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {wrote.length > 0 ? (
                  wrote.map((option) => {
                    const priceData = latestPriceData[option.priceId.toLowerCase()] || { price: 0, expo: 0 };
                    const adjustedStrikePrice = (parseFloat(option.strikePrice) / 1000000) * Math.pow(10, priceData.expo);
                    const currentPrice = (priceData.price / Math.pow(10, -priceData.expo)).toFixed(6);

                    const priceColor =
                      option.isCall
                        ? parseFloat(currentPrice) > adjustedStrikePrice ? 'text-green-500' : 'text-red-500'
                        : parseFloat(currentPrice) < adjustedStrikePrice ? 'text-green-500' : 'text-red-500';

                    return (
                      <tr key={option.id} className="border-b bg-gray-900 hover:bg-gray-600">
      <td className="w-[80px]  text-center flex items-center justify-center h-[44px]">
  <div className={`w-4 h-4 rounded-full ${option.isCall ? 'bg-green-500' : 'bg-red-500'}`}></div>
</td>
                        <td className="w-[134px] text-center">{getSymbolFromPriceId(option.priceId)}</td>
                        <td className={`w-[134px] text-center ${priceColor}`}>
                          {currentPrice}$
                        </td>
                        <td className="w-[134px] text-center">
                          {adjustedStrikePrice.toFixed(6)}$
                        </td>
                        <td className="w-[134px] text-center">
                          {(parseFloat(option.capPerUnit) / 1000000).toFixed(6)}$
                        </td>
                        <td className="w-[134px] text-center">
                          {(parseFloat(option.premium) / 1000000).toFixed(6)}$
                        </td>
                        <td className="w-[80px] text-center">
                          {option.sharesLeft}/{option.shares}
                        </td>
                        <td className="w-[120px] text-center">{formatDate(option.expirationDate)}</td>
                        <td className="w-[134px] text-center">
                          {option.responseValue !== null ? option.responseValue : '-'}
                        </td>
                
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No options found for the user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User-specific holdings */}
      <div
        className="fixed left-[55%] top-[200px] bg-gray-800 text-white p-4"
        style={{ width: '850px', height: '600px' }}
      >
        <h2 className="text-lg font-bold">Your holdings</h2>
        <div className="w-full bg-black-950">
          <div className="h-[520px] bg-zinc-900 overflow-y-auto scrollbar-hidden">
            <table className="text-[14px] table-auto w-full">
              <thead className='sticky top-0 bg-zinc-900'>
                <tr>
                  <th>Call/Put</th> {/* New column for Call/Put */}
                  <th>Symbol</th>
                  <th>Current Price</th>
                  <th>Strike Price</th>
                  <th>Expiration Date</th>
                  <th>Cap Per Unit</th>
                  <th>Units</th>
                  <th>Response Value</th>
                  <th>Claim</th>
                </tr>
              </thead>
              <tbody>
                {bought.length > 0 ? (
                  bought.map((option) => {
                    const priceData = latestPriceData[option.priceId.toLowerCase()] || { price: 0, expo: 0 };
                    const adjustedStrikePrice = (parseFloat(option.strikePrice) / 1000000) * Math.pow(10, priceData.expo);
                    const currentPrice = (priceData.price / Math.pow(10, -priceData.expo)).toFixed(6);

                    const priceColor =
                      option.isCall
                        ? parseFloat(currentPrice) > adjustedStrikePrice ? 'text-green-500' : 'text-red-500'
                        : parseFloat(currentPrice) < adjustedStrikePrice ? 'text-green-500' : 'text-red-500';

                    return (
                      <tr key={option.priceId} className="border-b bg-gray-900 hover:bg-gray-600">
                           <td className="w-[80px]  text-center flex items-center justify-center h-[44px]">
  <div className={`w-4 h-4 rounded-full ${option.isCall ? 'bg-green-500' : 'bg-red-500'}`}></div>
</td>
                        <td className="w-[134px] text-center">{getSymbolFromPriceId(option.priceId)}</td>
                        <td className={`w-[134px] text-center ${priceColor}`}>
                          {currentPrice}$
                        </td>
                        <td className="w-[134px] text-center">
                          {adjustedStrikePrice.toFixed(6)}$
                        </td>
                        <td className="w-[120px] text-center">{formatDate(option.expirationDate)}</td>
                        <td className="w-[134px] text-center">
                          {(parseFloat(option.capPerUnit) / 1000000).toFixed(6)}$
                        </td>
                        <td className="w-[80px] text-center">
                          {option.units}
                        </td>
                        <td className="w-[134px] text-center">
                          {option.responseValue !== null ? option.responseValue : '-'}
                        </td>
                        <td className="w-[134px] text-center">
  {option.hasToPay ? (
    option.claimed ? (
      'Claimed'
    ) : (
      <button className='border-b hover:bg-gray-700'>Claim</button>
    )
  ) : (
    '-'
  )}
</td>
                       
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No holdings found for the user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
