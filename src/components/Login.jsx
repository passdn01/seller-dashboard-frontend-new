import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import loginImage from '../assets/loginPassdn.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: "include" // Ensure cookies are included
            });

            console.log(response);
    
            if (response.ok) {
                const result = await response.json();
                console.log(result);
    
                // Use localStorage instead of cookies for debugging
                localStorage.setItem("token", result.token);
                localStorage.setItem("admin", result.admin);
                localStorage.setItem("role", result.role);
                localStorage.setItem("userId", result.userId);
                
                console.log("Login successful:", result);
                alert("Welcome " + result.admin);
                window.location.href = '/home/dashboard';
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
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl">
                {/* Image Section */}
                <div className="hidden md:block md:w-1/2">
                    <img
                        src={loginImage}
                        alt="Login illustration"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Login Form Section */}
                <div className="w-full p-8 md:w-1/2">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-950 text-white py-3 rounded-lg hover:bg-blue-950 transition duration-300"
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
