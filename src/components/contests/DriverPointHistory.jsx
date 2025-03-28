import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Award, Calendar, Phone, User, Trophy } from 'lucide-react'

function DriverPointHistory() {
    const [contest, setContest] = useState(null);
    const [driver, setDriver] = useState(null);
    const [pointHistory, setPointHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { contestId, driverId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            fetchContest(),
            fetchDriverHistory(),
            fetchDriver()
        ]).finally(() => setLoading(false));
    }, [contestId, driverId]);

    const fetchContest = async () => {
        try {
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${contestId}`);
            setContest(response.data.data);
        } catch (error) {
            console.error('Error fetching contest:', error);
        }
    };

    const fetchDriverHistory = async () => {
        try {
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/point/history/${driverId}/${contestId}`);
            setPointHistory(response.data.data);
        } catch (error) {
            console.error('Error fetching driver point history:', error);
        }
    };

    const fetchDriver = async () => {
        try {
            const token = localStorage.getItem("token")
            const id = driverId
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setDriver(response.data.data.driverInfo);
        } catch (error) {
            console.error('Error fetching driver:', error);
        }
    };

    const handleBackToContest = () => {
        navigate(`/contests/view/${contestId}`);
    };

    const calculateTotalPoints = () => {
        return pointHistory.reduce((total, entry) => total + entry.points, 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <Button
                variant="outline"
                onClick={handleBackToContest}
                className="mb-6 hover:bg-gray-100 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contest
            </Button>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Contest Information */}
                {contest && (
                    <Card className="md:col-span-3 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Trophy className="mr-2 text-blue-600" />
                                Contest Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{contest.title}</h2>
                            <p className="text-gray-600">{contest.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Driver Info Card */}
                {driver && (
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 text-blue-600" />
                                Driver Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center space-y-4">
                                {driver.profileUrl && (
                                    <img
                                        src={driver.profileUrl}
                                        alt={`${driver.name}'s profile`}
                                        className="w-32 h-32 object-cover rounded-full border-4 border-blue-100"
                                    />
                                )}
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-800">{driver.name}</h3>
                                    <div className="flex items-center justify-center space-x-2 text-gray-600 mt-2">
                                        <Award className="h-4 w-4" />
                                        <span>{driver.category}</span>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2 text-gray-600 mt-1">
                                        <Phone className="h-4 w-4" />
                                        <span>{driver.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Point History Table */}
                <Card className="md:col-span-2 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="mr-2 text-blue-600" />
                            Point History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex justify-between items-center">
                            <span className="text-gray-600">Total Points Earned</span>
                            <span className="text-2xl font-bold text-blue-600">{calculateTotalPoints()}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-50 text-gray-700">
                                        <th className="border-b p-3 text-left">Category</th>
                                        <th className="border-b p-3 text-right">Points</th>
                                        <th className="border-b p-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pointHistory.map((entry) => (
                                        <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="border-b p-3">{entry.category}</td>
                                            <td className="border-b p-3 text-right font-semibold text-blue-600">{entry.points}</td>
                                            <td className="border-b p-3">
                                                {new Date(entry.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {pointHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center p-6 text-gray-500">
                                                No point history available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DriverPointHistory