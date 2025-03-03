import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.css'

export default function BlogEditor() {
    const { id: blogId } = useParams();
    const navigate = useNavigate();
    const isNewBlog = !blogId || blogId === 'new';
    const quillRef = useRef(null);

    const [blog, setBlog] = useState({
        title: '',
        content: '',
        author: 'Anonymous'
    });

    const [loading, setLoading] = useState(!isNewBlog);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        async function fetchBlog() {
            if (isNewBlog) return;

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
    }, [blogId, isNewBlog]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBlog(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setBlog(prev => ({ ...prev, content }));
    };

    const handleSave = async () => {
        if (!blog.title || !blog.content) {
            setError('Title and content are required');
            return;
        }

        setError('');
        setSaving(true);

        try {
            let response;

            if (isNewBlog) {
                response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs`, blog);
            } else {
                response = await axios.put(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs/${blogId}`, blog);
            }

            setSuccess('Blog saved successfully!');

            // Redirect to the blog page after a short delay on a new blog save
            if (isNewBlog) {
                setTimeout(() => {
                    navigate(`/blogs/${response.data._id}`);
                }, 800);
            } else {
                // Just clear the success message after a delay for edits
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            setError('Failed to save blog. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate('/blogs');
    };

    // Quill modules and formats configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ]
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    if (loading) {
        return (
            <div className="w-full flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back to Blogs
            </Button>

            <h1 className="text-3xl font-bold mb-6">
                {isNewBlog ? 'Create New Blog' : 'Edit Blog'}
            </h1>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={blog.title}
                        onChange={handleInputChange}
                        placeholder="Enter a title for your blog"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                        id="author"
                        name="author"
                        value={blog.author}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <div className="editor-wrapper">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={blog.content}
                            onChange={handleContentChange}
                            modules={modules}
                            formats={formats}
                            placeholder="Write your blog content here..."
                        />
                    </div>
                </div>
            </div>

            <div className="button-container">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Blog
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}