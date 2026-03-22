export function formatCurrency(amount: number, currency = 'BDT'): string {
  const symbol = currency === 'BDT' ? '৳' : currency;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
