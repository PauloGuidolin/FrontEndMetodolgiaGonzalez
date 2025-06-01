// src/utils/formatUtils.ts

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2, // Asegura que siempre haya dos decimales
    maximumFractionDigits: 2, // Asegura que no haya más de dos decimales
  }).format(amount);
};