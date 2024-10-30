// import Header from '../Header'
import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
import IssueTable from './IssuesTable'

function Issues() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ISSUES' />
                <div className='overflow-auto'>
                    <IssueTable />
                </div>
            </div>
        </div>
    )
}

export default Issues
