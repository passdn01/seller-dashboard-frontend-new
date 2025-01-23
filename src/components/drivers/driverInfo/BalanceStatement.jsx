import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';

const DriverBalanceStatement = ({ data }) => {
    const { driverInfo: { transactionHistory } } = data;
    console.log("adf", transactionHistory[0]?.date)
    // Filter and process transactions
    const successfulTransactions = transactionHistory.filter(tx => tx.status === "SUCCESS");

    const cashInTransactions = successfulTransactions.filter(tx => tx.type === "credited");
    const cashOutTransactions = successfulTransactions.filter(tx => tx.type === "debited");

    // Calculate totals
    const totalCashIn = cashInTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalCashOut = cashOutTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Helper function to format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString); // Parse date

            if (isNaN(date.getTime())) {
                throw new Error("Invalid date string");
            }
            return format(date, "MMM d, yyyy");
        } catch (error) {
            console.error("Date formatting error:", error);
            return "Invalid date";
        }
    };
    const getHour = (dateString) => {
        try {
            const date = new Date(dateString); // Parse the date string
            if (isNaN(date.getTime())) {
                throw new Error("Invalid date string");
            }
            return format(date, "HH:mm"); // Format date to HH:mm
        } catch (error) {
            console.error("Date formatting error:", error.message);
            return "Invalid date";
        }
    };

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p>No transactions found</p>
        </div>
    );

    return (
        <div className="w-full p-4">
            <div className="text-xl font-semibold mb-4">Driver Balance Statement</div>

            <div className="flex gap-x-4 w-full">
                {/* Cash In Section */}
                <Card className='w-full'>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-medium">Total Cash In</div>
                            <Button variant="secondary" className="bg-blue-500 text-white">
                                Add Balance +
                            </Button>
                        </div>

                        <div className='flex justify-between border-b-2 '>
                            <span>date</span>
                            <span>title</span>
                            <span>amount</span>
                        </div>

                        <ScrollArea className="h-64 ">
                            {cashInTransactions.length > 0 ? (
                                cashInTransactions.map((tx) => (
                                    <div key={tx._id.$oid} className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm text-gray-600 flex flex-col">
                                            {formatDate(tx.date)}
                                            <span className='text-xs'>{getHour(tx.date)}</span>
                                        </span>
                                        <div className="flex flex-col">

                                            <span>{tx.title || "Transaction"}</span>
                                        </div>
                                        <div className="font-medium">
                                            {tx.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </ScrollArea>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total</span>
                                <span className="font-medium">{totalCashIn.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cash Out Section */}
                <Card className='w-full'>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-medium">Total Cash Out</div>
                            <Button variant="secondary" className="bg-blue-500 text-white">
                                Cut Balance +
                            </Button>
                        </div>

                        <div className='flex justify-between border-b-2 '>
                            <span>date</span>
                            <span>title</span>
                            <span>amount</span>
                        </div>

                        <ScrollArea className="h-64     ">
                            {cashOutTransactions.length > 0 ? (
                                cashOutTransactions.map((tx) => (
                                    <div key={tx._id.$oid} className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm text-gray-600 flex flex-col">
                                            {formatDate(tx.date)}
                                            <span className='text-xs'>{getHour(tx.date)}</span>
                                        </span>
                                        <div className="flex flex-col">

                                            <span>{tx.title || "Transaction"}</span>
                                        </div>
                                        <div className="font-medium">
                                            {tx.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </ScrollArea>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total</span>
                                <span className="font-medium">{totalCashOut.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DriverBalanceStatement;
