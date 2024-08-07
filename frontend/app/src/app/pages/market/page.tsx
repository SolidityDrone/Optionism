"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import OptionsTable from '@/components/Orders';
import OptionForm from '@/components/WriteOptionForm';

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

export default function OptionsData() {
  const [callOptions, setCallOptions] = useState<Option[]>([]);
  const [putOptions, setPutOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [priceFeedData, setPriceFeedData] = useState<PriceFeedData | null>(null);
  const [price, setPrice] = useState<String>("");
  const [expo, setExpo] = useState<String>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch options data from The Graph
        const optionsResponse = await fetch('https://api.studio.thegraph.com/query/73482/optionism/version/latest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              {
                options(where: {priceId_contains: "${selectedPriceId}"}) {
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

          setCallOptions(callOpts);
          setPutOptions(putOpts);
        } else {
          setError('No options data found');
        }

        // Fetch price feed data from Pyth Network
        if (selectedPriceId) {
          const priceFeedResponse = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${selectedPriceId}`);
         
          const priceFeedJson = await priceFeedResponse.json();
          
          if (priceFeedJson) {
            
            const priceData = priceFeedJson; // Assuming the first object is the relevant data
            console.log(priceData.parsed[0].price.price);
            
            setPriceFeedData({
              id: selectedPriceId,
              price: priceData.parsed[0].price.price,
              conf: priceData.parsed[0].price.conf,
              expo: priceData.parsed[0].price.expo,
            });
            setPrice((priceData.parsed[0].price.price * Math.pow(10, priceData.parsed[0].price.expo)).toFixed(4).toString()+"$");
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
    <>
      <Sidebar
        onSelectPriceId={(id, name) => {
          setSelectedPriceId(id);
          setSelectedName(name);
        }}
      />
      <OptionsTable
        callOptions={callOptions}
        putOptions={putOptions}
        loading={loading}
        selectedName={selectedName}
        price={price.toString()}
      />
      <OptionForm
        selectedPriceId={selectedPriceId}
        selectedName={selectedName}
        expo={expo}
      />
     
    </>
  );
}
