import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sellerSocket } from "@/sellerSocket";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MessagesCard = ({ issue, issueId }) => {
  const [messages, setMessages] = useState(issue?.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!issueId) return;

    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    sellerSocket.on(issueId, handleNewMessage);

    return () => {
      sellerSocket.off(issueId, handleNewMessage);
    };
  }, [issueId]);

  const solverId = issue.solverId._id;
  const currentDashboardUser = localStorage.getItem("userId");

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);

    const sentMessage = {
      sender: "admin",
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/adminTicketChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: issueId, message: sentMessage }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setNewMessage("");
      } else {
        window.alert(data.message || "Failed to send message.");
      }
    } catch (error) {
      window.alert("Error sending message. Please try again.");
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-80 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message?._id || Math.random()}
                    className={`p - 4 rounded - lg shadow - sm max - w - [80 %] ${message?.sender === "user"
                      ? "bg-blue-100 self-start text-left"
                      : "bg-gray-200 self-end text-right"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-gray-800 capitalize">
                        {message?.sender || "Unknown"}
                      </strong>
                      <span className="text-sm text-gray-500">
                        {message?.timestamp
                          ? new Date(message.timestamp).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700 break-words">
                      {message?.message || "No message content"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No messages yet.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* message input */}
      {messages.length > 0 && currentDashboardUser === solverId && (
        <div className="m-4 flex gap-3">
          <Input
            className="p-4"
            placeholder="Send a message to the user"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button
            variant="primary"
            className="bg-blue-500 text-white"
            onClick={sendMessage}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessagesCard;
