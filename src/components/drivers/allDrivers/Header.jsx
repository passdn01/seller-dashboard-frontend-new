import { useEffect, useState, createContext, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalStorage } from "@/common";

const local = getLocalStorage("cityIds")
const CitiesContext = createContext({
    selectedCities: local,
    setSelectedCities: () => { },
});

export const useCities = () => useContext(CitiesContext);

export function CitiesProvider({ children }) {
    const [selectedCities, setSelectedCities] = useState(local);

    return (
        <CitiesContext.Provider value={{ selectedCities, setSelectedCities }}>
            {children}
        </CitiesContext.Provider>
    );
}

function Header({ title }) {
    const navigate = useNavigate();
    const { selectedCities, setSelectedCities } = useCities();
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch("https://airshare.co.in/admin/city");
                const data = await response.json();
                setCities(data);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const getInitials = (name) =>
        name?.split(" ")?.map((word) => word[0])?.join("")?.toUpperCase() || "A";

    const toggleCitySelection = (cityId) => {
        console.log(cityId, "city id is");

        setSelectedCities((prevSelected) => {
            console.log("in function");

            let updatedSelection;

            if (cityId === "ALL") {
                updatedSelection = ["ALL"];
            } else if (prevSelected.includes(cityId)) {
                updatedSelection = prevSelected.filter((id) => id !== cityId);
                console.log(updatedSelection, "filtered.");
                console.log(prevSelected, "prev");

                if (updatedSelection.length === 0) {
                    updatedSelection = ["ALL"];
                }
            } else {
                updatedSelection = prevSelected.filter((id) => id !== "ALL");
                console.log(prevSelected, "prev");
                updatedSelection = [...updatedSelection, cityId];
            }

            // Save to localStorage
            localStorage.setItem("cityIds", JSON.stringify(updatedSelection));

            return updatedSelection;
        });
    };


    const name = localStorage.getItem("admin") || "Admin";
    const username = localStorage.getItem("username") || "Username";

    console.log(selectedCities, "selected")

    const getSelectedCitiesDisplay = () => {
        if (selectedCities.includes("ALL")) return "All Cities";
        if (!selectedCities.length) return "No Cities Selected";
        if (selectedCities.length === 1) {
            return cities.find((city) => city._id === selectedCities[0])?.name || "Unknown";
        }
        return `${selectedCities.length} Cities Selected`;
    };

    return (
        <div className="flex justify-between px-8 py-2 items-center border-b-2 shadow-1">
            <div className="text-xl font-bold">{title}</div>
            <div className="flex items-center gap-4">

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{getSelectedCitiesDisplay()}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex-col gap-y-2 flex p-2 w-56">
                        <DropdownMenuLabel>Select Cities</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => toggleCitySelection("ALL")}>
                            <Checkbox checked={selectedCities.includes("ALL")} />
                            <span className="ml-2">ALL</span>
                        </DropdownMenuItem>
                        {cities.map((city) => (
                            <DropdownMenuItem key={city._id} onClick={() => toggleCitySelection(city._id)}>
                                <Checkbox checked={selectedCities.includes(city._id)} />
                                <span className="ml-2">{city.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>


                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className="h-12 w-12 cursor-pointer">
                            <AvatarImage src="" alt={name} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex-col gap-y-2 flex p-2">
                        <div className="flex gap-2 text-sm items-center">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src="" alt={name} />
                                <AvatarFallback>{getInitials(name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                {name}
                                <div className="text-xs">{username}</div>
                            </div>
                        </div>
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-500 hover:bg-red-50"
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default Header;
