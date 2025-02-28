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

  const solverId = issue?.solverId?._id;
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
          <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Support Chat</h2>
          </div>
          <ScrollArea className="max-h-80 overflow-y-auto p-4">


            {messages.length > 0 ? (

              <div className="space-y-4">
                {messages.map((message) => (
                  <div className={`flex ${message?.sender === "user" ? "justify-start" : "justify-end"}`}>
                    <div
                      key={message?._id || Math.random()}
                      className={`px-4 py-3 rounded-lg shadow-sm max-w-[60%] text-sm" ${message?.sender === "user"
                        ? "bg-blue-100 self-start text-left"
                        : "bg-blue-600 self-end text-right"
                        }`}
                    >
                      {/* <div className="flex justify-between items-center">
                        <strong className="text-gray-800 capitalize">
                          {message?.sender || "Unknown"}
                        </strong>

                      </div> */}

                      <p className={`my-2 break-words  ${message?.sender === "user"
                        ? ""
                        : "text-white"}`}>
                        {message?.message || "No message content"}
                      </p>
                      <span className={`text-xs flex justify-start  ${message?.sender === "user"
                        ? 'text-black'
                        : "text-gray-200"}`}>
                        {message?.timestamp
                          ? new Date(message.timestamp).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">No messages yet.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* message input */}
      {messages.length > 0 && currentDashboardUser === solverId && (
        <div className="m-4 flex gap-3">
          <Input
            className="flex-grow border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"

            placeholder="Send a message to the user"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5"
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
