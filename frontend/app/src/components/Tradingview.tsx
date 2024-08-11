import React, { useEffect, useRef } from 'react'

let tvScriptLoadingPromise: Promise<void>

interface TradingViewWidgetProps {
  gSymbol: string
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ gSymbol }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Function to remove the existing widget
    function removeWidget() {
      if (containerRef.current) {
        containerRef.current.innerHTML = '' // Clear the container
      }
    }

    // Function to create the TradingView widget
    function createWidget() {
      if (containerRef.current && (window as any).TradingView) {
        console.log(gSymbol)
        new (window as any).TradingView.widget({
          autosize: false,
          symbol: `PYTH:${gSymbol}`,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          width: 1200,
          height: 320,
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: containerRef.current.id, // Reference to container
        })
      }
    }

    // Load the TradingView script if it hasn't been loaded yet
    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script')
        script.id = 'tradingview-widget-loading-script'
        script.src = 'https://s3.tradingview.com/tv.js'
        script.type = 'text/javascript'
        script.onload = () => resolve()

        document.head.appendChild(script)
      })
    }

    // Once the script is loaded, remove the old widget and create a new one
    tvScriptLoadingPromise.then(() => {
      removeWidget() // Clear the old widget
      createWidget() // Create the new widget with the updated symbol
    })

    // Clean up on component unmount
    return () => {
      removeWidget()
    }
  }, [gSymbol]) // Re-run effect whenever gSymbol changes

  return (
    <div className='tradingview-widget-container'>
      <div id='tradingview' ref={containerRef} />
    </div>
  )
}

export default TradingViewWidget
