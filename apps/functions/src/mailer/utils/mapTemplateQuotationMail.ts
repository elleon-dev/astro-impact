export interface QuotationMustacheView {
  theme: string;
  client: {
    name: string;
    logotipoUrl: string;
    textColor: string;
    bgColor: string;
    hostname: string;
  };
  quotation: {
    fullName: string;
    phoneNumber: string;
    email: string;
    planType: string;
    businessLine: string;
    accountingAdvice: boolean;
    spreadsheet: boolean;
    typeAccounting: string;
    monthlyPurchases: string;
    ruc: string;
    taxRegime: string;
    monthlyBudget: string;
    howManyWorkers: number;
    monthlySales: number;
  };
}

export const mapTemplateQuotationMustache = (
  contact: EmailQuotation,
  client: Client,
): QuotationMustacheView => {
  return {
    theme: client.theme,
    client: {
      name: client.name,
      logotipoUrl: client.logotipo.thumbUrl,
      textColor: client.textColor,
      bgColor: client.bgColor,
      hostname: client.hostname,
    },
    quotation: {
      fullName: contact?.fullName || "",
      phoneNumber: `${contact.phone.countryCode} ${contact.phone.number}`,
      email: contact?.email || "",
      planType: contact?.planType || "",
      businessLine: contact?.businessLine || "",
      accountingAdvice: contact?.accountingAdvice || false,
      spreadsheet: contact?.spreadsheet || false,
      typeAccounting: contact?.typeAccounting || "",
      monthlyPurchases: contact?.monthlyPurchases || "",
      ruc: contact?.ruc || "",
      taxRegime: contact?.taxRegime || "",
      monthlyBudget: contact?.monthlyBudget || "",
      howManyWorkers: contact?.howManyWorkers || 0,
      monthlySales: contact?.monthlySales || 0,
    },
  };
};
