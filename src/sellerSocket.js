import { io } from 'socket.io-client';


const sellerSocket = io('https://adminsellerbackend.onrender.com/');


const cleanUpSellerSocket = () => {
    sellerSocket.off();
    sellerSocket.disconnect();
};

export { sellerSocket, cleanUpSellerSocket };
