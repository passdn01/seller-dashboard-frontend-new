import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const getCookie = (name) => {
  const cookieArray = document.cookie.split('; ');
  const cookie = cookieArray.find((row) => row.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
};

export const SELLER_URL_LOCAL = "https://55kqzrxn-5000.inc1.devtunnels.ms"
export const BUYER_URL_LOCAL = "https://55kqzrxn-6000.inc1.devtunnels.ms"