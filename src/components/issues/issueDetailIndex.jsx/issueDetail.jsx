import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming you have the custom Card components

const IssueDetail = () => {
  const [issue, setIssue] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const response = await axios.get(`https://55kqzrxn-6000.inc1.devtunnels.ms/dashboard/api/tickets/${id}`);
        setIssue(response.data);
      } catch (error) {
        console.error('Error fetching issue details:', error);
      }
    };

    fetchIssueDetails();
  }, [id]);

  if (!issue) return <div>Loading...</div>;

  const { transactionId, concern, status, solverId, assignerId, messages, userId } = issue;
  const { firstName, lastName } = userId;
  const { name: solverName, username: solverUsername } = solverId;
  const { name: assignerName, username: assignerUsername } = assignerId;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Issue Detail</h2>

      {/* Issue Information Card */}
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Issue Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p><strong>Transaction ID:</strong> {transactionId}</p>
            <p><strong>Concern:</strong> {concern}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User:</strong> {firstName} {lastName}</p>
            <p><strong>Solver:</strong> {solverName} ({solverUsername})</p>
            <p><strong>Assigner:</strong> {assignerName} ({assignerUsername})</p>
          </div>
        </CardContent>
      </Card>

      {/* Messages Card */}
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`p-4 rounded-lg shadow-sm flex flex-col space-y-2 max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-blue-100 self-start text-left'
                      : 'bg-gray-200 self-end text-right'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-gray-800 capitalize">{message.sender}</strong>
                    <span className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 break-words">{message.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No messages yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetail;