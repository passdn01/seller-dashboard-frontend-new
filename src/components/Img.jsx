import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideNavbar from "./SideNavbar";
import Header from "./drivers/allDrivers/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageOff, Upload, RefreshCw, X, ExternalLink, Maximize2, Download } from "lucide-react";

const ImageComponent = () => {
  const [src, setSrc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    // Simple validation to ensure there's a URL
    if (!src.trim()) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Simulate image loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const clearImage = () => {
    setSrc("");
    setError(false);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  const downloadImage = () => {
    if (!src) return;
    
    const link = document.createElement('a');
    link.href = src;
    link.download = 'image-' + new Date().getTime();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />
      <div className="flex-1 ml-[250px] flex flex-col">
        <Header className="w-full" title="IMAGE VIEWER" />
        
        <div className="flex-1 p-4 overflow-auto">
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="url"
                    value={src}
                    onChange={(e) => setSrc(e.target.value)}
                    placeholder="Enter image URL here"
                    className="pl-4 pr-8 py-2 text-base"
                  />
                  {src && (
                    <button 
                      type="button"
                      onClick={clearImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <Button type="submit" className="flex items-center gap-2">
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Load Image
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className={`relative bg-white rounded-lg shadow-sm overflow-hidden ${fullscreen ? 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center' : 'min-h-[500px] flex items-center justify-center'}`}>
            {src && !isLoading && !error ? (
              <>
                <img
                  src={src}
                  alt="Preview"
                  className={`${fullscreen ? 'max-h-screen max-w-full object-contain' : 'max-h-[calc(100vh-220px)] max-w-full object-contain'}`}
                  onError={() => setError(true)}
                />
                <div className={`absolute ${fullscreen ? 'top-4 right-4' : 'top-2 right-2'} flex gap-2`}>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white/80 hover:bg-white shadow-sm"
                    onClick={toggleFullscreen}
                  >
                    <Maximize2 size={18} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white/80 hover:bg-white shadow-sm"
                    onClick={() => window.open(src, '_blank')}
                  >
                    <ExternalLink size={18} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white/80 hover:bg-white shadow-sm"
                    onClick={downloadImage}
                  >
                    <Download size={18} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-10">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Loading image...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center">
                    <ImageOff className="h-16 w-16 text-red-400 mb-4" />
                    <h3 className="text-xl font-medium text-red-500 mb-2">Failed to load image</h3>
                    <p className="text-gray-500 max-w-md">The URL you provided might be incorrect or the image is not accessible.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageOff className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No image to display</h3>
                    <p className="text-gray-500 max-w-md">Enter an image URL above and click "Load Image" to view it here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;