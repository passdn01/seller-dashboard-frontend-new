import { useEffect, useState } from 'react'; // Make sure to import useEffect
import PropTypes from 'prop-types';
import axios from 'axios'; // Import axios for API calls
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { SELLER_URL_LOCAL } from '@/lib/utils';

const AgentEdit = ({ data, id }) => {
    const { agentInfo } = data;
    const [formData, setFormData] = useState({
        id: id,
        // Agent Details
        name: agentInfo?.name || '',
        contact: agentInfo?.contact || '',
        referralCode: agentInfo?.referralCode || '',
    });
    const [loading, setLoading] = useState(false); // State for loading status
    const [error, setError] = useState(''); // State for error messages

    // Fetch initial data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/agent/edit/${id}`);
                if (response.data.success) {
                    setFormData({
                        id: response.data.data.id,
                        name: response.data.data.name,
                        contact: response.data.data.contact,
                        referralCode: response.data.data.referralCode,
                    });
                } else {
                    throw new Error(response.data.message || 'Failed to fetch data');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true while submitting
        try {
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/agent/edit/${id}`, formData);
            if (response.data.success) {
                // Optionally, handle success feedback (e.g., show a success message)
                alert('Agent details updated successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to update agent details');
            }
        } catch (error) {
            setError(error.message); // Capture error message
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-auto px-4">
            <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Agent Details</h3>
                    <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</Label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                        />
                    </div>

                    <div>
                        <Label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">Referral Code:</Label>
                        <Input
                            type="text"
                            name="referralCode"
                            value={formData.referralCode}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>} {/* Error message display */}

            <button
                type="submit"
                className={`mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                disabled={loading} // Disable button when loading
            >
                {loading ? 'Submitting...' : 'Submit'} {/* Change button text based on loading state */}
            </button>
        </form>
    );
};

AgentEdit.propTypes = {
    data: PropTypes.shape({
        agentInfo: PropTypes.shape({
            name: PropTypes.string,
            contact: PropTypes.string,
            referralCode: PropTypes.string,
        })
    }).isRequired,
    id: PropTypes.string.isRequired,
};

export default AgentEdit;
