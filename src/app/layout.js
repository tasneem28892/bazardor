
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "বাজার দর | BazarDor",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের বাজারদর এক নজরে দেখুন।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f0f5ef] text-gray-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
