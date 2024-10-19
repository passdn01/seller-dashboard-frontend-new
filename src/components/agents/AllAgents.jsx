import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
import AgentTable from './AgentTable'

function AllAgents() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL RIDES' />
                <div className='overflow-auto'>
                    <AgentTable />
                </div>
            </div>
        </div>
    )
}

export default AllAgents
