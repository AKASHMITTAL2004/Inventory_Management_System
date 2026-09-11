const industryTemplates = {
  pharmacy: {
    label: "Pharmacy / Medical Supplier",
    itemFields: ["batchNumber", "expiryDate", "manufacturer", "prescriptionRequired"],
    unitOptions: ["strip", "bottle", "box", "vial"],
    dashboardWidgets: ["expiringSoon", "lowStock", "totalValuation", "topSellingItems"],
    alerts: ["expiryWithin30Days", "lowStock", "recalledBatch"]
  },
  electronics: {
    label: "Electronics Supplier",
    itemFields: ["serialNumber", "warrantyMonths", "brand", "model"],
    unitOptions: ["piece", "unit", "carton"],
    dashboardWidgets: ["warrantyExpiringSoon", "lowStock", "totalValuation", "topSellingItems"],
    alerts: ["warrantyExpiringSoon", "lowStock", "highReturnRate"]
  },
  grocery_fmcg: {
    label: "Grocery / FMCG Distributor",
    itemFields: ["expiryDate", "batchNumber", "storageTemp"],
    unitOptions: ["kg", "litre", "carton", "sack"],
    dashboardWidgets: ["expiringSoon", "lowStock", "totalValuation", "fastMovingItems"],
    alerts: ["expiryWithin7Days", "lowStock"]
  },
  apparel_fashion: {
    label: "Apparel / Fashion Supplier",
    itemFields: ["size", "color", "season", "material"],
    unitOptions: ["piece", "set", "dozen"],
    dashboardWidgets: ["lowStock", "totalValuation", "seasonalTrends", "topSellingItems"],
    alerts: ["lowStock", "endOfSeasonOverstock"]
  },
  automotive_parts: {
    label: "Automotive Parts Supplier",
    itemFields: ["partNumber", "compatibleModels", "warrantyMonths"],
    unitOptions: ["piece", "set", "box"],
    dashboardWidgets: ["lowStock", "totalValuation", "topSellingItems", "recentActivity"],
    alerts: ["lowStock", "warrantyExpiringSoon"]
  },
  construction_hardware: {
    label: "Construction / Hardware Supplier",
    itemFields: ["dimensions", "materialType", "supplierGrade"],
    unitOptions: ["piece", "kg", "meter", "bag", "roll"],
    dashboardWidgets: ["lowStock", "totalValuation", "bulkOrderAlerts", "recentActivity"],
    alerts: ["lowStock", "bulkReorderDue"]
  },
  furniture: {
    label: "Furniture Supplier",
    itemFields: ["dimensions", "material", "assemblyRequired"],
    unitOptions: ["piece", "set"],
    dashboardWidgets: ["lowStock", "totalValuation", "topSellingItems", "recentActivity"],
    alerts: ["lowStock"]
  },
  general: {
    label: "General / Other",
    itemFields: ["customField1", "customField2"],
    unitOptions: ["piece", "kg", "litre", "box"],
    dashboardWidgets: ["lowStock", "totalValuation", "recentActivity"],
    alerts: ["lowStock"]
  }
};

export default industryTemplates;