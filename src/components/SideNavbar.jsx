import React from 'react'
import {
    Command,
    CommandSeparator,
    CommandList,
    CommandItem,
} from "./ui/command"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion"

import Home from '../assets/Home.svg'
import Driver from '../assets/Driver.svg'
import Logo from '../assets/Logo.svg'
import { Link } from 'react-router-dom'

function SideNavbar() {
    const menuList = [
        {
            id: "1",
            title: "Home",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        },
        {
            id: "2",
            title: "Driver",
            link: '',
            submenu: true,
            icon: Driver,
            subMenuList: [
                {
                    id: '1',
                    title: 'Live Drivers',
                    link: '/dashboard/drivers/live',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Example2',
                    link: '/dashboard/drivers/somthing',
                    icon: '',
                }
            ]
        },
        {
            id: "3",
            title: "Agent",
            link: '',
            submenu: true,
            icon: Driver,
            subMenuList: [
                {
                    id: '1',
                    title: 'Live Drivers',
                    link: '/dashboard/drivers/live',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Example2',
                    link: '/dashboard/drivers/somthing',
                    icon: '',
                }
            ]
        },
        {
            id: "4",
            title: "Offer",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        }


    ]

    return (
        <div className='min-h-screen border-r min-w-[250px]'>
            <Command className="rounded-lg  ">
                <div className='p-4 flex items-center gap-2 font-bold'>
                    <img src={Logo} alt="Logo" className="h-6 w-6" />
                    <span>Vayu Admin</span>
                </div>
                <CommandSeparator />
                <CommandList>
                    {menuList.map((el) => (
                        <div key={el.id}>
                            {el.submenu ? (
                                <CommandItem><Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value={el.id}>
                                        <AccordionTrigger className='flex items-center py-1 text-sm rounded-md w-full'>
                                            <div className="flex items-center">
                                                <img src={el.icon} alt="" className="h-5 w-5 mr-3" />
                                                <span className='font-normal hover:no-underline'>{el.title}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pl-10">
                                                {el.subMenuList.map((item) => (
                                                    <Link to={item.link}><CommandItem key={item.id} className="py-2 text-sm hover:bg-blue-50 rounded-md">
                                                        {item.title}
                                                    </CommandItem></Link>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                </CommandItem>
                            ) : (
                                <Link to={el.link}>
                                    <CommandItem className='flex items-center p-2 text-sm hover:bg-blue-100 rounded-md w-full cursor-pointer bg-white' >
                                        <img src={el.icon} alt="" className="h-5 w-5 mr-3" />
                                        <span>{el.title}</span>
                                    </CommandItem>
                                </Link>
                            )}
                        </div>
                    ))}
                </CommandList>
            </Command>
        </div>
    )
}

export default SideNavbar