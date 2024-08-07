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
}

interface PriceFeedData {
  id: string;
  price: number;
  conf: number;
  expo: number;
}

export default function Dashboard() {
  const account = useAccount();
  const [wrote, setWrote] = useState<Option[]>([]);
  const [bought, setBought] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [priceFeedData, setPriceFeedData] = useState<PriceFeedData | null>(null);
  const [price, setPrice] = useState<string>("");
  const [expo, setExpo] = useState<string>("");

  useEffect(() => {
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
                }
              }
            `,
          }),
        });

        const optionsJson = await optionsResponse.json();
        if (optionsJson.data && optionsJson.data.options) {
          const callOpts = optionsJson.data.options.filter((option: Option) => option.isCall);
          const putOpts = optionsJson.data.options.filter((option: Option) => !option.isCall);

          setWrote(callOpts); // Assuming call options
          setBought(putOpts); // Assuming put options
        } else {
          setError('No options data found');
        }

        // Fetch price feed data from Pyth Network
        if (selectedPriceId) {
          const priceFeedResponse = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${selectedPriceId}`);
          const priceFeedJson = await priceFeedResponse.json();

          if (priceFeedJson) {
            const priceData = priceFeedJson;
            setPriceFeedData({
              id: selectedPriceId,
              price: priceData.parsed[0].price.price,
              conf: priceData.parsed[0].price.conf,
              expo: priceData.parsed[0].price.expo,
            });
            setPrice((priceData.parsed[0].price.price * Math.pow(10, priceData.parsed[0].price.expo)).toFixed(4).toString() + "$");
            setExpo(priceData.parsed[0].price.expo);
          } else {
            setPriceFeedData(null);
            setError('No price feed data found');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    // Initial data fetch
    fetchData();

    // Set up polling to refresh data every 4 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 4000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedPriceId]);

  return (
    <div className="flex">
      {/* First Div - User-specific options */}
      <div
        className="fixed left-[20px]  top-[200px] bg-gray-800 text-white p-4"
        style={{ width: '850px', height: '600px' }}
      >
        <h2 className="text-lg font-bold">Your writings</h2>
        <div className="w-full bg-black-950">
          <div className="h-[520px] bg-zinc-900 overflow-y-auto scrollbar-hidden">
            <table className="text-[14px] table-auto w-full">
              <thead >
                <tr>
                  <th>Strike Price</th>
                  <th>Expiration Date</th>
                  <th>Cap Per Unit</th>
                  <th>Premium</th>
                  <th>Shares Left / Shares</th>
                </tr>
              </thead>
              <tbody>
                {wrote.length > 0 ? (
                  wrote.map((option) => (
                    <tr key={option.id} className="border-b bg-gray-900 hover:bg-gray-600">
                      <td className="w-[134px] text-center">
                        {((parseFloat(option.strikePrice) / 1000000) * Math.pow(10, parseFloat(expo))).toFixed(6)}$
                      </td>
                      <td className="w-[120px] text-center">{new Date(parseInt(option.expirationDate) * 1000).toLocaleDateString()}</td>
                      <td className="w-[134px] text-center">
                        {(parseFloat(option.capPerUnit) / 1000000).toFixed(6)}$
                      </td>
                      <td className="w-[134px] text-center">
                        {(parseFloat(option.premium) / 1000000).toFixed(6)}$
                      </td>
                      <td className="w-[80px] text-center">
                        {option.sharesLeft + "/" + option.shares}
                      </td>
                      <td className="w-[154px] text-center">
                        <div className="flex items-center justify-center gap-2">
                       
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td  className="text-center">
                      No options found for the user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

       {/* First Div - User-specific options */}
       <div
        className="fixed left-[55%]  top-[200px] bg-gray-800 text-white p-4"
        style={{ width: '850px', height: '600px' }}
      >
        <h2 className="text-lg font-bold">Your holdings</h2>
        <div className="w-full bg-black-950">
          <div className="h-[520px] bg-zinc-900 overflow-y-auto scrollbar-hidden">
            <table className="text-[14px] table-auto w-full">
              <thead >
                <tr>
                  <th>Strike Price</th>
                  <th>Expiration Date</th>
                  <th>Cap Per Unit</th>
                  <th>Premium</th>
                  <th>Shares Left / Shares</th>
                </tr>
              </thead>
              <tbody>
                {wrote.length > 0 ? (
                  wrote.map((option) => (
                    <tr key={option.id} className="border-b bg-gray-900 hover:bg-gray-600">
                      <td className="w-[134px] text-center">
                        {((parseFloat(option.strikePrice) / 1000000) * Math.pow(10, parseFloat(expo))).toFixed(6)}$
                      </td>
                      <td className="w-[120px] text-center">{new Date(parseInt(option.expirationDate) * 1000).toLocaleDateString()}</td>
                      <td className="w-[134px] text-center">
                        {(parseFloat(option.capPerUnit) / 1000000).toFixed(6)}$
                      </td>
                      <td className="w-[134px] text-center">
                        {(parseFloat(option.premium) / 1000000).toFixed(6)}$
                      </td>
                      <td className="w-[80px] text-center">
                        {option.sharesLeft + "/" + option.shares}
                      </td>
                      <td className="w-[154px] text-center">
                        <div className="flex items-center justify-center gap-2">
                       
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td  className="text-center">
                      No options found for the user.
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
