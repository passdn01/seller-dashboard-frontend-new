import Header from './Header'
import SideNavbar from '../../../components/SideNavbar.jsx'
import DataTable from './DataTable.jsx'
import DataTableNew from './DataTableNew.jsx'

function AllDrivers() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL DRIVERS' />
                <div className='overflow-auto'>
                    <DataTableNew />
                </div>
            </div>
        </div>
    )
}

export default AllDrivers
