import { io } from 'socket.io-client';


const sellerSocket = io('https://adminsellerbackend-1.onrender.com/');


const cleanUpSellerSocket = () => {
    sellerSocket.off();
    sellerSocket.disconnect();
};

export { sellerSocket, cleanUpSellerSocket };
