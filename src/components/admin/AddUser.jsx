import { SELLER_URL_LOCAL } from "@/lib/utils";
import React, { useState } from "react";

const ROLES = [
    "admin",
    "superAdmin",
    "guest",
    "issueSolver",
    "issueAssigner",
    "issueAssignerAndVerifier",
    "verifier",
    "UserExplore"
];

const AddUser = ({ onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        role: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setError(null);
        setSuccess(false);
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRoleChange = (value) => {
        setError(null);
        setSuccess(false);
        setFormData(prev => ({ ...prev, role: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.username.trim()) return "Username is required";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        if (!formData.role) return "Role is required";
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/addDashboardUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.message);
                return;
            }

            setSuccess(true);

            // Emit the new user to the parent component
            if (onUserAdded) {
                onUserAdded(data.user);
            }

            setFormData({ name: "", username: "", password: "", role: "" });
        } catch (error) {
            setError("Failed to save user. Please try again.");
            console.error("Error saving user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 space-y-4 bg-white border rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-center mb-6">Add New User</h2>

            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
                    User saved successfully!
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">Choose Role</option>
                        {ROLES.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isLoading ? "Saving..." : "Save User"}
                </button>
            </div>
        </div>
    );
};

export default AddUser;
