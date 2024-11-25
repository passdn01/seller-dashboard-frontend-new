import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
// import BlogTable from './BlogTable'

function AllBlogs() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL BLOGS' />
                <div className='overflow-auto'>
                    {/* <BlogTable /> */}
                </div>
            </div>
        </div>
    )
}

export default AllBlogs
