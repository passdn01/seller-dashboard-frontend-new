import { io } from 'socket.io-client';
import { BUYER_URL_LOCAL } from './lib/utils';

// Create and export a single instance of the buyer socket
const buyerSocket = io(`${BUYER_URL_LOCAL}`);

// Utility function to clean up all listeners
const cleanUpBuyerSocket = () => {
    buyerSocket.off();
    buyerSocket.disconnect();
};

export { buyerSocket, cleanUpBuyerSocket };
