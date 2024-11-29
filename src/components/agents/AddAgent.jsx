import { useState } from 'react';
import axios from 'axios';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const AddAgent = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(
                'https://9tw16vkj-5000.inc1.devtunnels.ms/dashboard/api/agent/add', // Adjusted endpoint for adding a new agent
                formData
            );
            if (response.data.success) {
                alert('Agent added successfully!');
                setFormData({
                    name: '',
                    contact: '',
                });
            } else {
                throw new Error(response.data.message || 'Failed to add agent');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full mx-auto h-[600px] p-4">
            <h3 className="text-lg font-semibold">Add New Agent</h3>
            <div className="space-y-4 mt-4">
                <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</Label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter agent's name"
                    />
                </div>

                <div>
                    <Label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact:</Label>
                    <Input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter agent's contact number"
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Error message display */}

            <button 
                type="submit" 
                className={`mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                disabled={loading} // Disable button when loading
            >
                {loading ? 'Adding...' : 'Add Agent'}
            </button>
        </form>
    );
};

export default AddAgent;
