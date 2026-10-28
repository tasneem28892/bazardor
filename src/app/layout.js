import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "বাজার দর | BazarDor",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের বাজারদর এক নজরে দেখুন।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f1f5ef] text-gray-900 antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#202c23",
              color: "#fff",
            },
          }}
        />

        <Navbar />
        {children}
      </body>
    </html>
  );
}