"use client";
import { useEffect, useState } from 'react';

type AssetType = 'Commodities' | 'Equity' | 'Crypto' | 'FX' | 'Metal' | 'Rates';

interface Asset {
  description: string;
  asset_type: AssetType;
  symbol: string;
  priceId: string;
  generic_symbol: string;
}

interface SidebarProps {
  onSelectPriceId: (priceId: string, description: string, gsymbol: string) => void;
}

export default function Sidebar({ onSelectPriceId }: SidebarProps) {
  const [commodities, setCommodities] = useState<Asset[]>([]);
  const [equity, setEquity] = useState<Asset[]>([]);
  const [crypto, setCrypto] = useState<Asset[]>([]);
  const [fx, setFX] = useState<Asset[]>([]);
  const [metal, setMetal] = useState<Asset[]>([]);
  const [rates, setRates] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<String>("");
  
  const [expanded, setExpanded] = useState<Record<AssetType, boolean>>({
    Commodities: false,
    Equity: false,
    Crypto: false,
    FX: false,
    Metal: false,
    Rates: false,
  });

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch('https://hermes.pyth.network/v2/price_feeds');
        const data: any[] = await response.json();

        const commoditiesList: Asset[] = [];
        const equityList: Asset[] = [];
        const cryptoList: Asset[] = [];
        const fxList: Asset[] = [];
        const metalList: Asset[] = [];
        const ratesList: Asset[] = [];

        data.forEach((item: any) => {
          if (item.attributes.asset_type) {
            const assetType: AssetType = item.attributes.asset_type as AssetType;
            const description = item.attributes.description;
            const symbol = item.attributes.symbol;
            const priceId = "0x"+item.id;
            const genericSymbol = item.attributes.generic_symbol;
            const asset = { description, symbol, asset_type: assetType, priceId, generic_symbol: genericSymbol};
            
            switch (assetType.toString()) {
              case 'Commodities':
                commoditiesList.push(asset);
                break;
              case 'Equity':
                equityList.push(asset);
                break;
              case 'Crypto':
                cryptoList.push(asset);
                break;
              case 'FX':
                fxList.push(asset);
                break;
              case 'Metal':
                metalList.push(asset);
                break;
              case 'Rates':
                ratesList.push(asset);
                break;
              default:
                console.warn(`Unknown asset type: ${assetType}`);
            }
          }
        });

        setCommodities(commoditiesList);
        setEquity(equityList);
        setCrypto(cryptoList);
        setFX(fxList);
        setMetal(metalList);
        setRates(ratesList);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    }

    fetchAssets();
  }, []);

  const handleToggle = (type: AssetType) => {
    setExpanded(prevState => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  const handleItemClick = (priceId: string, description: string, gSymbol: string) => {
   
    onSelectPriceId(priceId, description, gSymbol);
    setSelected(priceId);
  
  };

  return (
    <div className="flex h-screen mt-10">
      <aside className="fixed bg-tv left-0 h-full w-56 bg-base-200 overflow-y-auto scrollbar-hidden">
        <h4 className="text-lg pl-2 pt-2 font-bold mb-2 mt-2">Assets</h4>
        {['Equity', 'Crypto', 'FX', 'Metal', 'Rates', 'Commodities'].map((type) => (
          <div className="mb-4 pl-2 pr-2" key={type}>
            <button
              onClick={() => handleToggle(type as AssetType)}
              className="flex items-center justify-between w-full text-left font-semibold text-md mb-2"
            >
              {type}
              <span className="ml-2">
                {expanded[type as AssetType] ? '-' : '+'}
              </span>
            </button>
            {expanded[type as AssetType] && (
              <ul>
                {(type === 'Commodities' ? commodities :
                  type === 'Equity' ? equity :
                  type === 'Crypto' ? crypto :
                  type === 'FX' ? fx :
                  type === 'Metal' ? metal :
                  rates).length > 0 ? (
                  (type === 'Commodities' ? commodities :
                    type === 'Equity' ? equity :
                    type === 'Crypto' ? crypto :
                    type === 'FX' ? fx :
                    type === 'Metal' ? metal :
                    rates).map((asset, index) => (
                    <li key={index} className={`py-2 ${index > 0 ? 'border-t border-gray-500' : ''}`}>
                     {selected == asset.priceId ? (<a
                        href="#"
                        onClick={() => handleItemClick(asset.priceId, asset.description, asset.generic_symbol)}
                        className="block py-2 bg-gray-700 hover:text-white transition-colors duration-200"
                      >
                        <span className="block text-[12px] ">{asset.symbol}</span>
                        <span className="block text-[8px] ">{asset.description}</span>
                      </a>) : (<a
                        href="#"
                        onClick={() => handleItemClick(asset.priceId, asset.description, asset.generic_symbol)}
                        className="block py-2 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                      >
                        <span className="block text-[12px] ">{asset.symbol}</span>
                        <span className="block text-[8px] ">{asset.description}</span>
                      </a>)}
                    </li>
                  ))
                ) : (
                  <li>No items available</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </aside>
    </div>
  );
}
