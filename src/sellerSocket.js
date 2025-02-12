import { io } from 'socket.io-client';
import { SELLER_URL_LOCAL } from './lib/utils';

const sellerSocket = io(`${SELLER_URL_LOCAL}`);


const cleanUpSellerSocket = () => {
    sellerSocket.off();
    sellerSocket.disconnect();
};

export { sellerSocket, cleanUpSellerSocket };
