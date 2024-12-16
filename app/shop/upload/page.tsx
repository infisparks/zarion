"use client";

import { useState } from "react";
import { Upload, Plus, X } from "lucide-react";

export default function ProductUpload() {
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-8">Upload New Product</h1>

            {/* Product Form */}
            <form className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm">
                    <option>Select category</option>
                    <option>Dresses</option>
                    <option>Tops</option>
                    <option>Outerwear</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 h-32"
                  placeholder="Enter product description"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? "border-black bg-gray-50" : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your images here, or{" "}
                    <button type="button" className="text-black font-medium">
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: JPG, PNG, GIF (Max 5MB each)
                  </p>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {images.length < 4 && (
                      <button
                        type="button"
                        className="flex items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition"
                >
                  Upload Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}