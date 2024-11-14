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

import HomeIcon from '../assets/NavIcons/Home.svg';
import DriverIcon from '../assets/NavIcons/Driver.svg';
import AgentIcon from '../assets/NavIcons/agent.svg';
import FarePriceIcon from '../assets/NavIcons/FarePrice.svg';
import FinancialMetricsIcon from '../assets/NavIcons/FinancialMetrics.svg';
import FinancialServicesIcon from '../assets/NavIcons/FinancialServices.svg';
import IAMAdminIcon from '../assets/NavIcons/IAMAdmin.svg';
import LogoutIcon from '../assets/NavIcons/Logout.svg';
import Logo from '../assets/NavIcons/Logo.svg';
import LogsIcon from '../assets/NavIcons/logs.svg';
import OfferIcon from '../assets/NavIcons/Offer.svg';
import QuizDashboardIcon from '../assets/NavIcons/QuizDashboard.svg';
import TechCostIcon from '../assets/NavIcons/TechCost.svg';
import WebsiteIcon from '../assets/NavIcons/Website.svg';
import IssueSolverIcon from '../assets/NavIcons/IssueSolver.svg';
import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom'

function SideNavbar() {
    const menuList = [
        {
            id: "1",
            title: "Home",
            link: "/home",
            submenu: false,
            icon: HomeIcon,
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
                    title: 'Live Drivers',
                    link: '/drivers/liveDrivers',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'All Drivers',
                    link: '/drivers/allDrivers',
                    icon: '',
                }
            ]
        },
        {
            id: "3",
            title: "Rides",
            link: '/rides/AllRides',
            icon: DriverIcon,
        },
        {
            id: "4",
            title: "Agent",
            link: '',
            submenu: true,
            icon: AgentIcon,
            subMenuList: [
                // {
                //     id: '1',
                //     title: 'Live Agents',
                //     link: '/agents/live',
                //     icon: '',
                // },
                {
                    id: '2',
                    title: 'All Agents',
                    link: '/agents/allAgents',
                    icon: '',
                }
            ]
        },
        {
            id: "5",
            title: "Issues",
            link: "/issues",
            submenu: false,
            icon: OfferIcon,
        },
        {
            id: "6",
            title: "Tech Cost",
            link: "/home",
            submenu: false,
            icon: TechCostIcon,
        },
        {
            id: "7",
            title: "Fare Price",
            link: "/home",
            submenu: false,
            icon: FarePriceIcon,
        },
        {
            id: "8",
            title: "Website",
            link: '',
            submenu: true,
            icon: WebsiteIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Website Overview',
                    link: '/website/overview',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Website Settings',
                    link: '/website/settings',
                    icon: '',
                }
            ]
        },
        {
            id: "9",
            title: "Finance Metrics",
            link: '',
            submenu: true,
            icon: FinancialMetricsIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Metrics Overview',
                    link: '/finance/overview',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Reports',
                    link: '/finance/reports',
                    icon: '',
                }
            ]
        },
        {
            id: "10",
            title: "Issue Solver",
            link: '',
            submenu: true,
            icon: IssueSolverIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Open Issues',
                    link: '/issues/open',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Resolved Issues',
                    link: '/issues/resolved',
                    icon: '',
                }
            ]
        },
        {
            id: "11",
            title: "Air Share",
            link: '',
            submenu: true,
            icon: DriverIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Air Share Overview',
                    link: '/airshare/overview',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Air Share Settings',
                    link: '/airshare/settings',
                    icon: '',
                }
            ]
        },
        {
            id: "12",
            title: "Quiz Share",
            link: '',
            submenu: true,
            icon: QuizDashboardIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Active Quizzes',
                    link: '/quizzes/active',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Quiz Reports',
                    link: '/quizzes/reports',
                    icon: '',
                }
            ]
        },
        {
            id: "13",
            title: "Financial Services",
            link: '',
            submenu: true,
            icon: FinancialServicesIcon,
            subMenuList: [
                {
                    id: '1',
                    title: 'Service Overview',
                    link: '/finance/services/overview',
                    icon: '',
                },
                {
                    id: '2',
                    title: 'Service Settings',
                    link: '/finance/services/settings',
                    icon: '',
                }
            ]
        },
        {
            id: "14",
            title: "I AM Admin",
            link: "/home",
            submenu: false,
            icon: IAMAdminIcon,
        },
        {
            id: "15",
            title: "Logs",
            link: "/home",
            submenu: false,
            icon: LogsIcon,
        },
        // {
        //     id: "15",
        //     title: "Log out",
        //     link: "/home",
        //     submenu: false,
        //     icon: LogoutIcon,
        // },
    ];

    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            console.log("logout called.")
            const response = await fetch('https://9tw16vkj-5000.inc1.devtunnels.ms/logout', {
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
                    <Link onClick={handleLogout}>
                        <CommandItem className='flex items-center p-2 text-sm hover:bg-blue-100 rounded-md w-full cursor-pointer bg-white'>
                            <img src={LogoutIcon} alt="" className="h-5 w-5 mr-3" />
                            <span>Logout</span>
                        </CommandItem>
                    </Link>


                </CommandList>
            </Command>
        </div>
    )
}

export default SideNavbar