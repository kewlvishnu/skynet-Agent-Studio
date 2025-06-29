'use client';

import { CONNECT_STATES } from '@/lib/constants';
import { createContext, useContext, useState, ReactNode } from 'react';

interface Web3ContextType {
  status: CONNECT_STATES;
  isAuthenticated: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  status: CONNECT_STATES.DISCONNECTED,
  isAuthenticated: false,
  address: null,
  connect: async () => {},
  disconnect: () => {},
});

export function useWeb3Context() {
  return useContext(Web3Context);
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CONNECT_STATES>(CONNECT_STATES.DISCONNECTED);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    try {
      setStatus(CONNECT_STATES.CONNECTING);
      // Implement your Web3 connection logic here
      setStatus(CONNECT_STATES.CONNECTED);
      setIsAuthenticated(true);
      setAddress('0xdd17D3e3335B758ae1a67f2C57bCe2752ad40616'); // Example address
    } catch (error) {
      console.error('Error connecting to Web3:', error);
      setStatus(CONNECT_STATES.ERROR);
    }
  };

  const disconnect = () => {
    setStatus(CONNECT_STATES.DISCONNECTED);
    setIsAuthenticated(false);
    setAddress(null);
  };

  return (
    <Web3Context.Provider
      value={{
        status,
        isAuthenticated,
        address,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
} 