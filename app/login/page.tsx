// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebaseconfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref as dbRef, get, set } from "firebase/database";

export default function LoginPage() {
  const router = useRouter();

  // State to manage registration form display and form data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [phone, setPhone] = useState("");
  // Temporarily store user details returned from Google sign-in if user is new
  const [userData, setUserData] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null>(null);

  // Handle Google login process
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
        // User already exists, redirect to home page
        router.push("/");
      } else {
        // New user; store details and show registration form to ask for phone number
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

  // Handle submission of phone number to complete registration
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
      // Save user data in Firebase under "users/{uid}"
      await set(dbRef(database, `users/${userData.uid}`), {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        phone: phone,
      });
      // Redirect to home page after successful registration
      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {showRegistrationForm ? "Complete Registration" : "Login"}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!showRegistrationForm ? (
          // Login Section: Display the Google Login button
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 shadow hover:bg-gray-50 transition"
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
          // Registration Section: Ask for the 10-digit phone number
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
