"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ContractTransactionResponse,
  ContractTransactionReceipt,
  ethers,
} from "ethers";
import { CONNECT_STATES, Web3Context } from "./Web3ContextProvider";
import SkyMainBrowser from "@decloudlabs/skynet/lib/services/SkyMainBrowser";
import SkyBrowserSigner from "@decloudlabs/skynet/lib/services/SkyBrowserSigner";
import SkyEtherContractService from "@decloudlabs/skynet/lib/services/SkyEtherContractService";
import toast from "react-hot-toast";
import {
  APICallReturn,
  APIResponse,
  ContractAddresses,
  SkyContractService,
  SkyEnvConfigBrowser,
} from "@decloudlabs/skynet/lib/types/types";
import { useWeb3Auth } from "@web3auth/modal-react-hooks";
import {
  AppManager,
  BalanceSettler,
  BalanceStore,
  CollectionNFT,
  NFT,
  NFTRoles,
  ERC20,
  Subscription,
  SecondsCostCalculator,
  NFTMinter,
  NFTRoles__factory,
  Subscription__factory,
  NFTMinter__factory,
  ERC20__factory,
  SecondsCostCalculator__factory,
  AppManager__factory,
  BalanceSettler__factory,
  CollectionNFT__factory,
  NFT__factory,
  BalanceStore__factory,
  NFTFactory,
  NFTFactory__factory,
} from "@decloudlabs/skynet/lib/types/contracts";
import { chainContracts } from "@decloudlabs/skynet/lib/utils/constants";
import { apiCallWrapper } from "@decloudlabs/skynet/lib/utils/utils";

interface AppCryptoConfig {
  skyBrowser: SkyMainBrowser | null;
  initAppCrypto: ((address: string) => Promise<void>) | null;
}

export const AppCryptoContext = createContext<AppCryptoConfig>({
  skyBrowser: null,
  initAppCrypto: null,
});

interface Props {
  children: ReactNode;
}

export function AppCryptoContextProvider({ children }: Props) {
  const [skyBrowser, setSkyBrowser] = useState<SkyMainBrowser | null>(null);
  const web3Context = useContext(Web3Context);
  const { provider } = useWeb3Auth();

  const initAppCrypto = async () => {
    try {
      console.log("initAppCrypto");
      const ethersProvider = new ethers.BrowserProvider(provider!);
      const signer = await ethersProvider.getSigner();
      const selectedAccount = signer.address;
      console.log("selectedAccount", selectedAccount);
      const contractInstance = new SkyEtherContractService(
        provider! as any,
        signer,
        selectedAccount,
        619
      );

      const defaultEnvConfig: SkyEnvConfigBrowser = {
        STORAGE_API: "https://appstorage-c0n33.stackos.io/api/lighthouse",
        CACHE: {
          TYPE: "CACHE",
        },
      };

      console.log("before create skyMainBrowser");
      const skyMainBrowser = new SkyMainBrowser(
        //@ts-ignore
        contractInstance!,
        contractInstance.selectedAccount,
        new SkyBrowserSigner(
          contractInstance.selectedAccount,
          contractInstance.signer
        ),
        defaultEnvConfig
      );

      console.log("after create skyMainBrowser");
      await skyMainBrowser.init(true);

      console.log("SkyMainBrowser:", skyMainBrowser);
      setSkyBrowser(skyMainBrowser);
    } catch (err: any) {
      const error: Error = err;
      console.log("error", error);
      toast.error(
        "Something went wrong. Please try reloading the page in a few minutes.",
        {
          position: "top-right",
        }
      );
    }
  };

  const initContractInstance = async (
    selectedAccount: string,
    provider: any
  ) => {
    if (!provider) return null;
    const signer = provider.getSigner();
    const constractService = new SkyEtherContractService(
      provider,
      signer,
      selectedAccount,
      619
    );
    return constractService;
  };

  useEffect(() => {
    if (
      web3Context.status !== CONNECT_STATES.CONNECTED ||
      !provider ||
      !("address" in web3Context)
    )
      return;
    initAppCrypto();
  }, [web3Context, provider]);

  return (
    <AppCryptoContext.Provider value={{ skyBrowser, initAppCrypto }}>
      {children}
    </AppCryptoContext.Provider>
  );
}
