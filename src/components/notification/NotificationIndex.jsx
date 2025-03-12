import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import SendNotification from "./SendNotification"


function NotificationIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='NOTIFICATIONS' />
                <div className="overflow-auto p-6">
                    <SendNotification />
                </div>
            </div>
        </div>
    )
}

export default NotificationIndex
