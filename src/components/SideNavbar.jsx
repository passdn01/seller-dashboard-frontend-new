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

import Home from '../assets/NavIcons/Home.svg'
import Driver from '../assets/NavIcons/Driver.svg'
import Logo from '../assets/NavIcons/Logo.svg'
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
                    title: 'All Drivers',
                    link: '/dashboard/drivers/allDrivers',
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
        },
        {
            id: "5",
            title: "Tech Cost",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        },
        {
            id: "6",
            title: "Fare Price",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        },
        {
            id: "7",
            title: "Website",
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
            id: "8",
            title: "Finance Metrics",
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
            id: "9",
            title: "Issue Solver",
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
            id: "10",
            title: "Air Share",
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
            id: "11",
            title: "Quiz Share",
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
            id: "12",
            title: "Financial Services",
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
            id: "13",
            title: "I AM Admin",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        },
        {
            id: "14",
            title: "Logs",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        },
        {
            id: "15",
            title: "Log out",
            link: "/dashboard/home",
            submenu: false,
            icon: Home,
        },



    ]

    return (
        <div className='fixed border-r min-w-[250px] z-50 min-h-screen bg-white h-full overflow-hidden'>
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