"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebaseconfig";
import { signOut } from "firebase/auth";
import { ref as dbRef, get, onValue, update } from "firebase/database";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaShoppingCart, FaBox, FaClock, FaSignOutAlt, FaEdit } from "react-icons/fa";
import LoginModal from "../components/LoginModal";

interface UserProfile {
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  uid: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Fields for updating profile details
  const [updatedDisplayName, setUpdatedDisplayName] = useState("");
  const [updatedPhone, setUpdatedPhone] = useState("");
  const [updatedAddress, setUpdatedAddress] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      // Fetch user profile from "users/{uid}"
      const userRef = dbRef(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const profile: UserProfile = {
          displayName: data.displayName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          uid: currentUser.uid,
        };
        setUserProfile(profile);
        setUpdatedDisplayName(profile.displayName);
        setUpdatedPhone(profile.phone || "");
        setUpdatedAddress(profile.address || "");
      }

      // Fetch cart total from "users/{uid}/cart"
      const cartRef = dbRef(database, `users/${currentUser.uid}/cart`);
      onValue(cartRef, (snapshot) => {
        const data = snapshot.val();
        let total = 0;
        if (data) {
          Object.values(data).forEach((item: any) => {
            total += item.price * item.quantity;
          });
        }
        setCartTotal(total);
      });

      // Fetch orders from "users/{uid}/orders"
      const ordersRef = dbRef(database, `users/${currentUser.uid}/orders`);
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        let totalOrders = 0;
        let pendingOrders = 0;
        if (data) {
          Object.values(data).forEach((order: any) => {
            totalOrders += 1;
            if (order.status && order.status.toLowerCase() === "pending") {
              pendingOrders += 1;
            }
          });
        }
        setOrderCount(totalOrders);
        setPendingOrderCount(pendingOrders);
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleUpdateProfile = async () => {
    if (userProfile) {
      try {
        const userRef = dbRef(database, `users/${userProfile.uid}`);
        await update(userRef, {
          displayName: updatedDisplayName,
          phone: updatedPhone,
          address: updatedAddress,
        });
        setUserProfile({
          ...userProfile,
          displayName: updatedDisplayName,
          phone: updatedPhone,
          address: updatedAddress,
        });
        setShowUpdateModal(false);
        alert("Profile updated successfully!");
      } catch (error: any) {
        console.error("Error updating profile:", error);
        alert(error.message || "Error updating profile.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <div className="min-h-screen bg-gray-50 py-12 px-4 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-8 py-10">
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                My Profile
              </h1>
              {userProfile && (
                <div className="space-y-6">
                  {/* User Details */}
                  <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4">
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-gray-600" size={24} />
                      <div>
                        <p className="text-lg font-semibold text-gray-700">Name</p>
                        <p className="text-gray-600">{userProfile.displayName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUpdateModal(true)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition font-medium"
                    >
                      <FaEdit />
                      <span>Update Details</span>
                    </button>
                  </div>
                  <div className="border-b pb-4 flex items-center space-x-3">
                    <FaEnvelope className="text-gray-600" size={20} />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">Email</p>
                      <p className="text-gray-600">{userProfile.email}</p>
                    </div>
                  </div>
                  <div className="border-b pb-4 flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-gray-600" size={20} />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">Address</p>
                      <p className="text-gray-600">
                        {userProfile.address ? userProfile.address : "Not Provided"}
                      </p>
                    </div>
                  </div>
                  <div className="border-b pb-4 flex items-center space-x-3">
                    <FaPhone className="text-gray-600" size={20} />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">Phone</p>
                      <p className="text-gray-600">
                        {userProfile.phone ? userProfile.phone : "Not Provided"}
                      </p>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Cart Total Card */}
                    <div
                      className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer"
                      onClick={() => router.push("/cart")}
                    >
                      <div className="flex items-center space-x-3">
                        <FaShoppingCart className="text-gray-800" size={28} />
                        <p className="text-2xl font-bold text-gray-800">
                          ₹{cartTotal.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Total in Cart</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/cart");
                        }}
                        className="mt-4 inline-block bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition text-xs"
                      >
                        View Cart
                      </button>
                    </div>
                    {/* Total Orders Card */}
                    <div
                      className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer"
                      onClick={() => router.push("/orders")}
                    >
                      <div className="flex items-center space-x-3">
                        <FaBox className="text-gray-800" size={28} />
                        <p className="text-2xl font-bold text-gray-800">{orderCount}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Total Orders</p>
                    </div>
                    {/* Pending Orders Card */}
                    <div
                      className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer"
                      onClick={() => router.push("/orders")}
                    >
                      <div className="flex items-center space-x-3">
                        <FaClock className="text-gray-800" size={28} />
                        <p className="text-2xl font-bold text-gray-800">{pendingOrderCount}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Pending Orders</p>
                    </div>
                  </div>
                  {/* Logout Button */}
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-8 rounded-full transition"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl focus:outline-none"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Update Profile
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={updatedDisplayName}
                  onChange={(e) => setUpdatedDisplayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={updatedPhone}
                  onChange={(e) => setUpdatedPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  value={updatedAddress}
                  onChange={(e) => setUpdatedAddress(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full transition font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
