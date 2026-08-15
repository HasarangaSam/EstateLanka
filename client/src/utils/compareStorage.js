const STORAGE_KEY = "estateLankaCompare";

export const getComparedProperties = () => {
  try {
    const storedProperties = localStorage.getItem(STORAGE_KEY);

    if (!storedProperties) {
      return [];
    }

    const parsedProperties = JSON.parse(storedProperties);

    // Make sure the stored value is actually an array.
    if (!Array.isArray(parsedProperties)) {
      return [];
    }

    return parsedProperties;
  } catch (error) {
    console.error("Failed to read compare properties:", error);

    return [];
  }
};

export const saveComparedProperties = (propertyIds) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(propertyIds));
  } catch (error) {
    console.error("Failed to save compare properties:", error);
  }
};

export const addToCompare = (propertyId) => {
  const currentProperties = getComparedProperties();

  // Don't add the same property twice.
  if (currentProperties.includes(propertyId)) {
    return {
      success: false,
      message: "Property is already in comparison.",
      properties: currentProperties,
    };
  }

  // Only allow two properties.
  if (currentProperties.length >= 2) {
    return {
      success: false,
      message: "You can compare only 2 properties at a time.",
      properties: currentProperties,
    };
  }

  const updatedProperties = [...currentProperties, propertyId];

  saveComparedProperties(updatedProperties);

  return {
    success: true,
    message: "Property added to comparison.",
    properties: updatedProperties,
  };
};

// ------------------------------------------------------------
// Remove a property from comparison
// ------------------------------------------------------------

export const removeFromCompare = (propertyId) => {
  const currentProperties = getComparedProperties();

  const updatedProperties = currentProperties.filter((id) => id !== propertyId);

  saveComparedProperties(updatedProperties);

  return updatedProperties;
};

// ------------------------------------------------------------
// Check whether a property is currently being compared
// ------------------------------------------------------------

export const isPropertyCompared = (propertyId) => {
  const currentProperties = getComparedProperties();

  return currentProperties.includes(propertyId);
};

// ------------------------------------------------------------
// Clear all compared properties
//
// We'll use this later for a "Clear comparison" button.
// ------------------------------------------------------------

export const clearComparedProperties = () => {
  localStorage.removeItem(STORAGE_KEY);
};
