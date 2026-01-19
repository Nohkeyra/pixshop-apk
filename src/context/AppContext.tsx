import React, { createContext, useContext, useState } from 'react';
const AppContext = createContext<any>(null);
export const AppProvider = ({ children }: any) => {
  const [state, setState] = useState({});
  return <AppContext.Provider value={{ state, setState }}>{children}</AppContext.Provider>;
};
export const useAppContext = () => useContext(AppContext);
