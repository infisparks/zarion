// app/cart/[productKey]/page.tsx
import CartItemClient from "./CartItemClient";
import { database } from "../../../lib/firebaseconfig";
import { ref as dbRef, get } from "firebase/database";

/**
 * generateStaticParams() is called at build time so that Next.js
 * can pre-render pages for each product key when using static export.
 */
export async function generateStaticParams() {
  try {
    // Fetch all products from Firebase
    const productsRef = dbRef(database, "products");
    const snapshot = await get(productsRef);
    const data = snapshot.val();

    if (!data) return [];

    // Return an array of parameter objects with productKey values
    const productKeys = Object.keys(data);
    return productKeys.map((key) => ({ productKey: key }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/**
 * The server component simply renders the client component,
 * passing along the dynamic parameter (productKey).
 */
export default function CartItemPage({
  params,
}: {
  params: { productKey: string };
}) {
  return <CartItemClient productKey={params.productKey} />;
}
