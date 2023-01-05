import { useEffect, useState } from "react";
import Web3 from "web3";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US')

const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";

const valueToEther = (value) => {
  return Web3.utils.fromWei(value, "ether");
};

const fetchETHData = async (page, setTransactions, setIsLoading) => {
  setIsLoading(true);
  const results = 1000;
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=${page}&offset=25&sort=asc&apikey=4EZ7A5367RJJY5AGVIFG2BBDJQCNADSVG4`;
  console.log(url);
  const res = await fetch(url);
  const data = await res.json();
  setTransactions(data.result);
  console.log("data", data.result);
  setIsLoading(false);
  return data;
};

let loadedPages = 0;

export default function Home() {
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [hideEmptyTransactions, setHideEmptyTransactions] = useState(false);

  useEffect(() => {
    fetchETHData(page, setTransactions, setIsLoading);
  }, [page]);

  useEffect(() => {
    if (page <= loadedPages || !transactions.length) return;
    console.log(page, loadedPages);
    console.log("calculating balance", transactions.length);
    const newBalance = transactions
      .map((transaction) => parseInt(transaction.value))
      .reduce((prev, curr, index) => {
        if (transactions[index].to === addr.toLowerCase()) {
          return prev + curr;
        } else {
          return prev - curr;
        }
      }, totalBalance);
    setTotalBalance(newBalance);
    loadedPages++;
  }, [transactions]);

  const prevPage = () => {
    if (!isLoading && page > 1) {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (!isLoading) {
      setPage(page + 1);
    }
  };

  const showTransactions = transactions && transactions.length && !isLoading;

  return (
    <div className="container px-4">
      <div className="transactions-container">
        {showTransactions ? (
          <table>
            <tr>
              <th>Hash</th>
              <th>Block</th>
              <th>Timestamp</th>
              <th>From Address</th>
              <th>To Address</th>
              <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Amount&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
            </tr>
            {transactions
              .filter(
                (transaction) =>
                  !hideEmptyTransactions || Number(transaction.value) > 0
              )
              .map((transaction) => (
                <tr key={transaction.hash}>
                  <td>{transaction.hash}</td>
                  <td>{transaction.blockNumber}</td>
                  <td>{timeAgo.format(Number(transaction.timeStamp) * 1000)}</td>
                  <td>{transaction.from}</td>
                  <td>{transaction.to}</td>
                  <td>{valueToEther(transaction.value)} ETH</td>
                </tr>
              ))}
          </table>
        ) : null}
        {isLoading ? "Loading..." : null}
      </div>
      <div className="controls">
        <button
          disabled={isLoading}
          onClick={prevPage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Previous Page
        </button>
        &nbsp;
        {page} / {loadedPages}
        &nbsp;
        <button
          disabled={isLoading}
          onClick={nextPage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {page < loadedPages ? "Next Page" : "Fetch Data"}
        </button>
        &nbsp;
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setHideEmptyTransactions(!hideEmptyTransactions)}
        >
          {hideEmptyTransactions
            ? "Show Empty Transactions"
            : "Hide Empty Transactions"}
        </button>
        {/* <div>
          Total balance: <b>{valueToEther(String(totalBalance))} ETH</b>
        </div> */}
      </div>
    </div>
  );
}
