"use client";

import { useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { Upload, Plus, X } from "lucide-react";
import { storage, database } from "../../../lib/firebaseconfig";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push, set } from "firebase/database";

interface ImageData {
  file: File;
  preview: string;
}

export default function ProductUpload() {
  // Product info states
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState(""); // Discount Price field
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  // State for sizes array and input
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");

  // Image state holds both file and preview URL
  const [images, setImages] = useState<ImageData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Drag event handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Process the selected files and add them to state
  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        // Use URL.createObjectURL for a quick preview
        const preview = URL.createObjectURL(file);
        setImages(prev => [...prev, { file, preview }]);
      }
    });
  };

  // Remove an image from state
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add a size to the sizes array
  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes(prev => [...prev, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  // Remove a size from the sizes array
  const handleRemoveSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload images to Firebase Storage and get their download URLs
      const uploadedImageUrls = await Promise.all(
        images.map(async (imageData) => {
          const file = imageData.file;
          // Create a unique file path (for example, using the current timestamp)
          const filePath = `products/${Date.now()}_${file.name}`;
          const storageReference = storageRef(storage, filePath);
          const uploadTask = uploadBytesResumable(storageReference, file);

          // Wait for upload to complete
          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              null,
              (error) => reject(error),
              () => resolve(null)
            );
          });

          // Get the download URL after upload
          const downloadURL = await getDownloadURL(storageReference);
          return downloadURL;
        })
      );
      
      const productsRef = dbRef(database, "products");
      const newProductRef = push(productsRef);
      // Create a product object without SKU, and include discount and sizes
      const productData = {
        productName,
        category,
        price: parseFloat(price),
        discount: parseFloat(discount),
        stock: parseInt(stock, 10),
        description,
        imageUrls: uploadedImageUrls,
        sizes,
        createdAt: Date.now()
      };
      
      // Save the product data to the Realtime Database under "products"
      await set(newProductRef, productData);

      // Optionally, clear the form and images after successful upload
      setProductName("");
      setCategory("");
      setPrice("");
      setDiscount("");
      setStock("");
      setDescription("");
      setSizes([]);
      setSizeInput("");
      setImages([]);
      alert("Product uploaded successfully!");
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("There was an error uploading the product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-8">Upload New Product</h1>

            {/* Product Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="T-shirt">T-shirt</option>
                    <option value="Shirt">Shirt</option>
                    <option value="Udy">Udy</option>
                    <option value="Pent">Pent</option>
                    <option value="Trouser">Trouser</option>
                    <option value="All Mens Wear">All Mens Wear</option>
                  </select>
                </div>
              </div>

              {/* Price, Discount, and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="0.00"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 h-32"
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Sizes Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Sizes</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter size (e.g., S, M, L)"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition"
                  >
                    Add Size
                  </button>
                </div>
                {sizes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <span key={index} className="inline-flex items-center bg-gray-200 px-3 py-1 rounded-full">
                        {size}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(index)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                    <button
                      type="button"
                      className="text-black font-medium"
                      onClick={() => {
                        // Optionally, trigger a hidden file input here
                      }}
                    >
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
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
                        onClick={() => {
                          // Optionally trigger a file input for adding more images.
                        }}
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
                  disabled={uploading}
                  className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition flex items-center"
                >
                  {uploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    "Upload Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
