// src/components/BlogList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import axios from 'axios';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs`);
                setBlogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
            }
        }

        fetchBlogs();
    }, []);

    const handleNewBlog = () => {
        navigate('/blogs/new');
    };

    const handleBlogClick = (blogId) => {
        navigate(`/blogs/${blogId}`);
    };

    // Function to strip HTML tags for preview
    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Blogs</h1>
                <Button onClick={handleNewBlog} className="flex items-center gap-2">
                    <PlusCircle size={18} />
                    New Blog
                </Button>
            </div>

            {blogs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-500 mb-4">No blogs found</p>
                    <Button onClick={handleNewBlog}>Create your first blog</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Card
                            key={blog._id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 line-clamp-3">
                                    {stripHtml(blog.content).substring(0, 150)}...
                                </p>
                            </CardContent>
                            <CardFooter className="text-sm text-gray-500 flex justify-between">
                                <span>{blog.author}</span>
                                <span>{new Date(blog.updatedAt).toLocaleDateString()}</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}