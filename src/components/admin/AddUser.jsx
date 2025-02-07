import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";

const roles = [
    "admin",
    "superAdmin",
    "guest",
    "issueSolver",
    "issueAssigner",
    "issueAssignerPro",
    "verifier",
    "UserExplore"
];

const AddUser = () => {
    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (value) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("/dashboard/api/addDashboardUser", formData);
            alert("User saved successfully");
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user");
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md flex flex-col gap-2">
            <label className="block text-sm font-medium">Name</label>
            <Input name="name" onChange={handleChange} className="mb-4" required />

            <label className="block text-sm font-medium">User Name</label>
            <Input name="username" onChange={handleChange} className="mb-4" required />

            <label className="block text-sm font-medium">Password</label>
            <Input name="password" type="password" onChange={handleChange} className="mb-4" required />

            <label className="block text-sm font-medium">Role</label>
            <Select onValueChange={handleRoleChange}>
                <SelectTrigger>Choose</SelectTrigger>
                <SelectContent>
                    {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button onClick={handleSubmit} className="mt-4 w-full">Save</Button>
        </div>
    );
};

export default AddUser;
