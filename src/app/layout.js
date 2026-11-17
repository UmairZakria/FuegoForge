import {
  Cormorant_Garamond,
  Cinzel,
  Cinzel_Decorative,
  Poppins,
  Raleway,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  variable: "--next-font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--next-font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  variable: "--next-font-cinzel-decorative",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--next-font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--next-font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://fuegoforge.vercel.app"),
  title: {
    default: "FUEGO FORGE | Handcrafted Luxury Fine Jewelry",
    template: "%s | FUEGO FORGE",
  },
  description:
    "Discover the official handcrafted fine jewelry collection from Fuego Forge. Contemporary circular luxury, vintage-inspired hairpins, gemstone necklaces, and artisan earrings.",
  keywords: [
    "Fuego Forge",
    "Handmade Jewelry",
    "Luxury Fine Jewelry",
    "Vintage Hairpins",
    "Gold Hoop Earrings",
    "Pearl Huggies",
    "Artisan Etsy Jewelry",
    "Circulaire Luxury",
  ],
  authors: [{ name: "FUEGO FORGE" }],
  creator: "FUEGO FORGE",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fuegoforge.vercel.app",
    siteName: "FUEGO FORGE",
    title: "FUEGO FORGE | Handcrafted Luxury Fine Jewelry",
    description:
      "Modern artisan jewelry crafted for everyday elegance and circular luxury. Exclusive Etsy flash sale collections.",
    images: [
      {
        url: "https://i.etsystatic.com/58316748/c/932/932/330/130/il/66d1a3/8789393707/il_800x800.8789393707_i4u1.jpg",
        width: 1200,
        height: 1200,
        alt: "FUEGO FORGE Fine Jewelry Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FUEGO FORGE | Handcrafted Luxury Fine Jewelry",
    description: "Exclusive artisan jewelry pieces designed for timeless elegance.",
    creator: "@fuegoforge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  // Global Organization & WebSite SearchAction Schema for Google & Bing
  const organizationSchema = [
    {
      "@context": "https://schema.org",
      "@type": "JewelryStore",
      name: "FUEGO FORGE",
      url: "https://fuegoforge.vercel.app",
      logo: "https://i.etsystatic.com/58316748/c/932/932/330/130/il/66d1a3/8789393707/il_800x800.8789393707_i4u1.jpg",
      description: "Artisan handcrafted luxury jewelry and circular heirlooms.",
      priceRange: "$$",
      sameAs: ["https://fuegoforge.etsy.com", "https://pinterest.com/fuegoforge"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "FUEGO FORGE",
      url: "https://fuegoforge.vercel.app",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://fuegoforge.vercel.app/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cinzel.variable} ${cinzelDecorative.variable} ${poppins.variable} ${raleway.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SmoothScroll />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
