import { io } from 'socket.io-client';


const sellerSocket = io('https://55kqzrxn-5000.inc1.devtunnels.ms/');


const cleanUpSellerSocket = () => {
    sellerSocket.off();
    sellerSocket.disconnect();
};

export { sellerSocket, cleanUpSellerSocket };
