import { createContext, useContext, useState } from "react";

const WendyContext = createContext();

export function WendyProvider({ children }) {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);

  return (
    <WendyContext.Provider value={{ state, setState, message, setMessage, products, setProducts }}>
      {children}
    </WendyContext.Provider>
  );
}

export function useWendy() {
  return useContext(WendyContext);
}