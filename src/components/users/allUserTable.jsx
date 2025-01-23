import React, { useState, useMemo } from "react";
import { format } from "date-fns";

const allUserTable = ({ users }) => {
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [coinRange, setCoinRange] = useState({ min: 0, max: Infinity });
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });


    const filteredData = useMemo(() => {
        return users
            .filter((user) => {

                const matchesSearch =
                    user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                    user.phone?.includes(search);


                const matchesGender = genderFilter ? user.gender === genderFilter : true;


                const matchesCoins =
                    user.coins >= (coinRange.min || 0) &&
                    user.coins <= (coinRange.max || Infinity);


                const userCreatedAt = new Date(user.createdAt);
                const matchesDate =
                    (!dateFilter.from || userCreatedAt >= new Date(dateFilter.from)) &&
                    (!dateFilter.to || userCreatedAt <= new Date(dateFilter.to));

                return matchesSearch && matchesGender && matchesCoins && matchesDate;
            })
            .map((user) => ({
                ...user,
                totalRides: user.rideCreated.length,
            }));
    }, [users, search, genderFilter, coinRange, dateFilter]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Users Table</h1>


            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name or number"
                    className="border p-2 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="border p-2 rounded"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <div className="flex items-center gap-2">
                    <span>Coins:</span>
                    <input
                        type="number"
                        placeholder="Min"
                        className="border p-2 rounded w-20"
                        value={coinRange.min}
                        onChange={(e) =>
                            setCoinRange((prev) => ({ ...prev, min: Number(e.target.value) }))
                        }
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        className="border p-2 rounded w-20"
                        value={coinRange.max}
                        onChange={(e) =>
                            setCoinRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                        }
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span>Date:</span>
                    <input
                        type="date"
                        className="border p-2 rounded"
                        onChange={(e) =>
                            setDateFilter((prev) => ({ ...prev, from: e.target.value }))
                        }
                    />
                    <input
                        type="date"
                        className="border p-2 rounded"
                        onChange={(e) =>
                            setDateFilter((prev) => ({ ...prev, to: e.target.value }))
                        }
                    />
                </div>
            </div>


            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Created At</th>
                        <th className="border border-gray-300 p-2">User Number</th>
                        <th className="border border-gray-300 p-2">User Name</th>
                        <th className="border border-gray-300 p-2">Gender</th>
                        <th className="border border-gray-300 p-2">Coins</th>
                        <th className="border border-gray-300 p-2">Total Rides</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((user) => (
                        <tr key={user._id}>
                            <td className="border border-gray-300 p-2">
                                {format(new Date(user.createdAt), "yyyy-MM-dd")}
                            </td>
                            <td className="border border-gray-300 p-2">{user.phone}</td>
                            <td className="border border-gray-300 p-2">
                                {user.firstName} {user.lastName}
                            </td>
                            <td className="border border-gray-300 p-2">{user.gender}</td>
                            <td className="border border-gray-300 p-2">{user.coins}</td>
                            <td className="border border-gray-300 p-2">{user.totalRides}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default allUserTable;
