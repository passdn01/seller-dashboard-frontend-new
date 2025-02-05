import SideNavbar from '@/components/SideNavbar';
import Header from '@/components/drivers/allDrivers/Header';
import IssueAssigner from './issueAssigner';

function IssueAssignerIndex() {

    return (
        <div className="flex items-start gap-x-2 bg-[#ffffff]">
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full bg-[#ffffff]' title='Issue Assigner' />
                <IssueAssigner />
            </div>
        </div>
    );
}


export default IssueAssignerIndex
