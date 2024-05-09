import React, { useEffect, useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import axios from 'axios';

interface Currency {
  name: string;
  current_price: number;
}

interface CardViewProps {
  from: string;
  to: string;
  status: string;
  amount: string;
  transactionHash: string;
}

const App = () => {
  const numberValidation = /^[0-9]+$/;
  const [currencies, setCurrency] = useState<Currency[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [price, setPrice] = useState<number>(1);
  const amountRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [localStorageData, setLocalStorageData] = useState<CardViewProps[]>([]);

  useEffect(() => {
    // Fetch currencies data
    axios.get('https://example.com/currency-data')
    .then(response => {
      setCurrency(response.data);
    })
    .catch(error => {
      console.error('Error fetching currencies data:', error);
    });

    // Retrieve data from local storage when component mounts
    const data = localStorage.getItem('currencyData');
    if (data) {
      setLocalStorageData(JSON.parse(data));
    }
  }, []);

  const changeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.match(numberValidation)) {
      const num = Math.abs(parseFloat(inputValue));
      setAmount(num);
      setPrice((num * parseFloat(priceRef.current!.value)) / parseFloat(priceRef.current!.value));
    }
  };

  const changePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.match(numberValidation)) {
      const num = Math.abs(parseFloat(inputValue));
      setPrice(num);
      setAmount((num * parseFloat(amountRef.current!.value)) / parseFloat(amountRef.current!.value));
    }
  };

  const handleSwap = () => {
    // Simulate transfer and payment success/failure
    const isSuccess = Math.random() < 0.5; // 50% chance of success
    const status = isSuccess ? 'success' : 'fail';

    // Get the values of "from" and "to" inputs
    const fromValue = amountRef.current?.value || '';
    const toValue = priceRef.current?.value || '';

    // Generate a mock transaction hash
    const transactionHash ='';

    // Store values and payment status in local storage
    const newData = [...localStorageData, { from: fromValue, to: toValue, status: status, amount: amount.toString(), transactionHash }];
    localStorage.setItem('currencyData', JSON.stringify(newData));

    // Update state to reflect the changes
    setLocalStorageData(newData);
  };

  const CardView: React.FC<CardViewProps> = ({ from, to, status, amount, transactionHash }) => {
    return (
      <div className="card">
        <h4>Transaction Details</h4>
        <p>From: {from}</p>
        <p>To: {to}</p>
        <p>Status: {status}</p>
        <p>Amount: {amount}</p>
        <p>Transaction Hash: {transactionHash}</p>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="connect-button-container">
        <ConnectButton />
      </div>
      <form className="py-4 form-template">
        {/* Your JSX for the form */}
      </form>

      <div className="containers">
        <h2>Currency Swap</h2>
        <div className="wrapper">
          <form>
            <div className="convert_box">
              <div className="from">
                <p>Amount</p>
                <div className="select_input">
                  <input type="text" ref={amountRef} onChange={changeAmount} />
                </div>
              </div>
              <div className="reverse"><i className="fas fa-exchange-alt"></i></div>
              <div className="to">
                <p>To</p>
                <div className="select_input">
                  <input type="text" ref={priceRef} onChange={changePrice} />
                </div>
              </div>
              <div className="result">..........................................................................................................</div>
            </div>
          </form>
        </div>
        <button type="button" onClick={handleSwap}>Swap...</button>
      </div>

      {/* Display local storage data with scrollable container */}
      <div className="local-storage-data" style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'center' }}>
        <h3>Recent Transection</h3>
        <div className="card-container">
          {localStorageData.map((item, index) => (
            <CardView key={index} from={item.from} to={item.to} status={item.status} amount={item.amount} transactionHash={item.transactionHash} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
