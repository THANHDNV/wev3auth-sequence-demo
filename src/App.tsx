import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/web3auth";
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, CONNECTED_EVENT_DATA, SafeEventEmitterProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import RPC from "./evm";
import "./App.css";

const clientId = "BESA04VlDTkUmO4I7Wzh4v0KG5edF1LfzpewsIt-RcHnKKVcZUAMTbC5wO20CViz0NQjQhTqFhA1IOfJoR_VB3Y"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  useEffect(() => {
    const init = async () => {
      try {

        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x13881",
            rpcTarget: "https://rpc.ankr.com/polygon_mumbai", // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
          },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            clientId,
            network: "testnet",
            uxMode: "popup",
            loginConfig: {
              // Add login configs corresponding to the providers on modal
              // Google login
              google: {
                name: "Custom Auth Login",
                verifier: "remitano-google-testnet", // Please create a verifier on the developer dashboard and pass the name here
                typeOfLogin: "google", // Pass on the login provider of the verifier you've created
                clientId: "160549532150-or2p864jrm8fabrjumuih4hdrqp2gudb.apps.googleusercontent.com", // Pass on the clientId of the login provider here - Please note this differs from the Web3Auth ClientID. This is the JWT Client ID
              },
              jwt: {
                name: "Google NFT5",
                verifier: 'remitano-google-backend-testnet',
                typeOfLogin: 'jwt',
                clientId: "BESA04VlDTkUmO4I7Wzh4v0KG5edF1LfzpewsIt-RcHnKKVcZUAMTbC5wO20CViz0NQjQhTqFhA1IOfJoR_VB3Y"
              }
            },
          },
        });

        web3auth.configureAdapter(openloginAdapter);

        const onAdapterConnected = (data: CONNECTED_EVENT_DATA) => {
          console.log('connected')
          setProvider(web3auth.provider)
        }

        web3auth.addListener(ADAPTER_EVENTS.CONNECTED, onAdapterConnected)
        setWeb3auth(web3auth);

        await web3auth.initModal();

        return () => {
          web3auth.removeListener(ADAPTER_EVENTS.CONNECTED, onAdapterConnected)
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }

    // await web3auth.logout()
    await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      relogin: true,
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiZDcxMTJjLWY4YzEtNDkyZi1hZTc3LTQ3YjFlN2E3MGQ4ZiIsImVtYWlsIjoidGhhbmhkYW9AcmVtaXRhbm8uY29tIiwiYWRkcmVzcyI6bnVsbCwiaWF0IjoxNjU3NzczMTMzLCJhdWQiOiJCRVNBMDRWbERUa1VtTzRJN1d6aDR2MEtHNWVkRjFMZnpwZXdzSXQtUmNIbktLVmNaVUFNVGJDNXdPMjBDVml6ME5RalFoVHFGaEExSU9mSm9SX1ZCM1kifQ.rRL23Bi9WuMjLunGJdKz6UGgeoRfqde1K_N084XVyOV5JQCACSsUHt1YBc8yS4QNT3P2N9uhs2fQueyzI8DdDcjx86XzC1_KLdLJRG8A0Ntg1gTx0Zghc7W-z8Hmg7-oD5_mL2eWYu5cq0_xfvmjsGInTcQQMoeQhgcfjwE-OHOqY_4MxnjCytL4_UWJNQ_8cnx0zTbDaP41JiOAhxngpvZu9sm5HmP7e-G1GDpx7g0A_M-LsiteD31b7MKxZP5Vt9ZErJpf7ye6TKm7MreklfetKZK6aQh8FynbFkqbPfcnSq64_0RxzDr_18O69dZ-wEjr0fCLUAZ9FLFzSAKprQ',
        domain: "http://localhost:3000",
        verifierIdField: "email",
      }
    });
    // setProvider(web3authProvider);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user)
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    console.log(userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  };

  const getSequenceWallet = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getSequenceAddress();
    console.log(balance);
  }

  const getUSDTBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getUSDTBalance();
    console.log(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signMessage();
    console.log(result);
  };

  const signTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signTransaction();
    console.log(result);
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendTransaction();
    console.log(result);
  };

  const sendNative = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendNative();
    console.log(result);
  };

  const sendUSDT = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.sendUSDT();
    console.log(result);
  }

  const getToken1Balance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.getToken1Balance();
    console.log(result);
  }

  const buyToken1 = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.buyToken1();
    console.log(result);
  }

  const loggedInView = (
    <>
      <div>
        {/* <button onClick={getUserInfo} className="card">
          Get User Info
        </button>
        <button onClick={getAccounts} className="card">
          Get Accounts
        </button> */}
        <button onClick={getSequenceWallet} className="card">
          Get Sequence Wallet
        </button>
        {/* <button onClick={getBalance} className="card">
          Get Balance
        </button> */}
        <button onClick={getUSDTBalance} className="card">
          Get USDT Balance
        </button>
        {/* <button onClick={signMessage} className="card">
          Sign Message
        </button> */}
        {/* <button onClick={signTransaction} className="card">
          Sign Transaction
        </button> */}
        {/* <button onClick={sendTransaction} className="card">
          Send Transaction
        </button> */}
        <button onClick={sendNative} className="card">
          Transfer 0.01 MATIC/ETH/BNB
        </button>
        <button onClick={sendUSDT} className="card">
          Transfer 0.001 USDT
        </button>
        <button onClick={getToken1Balance} className="card">
          Get NFT Token 1 balance
        </button>
        <button onClick={buyToken1} className="card">
          Buy Token 1
        </button>
        {/* <button onClick={logout} className="card">
          Log Out
        </button> */}
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        & ReactJS Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
