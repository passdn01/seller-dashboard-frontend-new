import React from 'react'
import { useState } from 'react';
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

import HomeIcon from '../assets/NavIcons/Home.svg';
import DriverIcon from '../assets/NavIcons/Driver.svg';
import AgentIcon from '../assets/NavIcons/agent.svg';
// import FarePriceIcon from '../assets/NavIcons/FarePrice.svg';
// import FinancialMetricsIcon from '../assets/NavIcons/FinancialMetrics.svg';
// import FinancialServicesIcon from '../assets/NavIcons/FinancialServices.svg';
import IAMAdminIcon from '../assets/NavIcons/IAMAdmin.svg';
import LogoutIcon from '../assets/NavIcons/Logout.svg';
import Logo from '../assets/NavIcons/Logo.svg';
// import LogsIcon from '../assets/NavIcons/logs.svg';
import OfferIcon from '../assets/NavIcons/Offer.svg';
// import QuizDashboardIcon from '../assets/NavIcons/QuizDashboard.svg';
import TechCostIcon from '../assets/NavIcons/TechCost.svg';
import WebsiteIcon from '../assets/NavIcons/Website.svg';
import IssueSolverIcon from '../assets/NavIcons/IssueSolver.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import roleRoutes from '../roles';
import { getCookie, SELLER_URL_LOCAL } from '@/lib/utils';

import { Link } from 'react-router-dom'
import { User } from 'lucide-react';

function SideNavbar() {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [userRole, setUserRole] = React.useState(null);



    React.useEffect(() => {
        const fetchUserInfo = async () => {
            const user = localStorage.getItem("role")

            setUserRole(user)
        }
        fetchUserInfo()
    }, [])

    const handleDashboardClick = (e) => {
        e.preventDefault();
        window.location.href = '/home/dashboard';
    };

    const menuList = [
        {
            id: "1",
            title: "Home",
            link: "",
            submenu: true,
            icon: HomeIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Dashboard',
                    link: '/home/dashboard',
                    icon: '',
                    onClick: handleDashboardClick
                },
                {
                    id: '2',
                    title: 'Map Data',
                    link: '/home/mapData',
                    icon: '',
                }
            ]
        },
        {
            id: "2",
            title: "Driver",
            link: '',
            submenu: true,
            icon: DriverIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'All Drivers',
                    link: '/drivers/allDrivers',
                    icon: '',
                }
            ]
        },
        {
            id: "3",
            title: "Users",
            link: '/users',
            icon: AgentIcon,
        },
        {
            id: "4",
            title: "Rides",
            link: '/rides/allRides',
            icon: DriverIcon,
        },
        {
            id: "5",
            title: "Issues Assigner",
            link: "/issueAssigner",
            submenu: false,
            icon: OfferIcon,
        },
        {
            id: "6",
            title: "Issue Solver",
            link: '/issueSolver',
            icon: IssueSolverIcon,
        },
        {
            id: "7",
            title: "I AM User",
            link: "/admin",
            submenu: false,
            icon: IAMAdminIcon,
        },
        {
            id: "8",
            title: "Image Viewer",
            link: "/home/dashboard/img",
            submenu: false,
            icon: IAMAdminIcon,
        },
    ];

    console.log(menuList)

    const navigate = useNavigate();
    const location = useLocation();

    const getAccessibleMenu = (menuList, allowedRoutes) => {
        return menuList
            .filter((menu) => {
                return (
                    (menu.link && allowedRoutes.some((route) => menu.link.startsWith(route))) ||
                    (menu.subMenuList &&
                        menu.subMenuList.some((subMenu) =>
                            allowedRoutes.some((route) => subMenu.link.startsWith(route))
                        ))
                );
            })
            .map((menu) => ({
                ...menu,
                subMenuList: menu.subMenuList
                    ? menu.subMenuList.filter((subMenu) =>
                        allowedRoutes.some((route) => subMenu.link.startsWith(route))
                    )
                    : undefined,
            }));
    };

    const accessibleMenu = getAccessibleMenu(menuList, roleRoutes[userRole] || []);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
                console.log(data.message);
                window.location.href = '/';
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActive = (menuLink) => {
        return location.pathname.startsWith(menuLink) ? "bg-blue-100" : "";
    };

    return (
        <div className='fixed border-r min-w-[250px] z-50 min-h-screen bg-white h-full overflow-hidden'>
            <Command className="rounded-lg">
                <div className='p-4 flex items-center gap-2 font-bold'>
                    <img src={Logo} alt="Logo" className="h-6 w-6" />
                    <span>Vayu Admin</span>
                </div>
                <CommandSeparator />
                <CommandList>
                    {accessibleMenu.map((menu) => (
                        <div key={menu.id} className={`
                            ${hoveredItem === menu.id ? 'bg-blue-200' : 'bg-white'}`} onMouseEnter={() => setHoveredItem(menu.id)}
                            onMouseLeave={() => setHoveredItem(null)}>
                            {menu.submenu ? (
                                <CommandItem>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value={menu.id}>
                                            <AccordionTrigger className="flex items-center py-1 text-sm rounded-md w-full">
                                                <div className="flex items-center">
                                                    <img src={menu.icon} alt="" className="h-5 w-5 mr-3" />
                                                    <span className="font-normal">{menu.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pl-10">
                                                    {menu.subMenuList.map((subMenu) => (
                                                        <div key={subMenu.id}>
                                                            <Link to={subMenu.link}>
                                                                <CommandItem
                                                                    className={`py-2 text-sm hover:bg-gray-100 rounded-md ${isActive(subMenu.link)}`}
                                                                    onSelect={() => {
                                                                        if (subMenu.onClick) {
                                                                            console.log("ovsd")
                                                                            window.location.href = '/home/dashboard';
                                                                        } else {
                                                                            navigate(subMenu.link);
                                                                        }
                                                                    }}
                                                                >
                                                                    {subMenu.title}
                                                                </CommandItem>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CommandItem>
                            ) : (
                                <Link target='_blank' to={menu.link}>
                                    <CommandItem className={`flex items-center p-2 text-sm hover:bg-blue-200 rounded-md w-full cursor-pointer bg-white ${isActive(menu.link)}`}>
                                        <img src={menu.icon} alt="" className="h-5 w-5 mr-3" />
                                        <span>{menu.title}</span>
                                    </CommandItem>
                                </Link>
                            )}
                        </div>
                    ))}
                </CommandList>
            </Command>
        </div>
    );
}

export default SideNavbar;