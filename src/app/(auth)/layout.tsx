import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`w-screen h-full min-h-screen flex ${geistSans.variable} ${geistMono.variable} antialiased`}
      style={{
        backgroundImage: "url('/bg-auth.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full md:w-3/4 flex items-center justify-center md:justify-end h-full min-h-screen">
        <Card className="bg-transparent backdrop-blur-sm shadow-2xl py-12 max-w-[475px] w-full">
          <CardHeader className="place-content-center">
            <Image
              src="/logo.png"
              alt="logo"
              width={175}
              height={175}
              priority={true}
            />
          </CardHeader>
          <CardContent className="px-12">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
