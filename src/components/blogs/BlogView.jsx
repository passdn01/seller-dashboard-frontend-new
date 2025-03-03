// src/components/BlogView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import axios from 'axios';

export default function BlogView() {
    const { id: blogId } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function fetchBlog() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs/${blogId}`);
                setBlog(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setError('Failed to load blog');
                setLoading(false);
            }
        }

        fetchBlog();
    }, [blogId]);

    const handleBack = () => {
        navigate('/blogs');
    };

    const handleEdit = () => {
        navigate(`/blogs/${blogId}/edit`);
    };

    const handleDelete = async () => {

        setDeleting(true);

        try {
            await axios.delete(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs/${blogId}`);
            navigate('/blogs', { replace: true });
        } catch (error) {
            console.error('Error deleting blog:', error);
            setError('Failed to delete blog');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 max-w-3xl">
                <Button variant="ghost" onClick={handleBack} className="mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Blogs
                </Button>

                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Blogs
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleEdit}
                        className="flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Edit
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2"
                    >
                        {deleting ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash size={16} />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <article className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>

                <div className="text-gray-500 mb-8">
                    <span>By {blog.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(blog.updatedAt).toLocaleDateString()}</span>
                </div>

                <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </article>
        </div>
    );
}