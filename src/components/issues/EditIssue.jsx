import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import PropTypes from 'prop-types';

const EditIssue = ({ Id }) => {
    console.log(Id);
    const [formData, setFormData] = useState({
        fleet: '',
        airshareNumber: '',
        rcNumber: '',
    });
    const [fleetOptions, setFleetOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Function to fetch fleet options
    const fetchFleetOptions = async () => {
        try {
            const response = await axios.get(
                'https://55kqzrxn-2013.inc1.devtunnels.ms/admin/fleet/list'
            );
            console.log(response.data.data);
            if (response.data.success) {
                setFleetOptions(response.data.data);
            } else {
                throw new Error('Failed to fetch fleet options');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Function to fetch vehicle details
    const fetchVehicleDetails = async () => {
        try {
            const response = await axios.get(
                `https://55kqzrxn-2013.inc1.devtunnels.ms/admin/vehicle/${Id}`
            );
            console.log(response.data.data);
            if (response.data.success) {
                setFormData({
                    fleet: response.data.data.fleet._id, // Assuming fleet is populated with details
                    airshareNumber: response.data.data.airshareNumber,
                    rcNumber: response.data.data.rcNumber,
                });
            } else {
                throw new Error('Failed to fetch vehicle details');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Fetch fleet options and vehicle details on component mount
    useEffect(() => {
        fetchFleetOptions();
        fetchVehicleDetails();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setValidationErrors({});

        // Validation
        const errors = {};
        if (!formData.fleet) errors.fleet = 'Fleet is required.';
        if (!formData.airshareNumber) errors.airshareNumber = 'Airshare Number is required.';
        if (!formData.rcNumber) errors.rcNumber = 'RC Number is required.';

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.patch(
                `https://55kqzrxn-2013.inc1.devtunnels.ms/admin/vehicle/${Id}`,
                {
                    ...formData,
                }
            );
            console.log(formData);
            if (response.data.success) {
                alert('Vehicle updated successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to update Vehicle');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Edit Vehicle</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="fleet" className="block text-sm font-medium text-gray-700">
                        Fleet:
                    </Label>
                    <Select
                        value={formData.fleet}
                        onValueChange={(value) =>
                            setFormData({ ...formData, fleet: value })
                        }
                    >
                        <SelectTrigger className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select a fleet" />
                        </SelectTrigger>
                        <SelectContent>
                            {fleetOptions.map((fleet) => (
                                <SelectItem key={fleet._id} value={fleet._id}>
                                    {fleet.vehicleName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {validationErrors.fleet && <p className="text-red-500 text-sm">{validationErrors.fleet}</p>}
                </div>

                <div className="mt-4">
                    <Label htmlFor="airshareNumber" className="block text-sm font-medium text-gray-700">
                        Airshare Number:
                    </Label>
                    <Input
                        type="text"
                        id="airshareNumber"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.airshareNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, airshareNumber: e.target.value })
                        }
                    />
                    {validationErrors.airshareNumber && <p className="text-red-500 text-sm">{validationErrors.airshareNumber}</p>}
                </div>

                <div className="mt-4">
                    <Label htmlFor="rcNumber" className="block text-sm font-medium text-gray-700">
                        RC Number:
                    </Label>
                    <Input
                        type="text"
                        id="rcNumber"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.rcNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, rcNumber: e.target.value })
                        }
                    />
                    {validationErrors.rcNumber && <p className="text-red-500 text-sm">{validationErrors.rcNumber}</p>}
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-950 text-white py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

EditIssue.propTypes = {
    Id: PropTypes.string.isRequired,
};

export default EditIssue;
