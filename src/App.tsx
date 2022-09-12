import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Coinlink from "./components/Coinlink/Coinlink";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import { ethers } from "ethers";
import {
  deployCoinlink,
  getCoinlinkFactoryBalance,
  getDeployedCoinlinks,
} from "./services/web3Service";
import { useWeb3 } from "./Web3ModalContext";
import MainLayout from "./MainLayout";

const App = () => {
  const web3 = useWeb3();
  const [coinlinks, setCoinlinks] = useState([]);
  const [factoryBalance, setFactoryBalance] = useState("");
  const [initialAmount, setInitialAmount] = useState("");

  const onDeployCoinlink = async () => {
    if (!web3.signer || !web3.provider) return;
    try {
      const result = await deployCoinlink(web3.signer);
      console.log("result", result);
      setCoinlinks(await getDeployedCoinlinks(web3.signer));
      const balance = await getCoinlinkFactoryBalance(web3.provider);
      setFactoryBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout
              coinlinks={coinlinks}
              initialAmount={initialAmount}
              factoryBalance={factoryBalance}
              onDeployCoinlink={onDeployCoinlink}
            />
          }
        >
          <Route
            path="/"
            element={
              <AdminPanel
                coinlinks={coinlinks}
                setCoinlinks={setCoinlinks}
                balance={factoryBalance}
                setBalance={setFactoryBalance}
                initialAmount={initialAmount}
                setInitialAmount={setInitialAmount}
              />
            }
          />
          <Route path="coinlinks/:address" element={<Coinlink />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
