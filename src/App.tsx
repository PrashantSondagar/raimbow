import React, { useEffect, useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Web3 from 'web3';

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

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const numberValidation = /^[0-9]+$/;
  const [amount, setAmount] = useState<number>(1);
  const [price, setPrice] = useState<number>(1);
  const amountRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [localStorageData, setLocalStorageData] = useState<CardViewProps[]>([]);
  const [hashcode, setHashcode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    // Check if Web3 provider is available
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      // Request account access if needed
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts: string[]) => {
          // Get the first account from the array of accounts
          const address = accounts[0];
          setWalletAddress(address);
        })
        .catch((error: any) => {
          console.error('Error retrieving account:', error);
        });
    }

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

  const handleSwap = async () => {
    if (!walletAddress) {
      console.error('Wallet address not available');
      return;
    }

    // Initialize Web3
    const web3 = new Web3(window.ethereum);

    // Define token contract address and ABI
    const tokenContractAddress = walletAddress; // Replace with your token contract address
    const tokenContractABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_to",
            "type": "address"
          },
          { 
            "internalType": "uint256",
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    // Get token contract instance
    const tokenContract = new web3.eth.Contract(tokenContractABI, tokenContractAddress);

    // Convert amount to token decimals
    const decimals = 18; // Assuming 18 decimal places
    const tokenAmount = web3.utils.toWei(amount.toString(), 'ether'); // Convert amount to wei

    // Attempt to send transaction with retry logic
    try {
      const transaction = await sendTransactionWithRetry(tokenContract.methods.transfer(priceRef.current!.value, tokenAmount), { from: walletAddress });
      const transactionHash = transaction.transactionHash;

      // Store values and payment status in local storage
      const newData: CardViewProps[] = [...localStorageData, { from: walletAddress, to: priceRef.current!.value, status: 'success', amount: amount.toString(), transactionHash }];
      localStorage.setItem('currencyData', JSON.stringify(newData));
      setLocalStorageData(newData);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  const sendTransactionWithRetry = async (transactionPromise: any, options: any, retryCount = 3) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        const transaction = await transactionPromise.send(options);
        return transaction;
      } catch (error) {
        console.error('Error sending transaction, retrying...', error);
      }
    }
    throw new Error('Transaction failed after multiple retries');
  };

  const checkHash = () => {
    // Call an API to check the status of the hash code
    // Example:
    // axios.get(`your_api_endpoint/check-hash?hash=${hashcode}`)
    //   .then((response) => {
    //     setPaymentStatus(response.data.status);
    //   })
    //   .catch((error) => {
    //     console.error('Error checking hash:', error);
    //   });

    // For demonstration, randomly set the payment status
    const randomStatus = Math.random() < 0.5 ? 'pending' : 'success';
    setPaymentStatus(randomStatus);
  };

  const renderPopup = () => {
    if (paymentStatus === 'pending') {
      return <div className="popup">Payment is pending...</div>;
    } else if (paymentStatus === 'failed') {
      return <div className="popup">Payment failed...</div>;
    } else if (paymentStatus === 'success') {
      return <div className="popup">Payment successful!</div>;
    } else {
      return null;
    }
  };

  return (
    <div className="container">
        <div className="connect-button-container">
        <p>Enter Hash code...</p>
        <input type="text" id='hashcode' />
        <button type="button" onClick={checkHash}>Check Hash..</button>
      </div>
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
        <h3>Recent Transaction</h3>
        <div className="card-container">
          {localStorageData.map((item, index) => (
            <CardView key={index} from={item.from} to={item.to} status={item.status} amount={item.amount} transactionHash={item.transactionHash} />
          ))}
        </div>
      </div>
      
      {/* Render popup based on payment status */}
      {renderPopup()}
    </div>
  );
};

export default App;
