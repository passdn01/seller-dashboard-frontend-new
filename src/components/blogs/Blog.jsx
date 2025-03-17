import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.css';

export function TagInput({ value = [], onChange }) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleAddTag = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !value.includes(trimmedValue)) {
            const newTags = [...value, trimmedValue];
            onChange(newTags);
            setInputValue('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        }
        else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            const newTags = value.slice(0, -1);
            onChange(newTags);
        }
    };

    const handleRemoveTag = (indexToRemove) => {
        const newTags = value.filter((_, index) => index !== indexToRemove);
        onChange(newTags);
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            className="flex flex-wrap items-center gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring focus-within:ring-offset-background"
            onClick={handleContainerClick}
        >
            {value.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(index);
                        }}
                        className="rounded-full hover:bg-muted p-0.5"
                    >
                        <X size={14} />
                        <span className="sr-only">Remove {tag}</span>
                    </button>
                </Badge>
            ))}

            <div className="flex-1 flex items-center min-w-[120px]">
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm h-8"
                    placeholder={value.length === 0 ? "Add tags..." : ""}
                />
                {inputValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddTag}
                        className="px-2 h-8"
                    >
                        <Plus size={16} />
                        <span className="sr-only">Add Tag</span>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function BlogEditor() {
    const { id: blogId } = useParams();
    const navigate = useNavigate();
    const isNewBlog = !blogId || blogId === 'new';
    const quillRef = useRef(null);
    const fileInputRef = useRef(null);

    const [blog, setBlog] = useState({
        title: '',
        content: '',
        author: 'Anonymous',
        site: 'vayuride',
        tags: [],
        bannerImage: null
    });

    const [bannerPreview, setBannerPreview] = useState('');
    const [loading, setLoading] = useState(!isNewBlog);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Site options
    const siteOptions = [
        { value: 'vayuride', label: 'VayuRide' },
        { value: 'tsp', label: 'TSP' },
    ];

    useEffect(() => {
        async function fetchBlog() {
            if (isNewBlog) return;

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs/${blogId}`, { headers: { Authorization: `Bearer ${token}` } });
                setBlog(response.data);

                // Set banner preview if exists
                if (response.data.bannerImage) {
                    setBannerPreview(response.data.bannerImage);
                }

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

    const handleSiteChange = (value) => {
        setBlog(prev => ({ ...prev, site: value }));
    };

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            setError('Please select an image file');
            return;
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        setBannerPreview(previewUrl);

        // Store the file object in state
        setBlog(prev => ({ ...prev, bannerImage: file }));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const removeBanner = () => {
        setBannerPreview('');
        setBlog(prev => ({ ...prev, bannerImage: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!blog.title || !blog.content) {
            setError('Title and content are required');
            return;
        }

        setError('');
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('title', blog.title);
            formData.append('content', blog.content);
            formData.append('author', blog.author);
            formData.append('site', blog.site);

            blog.tags.forEach(tag => {
                formData.append('tags', tag);
            });

            // Only append file if there's a new one
            if (blog.bannerImage instanceof File) {
                formData.append('bannerImage', blog.bannerImage);
            } else if (bannerPreview && typeof bannerPreview === 'string') {
                // If there's an existing image URL and no new file
                formData.append('bannerImageUrl', bannerPreview);
            }

            let response;

            console.log(formData, "formdata");
            const token = localStorage.getItem("token");
            if (isNewBlog) {
                response = await axios.post(
                    `${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axios.put(
                    `${import.meta.env.VITE_SELLER_URL_LOCAL}/api/blogs/${blogId}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
                );
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Label htmlFor="site">Site</Label>
                        <Select
                            value={blog.site}
                            onValueChange={handleSiteChange}
                        >
                            <SelectTrigger id="site" className="w-full">
                                <SelectValue placeholder="VayuRide" />
                            </SelectTrigger>
                            <SelectContent>
                                {siteOptions.map((site) => (
                                    <SelectItem key={site.value} value={site.value}>
                                        {site.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div className="flex flex-col gap-4">
                        {bannerPreview ? (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    className="w-full h-48 object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 rounded-full p-1 h-8 w-8"
                                    onClick={removeBanner}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={triggerFileInput}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">Click to upload banner image</p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerUpload}
                        />
                    </div>
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

                <div className="space-y-2">
                    <Label htmlFor="tags" className="block text-sm font-medium">
                        Tags
                    </Label>
                    <TagInput
                        value={blog.tags}
                        onChange={(newTags) => setBlog(prev => ({ ...prev, tags: newTags }))}
                    />
                    <p className="text-sm text-gray-500">
                        Press Enter or comma to add a tag
                    </p>
                </div>

                <div className="mt-8">
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
        </div>
    );
}