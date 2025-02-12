import SideNavbar from '@/components/SideNavbar';
import Header from '@/components/drivers/allDrivers/Header';
import IssueDetail from './issueDetail';

function IssueDetailIndex() {

    return (
        <div className="flex items-start gap-x-2 bg-[#ffffff]">
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full bg-[#ffffff]' title='Issue Detail' />
                <IssueDetail />
            </div>
        </div>
    );
}


export default IssueDetailIndex
