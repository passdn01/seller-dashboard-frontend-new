import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SELLER_URL_LOCAL } from '@/lib/utils';


const UserCashStatement = ({ userId }) => {
    const [coinTransactions, setCoinTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [coinAction, setCoinAction] = useState(null); // 'add' or 'cut'
    const [coins, setCoins] = useState(0);
    const [title, setTitle] = useState('');

    const fetchCoinStatement = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/getUserCoinStatement`, { userId });
            setCoinTransactions(response.data.coinTransactions || []);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoinStatement();
    }, [userId]);

    const handleConfirm = async () => {
        if (!coins) return;
        const amount = coins / 10;
        const isDebit = coinAction === 'cut';

        try {
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/modifyCoinBalance`, {
                userId,
                title,
                coins,
                amount,
                isDebit,
                coinAction
            });

            console.log(response);

            if (response?.data?.success) {
                setDialogOpen(false);
                setCoins(0);
                setTitle('');
                window.alert("Changes made successfully successfully")
                fetchCoinStatement();
            } else {
                window.alert(response?.data?.message || "Failed to modify coins");
            }
        } catch (error) {
            console.error("Error modifying coin balance:", error);
        }
    };

    // Calculate total cash in and cash out
    const totalCashIn = coinTransactions
        .filter(tx => !tx.isDebit)
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
        .toFixed(2);

    const totalCashOut = coinTransactions
        .filter(tx => tx.isDebit)
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
        .toFixed(2);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching transactions</div>;

    return (
        <div className="w-full p-4">
            <div className="text-xl font-semibold mb-4">User Coin Transaction Statement</div>

            <div className="flex gap-x-4 w-full">
                {/* Coins In Section */}
                <Card className='w-full'>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-medium">Total Cash In</div>

                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-green-500 text-white" onClick={() => setCoinAction('add')}>
                                        Add Coins
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-96 h-96">
                                    <DialogHeader>
                                        <DialogTitle>{coinAction === 'add' ? "Add Coins" : "Cut Coins"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 px-8">
                                        <div>
                                            <Label>Title</Label>
                                            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Coins</Label>
                                            <Input type="number" value={coins} onChange={(e) => setCoins(e.target.value)} />
                                            <p className="text-gray-500">Amount: {coins / 10}</p>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button onClick={handleConfirm}>
                                            {coinAction === 'add' ? "Add" : "Cut"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {/* Transactions List */}
                        <div className='grid grid-cols-3 gap-x-32 justify-between border-b-2'>
                            <span>Date</span>
                            <span>Title</span>
                            <span>Amount</span>
                        </div>
                        <ScrollArea className="h-64">
                            {coinTransactions.filter(tx => !tx.isDebit).length > 0 ? (
                                coinTransactions.filter(tx => !tx.isDebit).map((tx) => (
                                    <div key={tx._id} className="grid grid-cols-3 justify-between items-center py-2 border-b gap-x-32">
                                        <span className="text-sm text-gray-600 flex-col flex">
                                            <span>{format(new Date(tx.createdAt), "MMM d, yyyy")}</span>
                                            <span className='text-sm muted'>{format(new Date(tx.createdAt), "HH:mm")}</span>
                                        </span>
                                        <span>{tx.title || "Transaction"}</span>
                                        <div className="font-medium text-green-600">+{tx.amount}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No coin transactions found</p>
                            )}
                        </ScrollArea>
                        {/* Total Cash In */}
                        <div className="mt-4 py-3 border-t-2 flex justify-between items-center">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="font-bold text-lg text-green-600">+{totalCashIn}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Coins Out Section */}
                <Card className='w-full'>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-medium">Total Cash Out</div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-red-500 text-white" onClick={() => setCoinAction('cut')}>
                                        Cut Coins
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-96 h-96">
                                    <DialogHeader>
                                        <DialogTitle>{coinAction === 'add' ? "Add Coins" : "Cut Coins"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 px-8">
                                        <div>
                                            <Label>Title</Label>
                                            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Coins</Label>
                                            <Input type="number" value={coins} onChange={(e) => setCoins(e.target.value)} />
                                            <p className="text-gray-500">Amount: {coins / 10}</p>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button onClick={handleConfirm}>
                                            {coinAction === 'add' ? "Add" : "Cut"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className=' justify-between border-b-2 grid-cols-3 grid gap-x-32'>
                            <span>Date</span>
                            <span>Title</span>
                            <span>Amount</span>
                        </div>
                        {/* Transactions List */}
                        <ScrollArea className="h-64">
                            {coinTransactions.filter(tx => tx.isDebit).length > 0 ? (
                                coinTransactions.filter(tx => tx.isDebit).map((tx) => (
                                    <div key={tx._id} className="grid grid-cols-3 justify-between items-center py-2 border-b gap-x-32">
                                        <span className="text-sm text-gray-600 flex-col flex">
                                            <span>{format(new Date(tx.createdAt), "MMM d, yyyy")}</span>
                                            <span className='text-sm muted'>{format(new Date(tx.createdAt), "HH:mm")}</span>
                                        </span>
                                        <span>{tx.title || "Transaction"}</span>
                                        <div className="font-medium text-red-600">-{tx.amount}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No coin transactions found</p>
                            )}
                        </ScrollArea>
                        {/* Total Cash Out */}
                        <div className="mt-4 py-3 border-t-2 flex justify-between items-center">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="font-bold text-lg text-red-600">-{totalCashOut}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserCashStatement;