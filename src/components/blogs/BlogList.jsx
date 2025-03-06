import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Filter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import axios from 'axios';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(null);
    const navigate = useNavigate();

    // Site labels mapping (moved outside to be reusable)
    const siteLabels = {
        'vayuride': 'VayuRide',
        'tsp': 'TSP',
    };

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs`);
                setBlogs(response.data);
                setFilteredBlogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
            }
        }

        fetchBlogs();
    }, []);

    // Filter blogs by site
    useEffect(() => {
        if (selectedSite) {
            const filtered = blogs.filter(blog => blog.site === selectedSite);
            setFilteredBlogs(filtered);
        } else {
            setFilteredBlogs(blogs);
        }
    }, [selectedSite, blogs]);

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

    // Get unique sites from blogs
    const availableSites = [...new Set(blogs.map(blog => blog.site).filter(Boolean))];

    if (loading) {
        return (
            <div className="w-full flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-end items-center mb-6">
                <div className="flex items-center gap-4">
                    {/* filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter size={18} />
                                {selectedSite
                                    ? `Site: ${siteLabels[selectedSite] || selectedSite}`
                                    : 'Filter by Site'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedSite(null)}>
                                All Sites
                            </DropdownMenuItem>
                            {availableSites.map(site => (
                                <DropdownMenuItem
                                    key={site}
                                    onClick={() => setSelectedSite(site)}
                                >
                                    {siteLabels[site] || site}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={handleNewBlog} className="flex items-center gap-2">
                        <PlusCircle size={18} />
                        New Blog
                    </Button>
                </div>
            </div>

            {filteredBlogs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-500 mb-4">
                        {selectedSite
                            ? `No blogs found for ${siteLabels[selectedSite] || selectedSite}`
                            : 'No blogs found'}
                    </p>
                    <Button onClick={handleNewBlog}>Create your first blog</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <Card
                            key={blog._id}
                            className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            {blog.bannerImage && (
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={blog.bannerImage}
                                        alt={`Banner for ${blog.title}`}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                    />
                                </div>
                            )}
                            <CardHeader className={blog.bannerImage ? 'pt-4' : ''}>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                                    {blog.site && (
                                        <Badge variant="outline" className="ml-2 whitespace-nowrap">
                                            {siteLabels[blog.site] || blog.site}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 line-clamp-3">
                                    {stripHtml(blog.content).substring(0, 150)}...
                                </p>
                                {blog.tags && blog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {blog.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
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