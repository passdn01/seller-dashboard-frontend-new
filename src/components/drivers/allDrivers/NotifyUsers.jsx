import { React, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
// No toast import

const NotifyUsers = ({ driverId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userIds: [driverId],
        userType: "D", // Default to driver since we're coming from driver details
        title: "",
        body: ""
    });

    // Predefined notification templates
    const notificationTemplates = [
        { id: "missing_docs", title: "Missing Documents", body: "Please upload your missing documents as soon as possible." },
        { id: "payment_reminder", title: "Payment Reminder", body: "This is a reminder to complete your pending payment." },
        { id: "account_approved", title: "Account Approved", body: "Congratulations! Your account has been approved." },
        { id: "custom", title: "Custom Notification", body: "" }
    ];

    const [selectedTemplate, setSelectedTemplate] = useState("");

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
        
        if (templateId === "custom") {
            // For custom template, just clear fields
            setFormData({
                ...formData,
                title: "",
                body: ""
            });
        } else {
            // For predefined templates, populate fields
            const template = notificationTemplates.find(t => t.id === templateId);
            if (template) {
                setFormData({
                    ...formData,
                    title: template.title,
                    body: template.body
                });
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.body.trim()) {
            window.alert("Error: Title and message are required");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log("Sending notification:", formData);
            const response = await axios.post(
                `https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/notifyUsers`, 
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                window.alert("Success: Notification sent successfully");
                
                // Reset form or keep template but clear custom fields
                if (selectedTemplate === "custom") {
                    setFormData({
                        ...formData,
                        title: "",
                        body: ""
                    });
                }
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            window.alert("Error: " + (error.response?.data?.message || "Failed to send notification"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Send Notification</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Template</Label>
                        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select notification template" />
                            </SelectTrigger>
                            <SelectContent>
                                {notificationTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="title">Notification Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="Enter notification title"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="body">Notification Message</Label>
                        <Textarea
                            id="body"
                            value={formData.body}
                            onChange={(e) => handleChange("body", e.target.value)}
                            placeholder="Enter notification message"
                            className="mt-1"
                            rows={4}
                        />
                    </div>

                    <div className="bg-gray-50 p-2 rounded-md mt-2">
                        <p className="text-sm text-gray-500">
                            This notification will be sent to the driver with ID: {driverId}
                        </p>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                    setSelectedTemplate("");
                    setFormData({
                        userIds: [driverId],
                        userType: "D",
                        title: "",
                        body: ""
                    });
                }}>
                    Reset
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Notification"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default NotifyUsers;