"use client";

import { useState, useEffect, ChangeEvent, DragEvent, FormEvent } from "react";
import { storage, database } from "../../../lib/firebaseconfig";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { ref as dbRef, onValue, update, remove } from "firebase/database";
import { X, Plus, Upload, Edit3, Trash2 } from "lucide-react";

interface Product {
  key: string;
  productName: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  description: string;
  imageUrls: string[];
  sizes: string[];
  createdAt: number;
}

interface EditImage {
  file?: File; // If a new file is selected
  url: string; // Existing image URL or will be set after upload
  preview?: string; // For previewing a new image before upload
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editProductName, setEditProductName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSizes, setEditSizes] = useState<string[]>([]);
  const [editSizeInput, setEditSizeInput] = useState("");
  const [editImages, setEditImages] = useState<EditImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch products from Firebase on mount
  useEffect(() => {
    const productsRef = dbRef(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList: Product[] = [];
      for (let key in data) {
        productList.push({ key, ...data[key] });
      }
      setProducts(productList);
    });
    return () => unsubscribe();
  }, []);

  // Load product details into edit states and open modal
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductName(product.productName);
    setEditCategory(product.category);
    setEditPrice(product.price.toString());
    setEditDiscount(product.discount.toString());
    setEditStock(product.stock.toString());
    setEditDescription(product.description);
    setEditSizes(product.sizes || []);
    // Set up images for editing. They’re already hosted so we keep their URLs.
    setEditImages(product.imageUrls.map((url) => ({ url })));
    setIsEditing(true);
  };

  // Delete product handler
  const handleDelete = async (product: Product) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await remove(dbRef(database, `products/${product.key}`));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("There was an error deleting the product.");
    }
  };

  // Drag & Drop Handlers for images
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

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        setEditImages((prev) => [...prev, { file, url: "", preview }]);
      }
    });
  };

  // Remove an image from the edit list
  const removeImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add a new size entry
  const handleAddSize = () => {
    const trimmed = editSizeInput.trim();
    if (trimmed && !editSizes.includes(trimmed)) {
      setEditSizes((prev) => [...prev, trimmed]);
      setEditSizeInput("");
    }
  };

  const handleRemoveSize = (index: number) => {
    setEditSizes((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle update submission
  const handleUpdateProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setUploading(true);
    try {
      // Upload any new images (ones that have a File)
      const updatedImageUrls = await Promise.all(
        editImages.map(async (img) => {
          if (img.file) {
            const filePath = `products/${Date.now()}_${img.file.name}`;
            const storageReference = storageRef(storage, filePath);
            const uploadTask = uploadBytesResumable(storageReference, img.file);
            await new Promise((resolve, reject) => {
              uploadTask.on("state_changed", null, reject, () => resolve(null));
            });
            return await getDownloadURL(storageReference);
          } else {
            return img.url;
          }
        })
      );

      // Prepare updated product data
      const productRef = dbRef(database, `products/${selectedProduct.key}`);
      const updatedProduct = {
        productName: editProductName,
        category: editCategory,
        price: parseFloat(editPrice),
        discount: parseFloat(editDiscount),
        stock: parseInt(editStock, 10),
        description: editDescription,
        sizes: editSizes,
        imageUrls: updatedImageUrls,
        updatedAt: Date.now(),
      };

      // Update in Firebase Realtime Database
      await update(productRef, updatedProduct);
      alert("Product updated successfully!");
      setIsEditing(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("There was an error updating the product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Manage Products</h1>
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Price (Rs.)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.key} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{product.productName}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                    >
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={5}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Product Modal */}
        {isEditing && selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Edit3 className="w-6 h-6 text-blue-600" /> Edit Product
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <form onSubmit={handleUpdateProduct} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name</label>
                      <input
                        type="text"
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Price (Rs.)</label>
                      <input
                        type="number"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Sizes</label>
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={editSizeInput}
                        onChange={(e) => setEditSizeInput(e.target.value)}
                        placeholder="Enter size (e.g., S, M, L)"
                        className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {editSizes.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {editSizes.map((size, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-gray-200 px-4 py-1 rounded-full"
                          >
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
                    <label className="block text-sm font-medium mb-1">Product Images</label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        dragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-10 h-10 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag & drop images here or{" "}
                        <button
                          type="button"
                          className="text-blue-600 underline"
                          onClick={() => {
                            // Optionally trigger a file input for selecting images.
                          }}
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: JPG, PNG, GIF (Max 5MB each)
                      </p>
                    </div>
                    {editImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {editImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img.preview || img.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="p-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  disabled={uploading}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                  {uploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                      Updating...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </main>
  );
}

