"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BreadcrumbContextType = {
  items: string[];
  setItems: (items: string[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context)
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  return context;
};

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<string[]>([]);

  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
