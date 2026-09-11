export const industryTemplates = {
  pharmacy: {
    label: "Pharmacy / Medical Supplier",
    itemFields: ["batchNumber", "expiryDate", "manufacturer", "prescriptionRequired"],
    unitOptions: ["strip", "bottle", "box", "vial"],
  },
  electronics: {
    label: "Electronics Supplier",
    itemFields: ["serialNumber", "warrantyMonths", "brand", "model"],
    unitOptions: ["piece", "unit", "carton"],
  },
  grocery_fmcg: {
    label: "Grocery / FMCG Distributor",
    itemFields: ["expiryDate", "batchNumber", "storageTemp"],
    unitOptions: ["kg", "litre", "carton", "sack"],
  },
  apparel_fashion: {
    label: "Apparel / Fashion Supplier",
    itemFields: ["size", "color", "season", "material"],
    unitOptions: ["piece", "set", "dozen"],
  },
  automotive_parts: {
    label: "Automotive Parts Supplier",
    itemFields: ["partNumber", "compatibleModels", "warrantyMonths"],
    unitOptions: ["piece", "set", "box"],
  },
  construction_hardware: {
    label: "Construction / Hardware Supplier",
    itemFields: ["dimensions", "materialType", "supplierGrade"],
    unitOptions: ["piece", "kg", "meter", "bag", "roll"],
  },
  furniture: {
    label: "Furniture Supplier",
    itemFields: ["dimensions", "material", "assemblyRequired"],
    unitOptions: ["piece", "set"],
  },
  general: {
    label: "General / Other",
    itemFields: ["customField1", "customField2"],
    unitOptions: ["piece", "kg", "litre", "box"],
  }
};