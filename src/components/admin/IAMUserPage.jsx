import React, { useEffect, useState } from 'react'
import SideNavbar from '../SideNavbar'
import RoleCard from './RoleCard'
import Header from '../drivers/allDrivers/Header'
import RoleList from './RoleList'
import CurrentUserCard from './CurrentUserCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button'
import AddUser from './AddUser'
import { SELLER_URL_LOCAL } from '@/lib/utils'

function IAMUserPage() {
    const [roleData, setRoleData] = useState([])
    const [filteredRoleData, setFilteredRoleData] = useState([])
    const [roleFilter, setRoleFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const username = localStorage.getItem('username')

    const roles = [
        "all",
        "admin",
        "superAdmin",
        "guest",
        "issueSolver",
        "issueAssigner",
        "verifierAndIssueAssigner",
        "verifier",
        "UserExplore"
    ]

    useEffect(() => {
        try {
            fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/getDashboardUsers`)
                .then(response => response.json())
                .then(data => {
                    const filtered = data.data.filter((role) => role.username !== username)
                    setRoleData(filtered)
                    setFilteredRoleData(filtered)
                })
        }
        catch (e) {
            console.log(e)
        }
    }, [])

    useEffect(() => {
        let filtered = [...roleData]

        if (roleFilter !== "all") {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredRoleData(filtered)
    }, [roleFilter, searchQuery, roleData])

    useEffect(() => {
        const handleUserAdded = (event) => {
            const newData = event.detail;
            const filtered = newData.filter((role) => role.username !== username);
            setRoleData(filtered);
            setFilteredRoleData(filtered);
        };

        window.addEventListener('userAdded', handleUserAdded);

        return () => {
            window.removeEventListener('userAdded', handleUserAdded);
        };
    }, [username]);

    const handleUserDeleted = (userId) => {
        setRoleData(prev => prev.filter(user => user._id !== userId));
        setFilteredRoleData(prev => prev.filter(user => user._id !== userId));
    };

    const handleAddUser = (newUser) => {
        if (newUser.username !== username) {
            setRoleData(prev => [...prev, newUser]);
            setFilteredRoleData(prev => [...prev, newUser]);
        }
    };

    const handleEditUser = (updatedUser) => {
        setRoleData(prev =>
            prev.map(user =>
                user._id === updatedUser._id ? { ...user, ...updatedUser } : user
            )
        );
        setFilteredRoleData(prev =>
            prev.map(user =>
                user._id === updatedUser._id ? { ...user, ...updatedUser } : user
            )
        );
    }




    return (
        <div>
            <SideNavbar />
            <div className='pl-[250px]'>
                <Header title="I AM User" />
                <CurrentUserCard />

                {/* Filters */}
                <div className="mx-8 my-4 flex gap-4">
                    <Select onValueChange={setRoleFilter} defaultValue="all">
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="Search by name or username"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-[300px]"
                    />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>+ Add New User</Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-md flex flex-col gap-8 h-100'>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                            </DialogHeader>
                            <AddUser onUserAdded={handleAddUser} />
                        </DialogContent>
                    </Dialog>
                </div>

                <RoleList
                    roleData={filteredRoleData}
                    onUserDeleted={handleUserDeleted}
                    onUserEdited={handleEditUser}
                />
            </div>
        </div>
    )
}

export default IAMUserPage
