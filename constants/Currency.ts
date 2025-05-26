export const currencies = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
];

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) return `${amount.toFixed(2)}`;
  
  return `${currency.symbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export default currencies;