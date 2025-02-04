import React, { createContext, useContext, useState } from 'react';

interface SearchOverlayContextType {
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextType | undefined>(undefined);

export const SearchOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSetIsSearching = (value: boolean) => {
    console.log('SearchOverlay state changing to:', value);
    setIsSearching(value);
  };

  return (
    <SearchOverlayContext.Provider value={{ isSearching, setIsSearching: handleSetIsSearching }}>
      {children}
    </SearchOverlayContext.Provider>
  );
};

export const useSearchOverlay = () => {
  const context = useContext(SearchOverlayContext);
  if (context === undefined) {
    throw new Error('useSearchOverlay must be used within a SearchOverlayProvider');
  }
  return context;
}; 