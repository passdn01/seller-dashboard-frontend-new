import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Header() {
    return (
        <div className='flex justify-between w-[85vw] px-8 py-2  items-center border-b-2 shadow-1'>
            <div className='text-xl font-bold'>ALL DRIVERS</div>


            <DropdownMenu className='m-4'>
                <DropdownMenuTrigger><Avatar className='cursor-pointer'>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className='mr-4'>Logout</DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>


        </div>
    )
}

export default Header