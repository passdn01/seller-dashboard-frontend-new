import React from 'react'
import RoleCard from './RoleCard'
function RoleList({ roleData }) {

    return (
        <div className='flex justify-center items-center'>
            <div className='p-4 grid grid-cols-2 gap-y-4 w-[70%] gap-x-4 items-center'>
                {roleData.map((role) => {
                    return (
                        <RoleCard data={role}></RoleCard>
                    )
                })}
            </div>
        </div>
    )
}

export default RoleList