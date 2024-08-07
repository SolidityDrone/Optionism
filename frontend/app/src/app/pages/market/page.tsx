"use client";
import React, { useEffect, useState } from 'react';
import  Sidebar  from '@/components/Sidebar'
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

export default function OptionsData() {
  const [callOptions, setCallOptions] = useState<Option[]>([]);
  const [putOptions, setPutOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.studio.thegraph.com/query/73482/optionism/version/latest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              {
                options(where: {priceId_contains: ""}) {
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

        const json = await response.json();

        if (json.data && json.data.options) {
          const callOpts = json.data.options.filter((option: Option) => option.isCall);
          const putOpts = json.data.options.filter((option: Option) => !option.isCall);

          setCallOptions(callOpts);
          setPutOptions(putOpts);
        } else {
          setError('No data found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load options data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (<>
  
  <Sidebar/>
  <div className="fixed top-0 left-56 p-4 flex mt-10 flex-col gap-4">
  
      <h2 className="text-lg font-bold">Equity.USDC/USDC</h2>

      {/* Wrapper for both tables */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex text-[14px] flex-col">

          {/* Call Options Table (Entries start from the bottom) */}
          <div className=" w-[1200px]">
            <div className="h-[370px] bg-zinc-900  overflow-y-auto scrollbar-hidden flex flex-col-reverse">
              <table className="table-auto  bg-black-950 w-full">
                <tbody>
                  {callOptions.length > 0 ? (
                    callOptions.map((option) => (
                     <> <tr key={option.id} className="border-b bg-green-900">
                     <td>{option.id}</td>
                     <td>{option.countervalue}</td>
                     <td>{option.capPerUnit}</td>
                     <td>{option.deadlineDate}</td>
                     <td>{option.expirationDate}</td>
                     <td>{option.premium}</td>
                     <td>{option.sharesLeft}</td>
                     <td>{option.shares}</td>
                     <td>{option.strikePrice}</td>
                   </tr></>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-2">No Call Options Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shared Header */}
          <thead className="bg-black-800">
            <tr>
              <th>ID</th>
              <th>Countervalue</th>
              <th>Cap Per Unit</th>
              <th>Deadline Date</th>
              <th>Expiration Date</th>
              <th>Premium</th>
              <th>Shares Left</th>
              <th>Shares</th>
              <th>Strike Price</th>
            </tr>
          </thead>

          {/* Put Options Table */}
          <div className="w-full bg-black-950">
            <div className="h-[370px] bg-zinc-900 overflow-y-auto scrollbar-hidden">
              <table className="table-auto w-full ">
                <tbody>
                  {putOptions.length > 0 ? (
                    putOptions.map((option) => (
                      <tr key={option.id} className="border-b bg-red-900">
                        <td>{option.id}</td>
                        <td>{option.countervalue}</td>
                        <td>{option.capPerUnit}</td>
                        <td>{option.deadlineDate}</td>
                        <td>{option.expirationDate}</td>
                        <td>{option.premium}</td>
                        <td>{option.sharesLeft}</td>
                        <td>{option.shares}</td>
                        <td>{option.strikePrice}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-2">No Put Options Available</td>
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
}