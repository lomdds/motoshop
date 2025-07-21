export const formatNumber = (price, meaning) => {
  if (!price) return "0 ₽";
  
  return price.toString()
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ` ${meaning}`;
};