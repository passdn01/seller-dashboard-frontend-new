import React from 'react'
import RoleCard from './RoleCard'
function RoleList({ roleData, onUserDeleted, onUserEdited }) {
    return (
        <div className='flex '>
            <div className='p-8 grid grid-cols-2 w-full gap-8'>
                {roleData.map((role) => (
                    <RoleCard key={role._id} data={role} onUserDeleted={onUserDeleted} onUserEdited={onUserEdited} />
                ))}
            </div>
        </div>
    );
}


export default RoleList