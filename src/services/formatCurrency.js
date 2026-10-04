const formatCoursePrice = (amount) => {
  const price = Number(amount) || 0;

  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    currencyDisplay: "code",
    maximumFractionDigits: 0
  }).format(price);
};

export default formatCoursePrice;