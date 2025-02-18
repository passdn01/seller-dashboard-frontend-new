import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

function Header({ title }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };
    const name = localStorage.getItem("admin")
    const username = localStorage.getItem("username")

    return (
        <div className="flex justify-between px-8 py-4 items-center border-b-2 shadow-1">
            <div className="text-xl font-bold">{title}</div>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={name} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='flex-col gap-y-2 flex p-2'>
                    <div className="flex gap-2 text-sm items-center">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src="" alt={name} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <div>{name} <div className="text-xs">{username}</div></div>

                    </div>

                    <DropdownMenuItem onClick={handleLogout} className='text-red-500 hover:text-red-500 hover:bg-red-50 '>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default Header;
