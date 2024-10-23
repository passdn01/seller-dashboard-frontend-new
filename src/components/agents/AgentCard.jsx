// Define the AgentCard component
function AgentCard({ data }) {
    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            {/* Agent's basic information */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Agent Details</h2>
                <p><strong>Name:</strong> {data.name}</p>
                <p><strong>Contact:</strong> {data.contact}</p>
                <p><strong>Referral Code:</strong> {data.referralCode}</p>
            </div>

            {/* Additional agent info can be added here */}
            {/* <div className="mb-4">
                <h3 className="text-lg font-medium">Additional Info</h3>
                <p><strong>Email:</strong> {data.email || 'N/A'}</p>
                <p><strong>Address:</strong> {data.address || 'N/A'}</p>
            </div>
 */}
            {/* Example of other sections for agent-specific info */}
            {/* <div className="mb-4">
                <h3 className="text-lg font-medium">Performance</h3>
                <p><strong>Total Rides:</strong> {data.totalRides || 0}</p>
                <p><strong>Rating:</strong> {data.rating || 'Not Rated'}</p>
            </div> */}

            {/* Actions section, if needed */}
            <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Contact Agent
                </button>
                {/* <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    View More
                </button> */}
            </div>
        </div>
    );
}

export default AgentCard;
