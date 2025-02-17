import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import loginImage from '../assets/loginPassdn.png';
import { SELLER_URL_LOCAL } from '@/lib/utils';
import loginBG from '../assets/loginBG.png'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: "include" // Ensure cookies are included
            });

            if (response.ok) {
                const result = await response.json();

                // Use localStorage instead of cookies for debugging

                console.log(result, "result")
                if (result?.success) {
                    console.log(result, "checking user")
                    localStorage.setItem("token", result.token);
                    localStorage.setItem("admin", result.admin);
                    localStorage.setItem("role", result.role);
                    localStorage.setItem("username", result.username);
                    localStorage.setItem("userId", result.userId);

                    console.log("Login successful:", result);
                    alert("Welcome " + result.admin);
                    window.location.href = '/home/dashboard';
                } else {
                    alert(result?.message)
                }
            } else {
                alert("Login Failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Oval
                    height={60}
                    width={60}
                    color="#4fa94d"
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl h-[500px]">
                {/* Image Section */}
                <div className="hidden md:block md:w-1/2">
                    <img
                        src={loginBG}
                        alt="Login illustration"
                        className="w-full h-full object-cover"
                    />
                </div>



                {/* Login Form Section */}
                <div className="w-full p-8 md:w-1/2 flex flex-col">
                    <div><h2 className="text-5xl font-bold text-center text-gray-800 my-8">#Way Of Vayu</h2></div>
                    <form onSubmit={handleSubmit} className="space-y-6 border border-gray-200 p-8 rounded shadow-sm">
                        <div>
                            <label htmlFor="username" className='text-sm p-2 text-gray-700 font-mono'>Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className='text-sm p-2 text-gray-700 font-mono'>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#0F62FE] text-white py-3 rounded-lg hover:bg-blue-950 transition duration-300"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
