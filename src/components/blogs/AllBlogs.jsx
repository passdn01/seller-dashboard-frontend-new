import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
import BlogList from './BlogList'
function AllBlogs() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL BLOGS' />
                <div className='overflow-auto px-8'>
                    <BlogList />
                </div>
            </div>
        </div>
    )
}

export default AllBlogs
