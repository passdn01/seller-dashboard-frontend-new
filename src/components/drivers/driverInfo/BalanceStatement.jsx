import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { SELLER_URL_LOCAL } from '@/lib/utils';

// Helper functions for formatting
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return format(date, "MMM d, yyyy");
    } catch {
        return "Invalid date";
    }
};

const getHour = (dateString) => {
    try {
        const date = new Date(dateString);
        return format(date, "HH:mm");
    } catch {
        return "Invalid time";
    }
};

const TransactionSection = ({ title, transactions, type, onOpenDialog }) => {
    const isCashIn = type === 'add';
    const formattedAmountClass = isCashIn ? 'font-medium text-green-600' : 'font-medium text-red-600';
    const sign = isCashIn ? '+' : '-';

    const totalCash = transactions.reduce((total, tx) => total + (isCashIn ? tx.amount : tx.amount), 0);

    return (
        <Card className="w-full">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-medium">{title}</div>
                    <Button
                        className={isCashIn ? "bg-blue-500 text-white" : "bg-red-500 text-white"}
                        onClick={() => onOpenDialog(type)}
                    >
                        {isCashIn ? "Add Balance +" : "Cut Balance -"}
                    </Button>
                </div>

                <div className="flex justify-between border-b-2">
                    <span>Date</span>
                    <span>Title</span>
                    <span>Amount</span>
                </div>

                <ScrollArea className="h-64">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx._id} className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600 flex flex-col">
                                    {formatDate(tx.date)}
                                    <span className="text-xs">{getHour(tx.date)}</span>
                                </span>
                                <span>{tx.title || "Transaction"}</span>
                                <span className={formattedAmountClass}>{sign}{tx.amount.toFixed(2)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center py-4">No transactions found</div>
                    )}
                </ScrollArea>


                {transactions.length > 0 && (
                    <div className="flex justify-between items-center mt-4 border-t-2 pt-4">
                        <span className="font-medium">Total Cash</span>
                        <span className={formattedAmountClass}>{sign}{totalCash.toFixed(2)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};



const TransactionDialog = ({ open, setOpen, dialogType, handleTransaction, loading, error, amount, setAmount, title, setTitle }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md h-96">
                <DialogHeader>
                    <DialogTitle>{dialogType === "add" ? "Add Balance" : "Cut Balance"}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                </div>

                <DialogFooter>
                    <Button onClick={handleTransaction} disabled={loading || parseFloat(amount) === 0}>
                        {loading ? "Processing..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const DriverBalanceStatement = ({ data }) => {
    const { driverInfo: { transactionHistory, _id, balance } } = data;
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState(""); // "add" or "cut"
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Filter successful transactions
    const successfulTransactions = transactionHistory.filter(tx => tx.status === "SUCCESS" || tx.status === "Success");

    const cashInTransactions = successfulTransactions.filter(tx => tx.type === "credited");
    const cashOutTransactions = successfulTransactions.filter(tx => tx.type === "debited");



    // Handle API Request
    const handleTransaction = async () => {
        // Check if amount is zero
        if (parseFloat(amount) === 0) {
            setError("Amount cannot be zero.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            console.log("adfa")
            console.log(data?.driverInfo?._id)
            console.log(`${SELLER_URL_LOCAL}/dashboard/api/seller/balance?type=${dialogType === "add" ? "add" : "cut"}`)
            const response = await fetch(`${SELLER_URL_LOCAL}/dashboard/api/seller/balance?type=${dialogType === "add" ? "add" : "cut"}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    driverId: data?.driverInfo?._id,
                    amount: parseFloat(amount),
                    by: localStorage.getItem("admin"),
                    title,
                }),
            });



            console.log("2")

            const result = await response.json();

            console.log(result, "result")

            if (result.success) {
                alert(`Balance ${dialogType === "add" ? "added" : "deducted"} successfully!`);
                window.location.reload();
            } else {
                setError(result.message || "Transaction failed.");
            }
        } catch (err) {
            setError("An error occurred while processing the request.");
        }

        setLoading(false);
        setOpenDialog(false);
    };



    return (
        <div className="w-full p-4">
            <div className="text-xl font-semibold mb-4">Driver Balance Statement</div>
            <div className="text-md mb-2">Current Balance: <strong>{balance.toFixed(2)}</strong></div>

            <div className="flex gap-x-4 w-full">
                {/* Cash In Section */}
                <TransactionSection
                    title="Total Cash In"
                    transactions={cashInTransactions}
                    type="add"
                    onOpenDialog={(type) => { setOpenDialog(true); setDialogType(type); }}
                />

                {/* Cash Out Section */}
                <TransactionSection
                    title="Total Cash Out"
                    transactions={cashOutTransactions}
                    type="cut"
                    onOpenDialog={(type) => { setOpenDialog(true); setDialogType(type); }}
                />
            </div>

            {/* Transaction Dialog */}
            <TransactionDialog
                open={openDialog}
                setOpen={setOpenDialog}
                dialogType={dialogType}
                handleTransaction={handleTransaction}
                loading={loading}
                error={error}
                amount={amount}
                setAmount={setAmount}
                title={title}
                setTitle={setTitle}
            />
        </div>
    );
};

export default DriverBalanceStatement;
