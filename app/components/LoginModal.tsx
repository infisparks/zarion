// app/components/LoginModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebaseconfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref as dbRef, get, set } from "firebase/database";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user already exists in Firebase Database
      const userRef = dbRef(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        onClose(); // close modal on successful login
        router.push("/"); // redirect home
      } else {
        // New user: store details and show the registration form
        setUserData({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        setShowRegistrationForm(true);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!userData) {
      setError("User data is missing.");
      return;
    }
    setLoading(true);
    try {
      // Save the new user's data under "users/{uid}" in Firebase
      await set(dbRef(database, `users/${userData.uid}`), {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        phone: phone,
      });
      onClose();
      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-md w-full bg-white rounded-lg p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h1 className="text-2xl font-bold text-center mb-6">
          {showRegistrationForm ? "Complete Registration" : "Login"}
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}
        {!showRegistrationForm ? (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google logo"
                className="w-6 h-6"
              />
              <span className="font-medium text-gray-700">
                {loading ? "Signing in..." : "Login with Google"}
              </span>
            </button>
          </>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-gray-700 font-medium mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Complete Registration"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
