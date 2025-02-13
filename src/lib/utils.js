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

export const SELLER_URL_LOCAL = "https://65.2.70.35"
// export const SELLER_URL_LOCAL = "https://8qklrvxb-5000.inc1.devtunnels.ms"

