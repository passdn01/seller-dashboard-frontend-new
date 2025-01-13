import { io } from 'socket.io-client';

// Create and export a single instance of the buyer socket
const buyerSocket = io('https://8qklrvxb-6000.inc1.devtunnels.ms/');

// Utility function to clean up all listeners
const cleanUpBuyerSocket = () => {
    buyerSocket.off();
    buyerSocket.disconnect();
};

export { buyerSocket, cleanUpBuyerSocket };
