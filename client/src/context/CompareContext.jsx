import { createContext, useContext, useState } from "react";

import {
  getComparedProperties,
  addToCompare,
  removeFromCompare,
  clearComparedProperties,
} from "../utils/compareStorage";

// ------------------------------------------------------------
// Create the Compare Context
// ------------------------------------------------------------

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState(() => getComparedProperties());

  // ----------------------------------------------------------
  // Add property to comparison
  // ----------------------------------------------------------

  const addPropertyToCompare = (propertyId) => {
    const result = addToCompare(propertyId);

    // Only update React state if the storage operation
    // successfully changed the comparison list.
    if (result.success) {
      setCompareIds(result.properties);
    }

    return result;
  };

  // ----------------------------------------------------------
  // Remove property from comparison
  // ----------------------------------------------------------

  const removePropertyFromCompare = (propertyId) => {
    const updatedProperties = removeFromCompare(propertyId);

    setCompareIds(updatedProperties);

    return updatedProperties;
  };

  // ----------------------------------------------------------
  // Check whether a property is currently compared
  // ----------------------------------------------------------

  const isCompared = (propertyId) => {
    return compareIds.includes(propertyId);
  };

  // ----------------------------------------------------------
  // Clear all comparisons
  // ----------------------------------------------------------

  const clearCompare = () => {
    clearComparedProperties();

    setCompareIds([]);
  };

  // ----------------------------------------------------------
  // Context values
  // ----------------------------------------------------------

  const value = {
    compareIds,
    compareCount: compareIds.length,

    addPropertyToCompare,
    removePropertyFromCompare,

    isCompared,

    clearCompare,
  };

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used inside CompareProvider");
  }

  return context;
};
