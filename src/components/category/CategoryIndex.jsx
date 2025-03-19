import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import AllCategory from "./AllCategory"


function CategoryIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='CATEGORY' />
                <div className="overflow-auto">
                    <AllCategory />
                </div>
            </div>
        </div>
    )
}

export default CategoryIndex
