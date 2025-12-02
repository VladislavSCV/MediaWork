import "./globals.css";

export const metadata = {
  title: "Медиафасады",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-[#f8f8f8] via-[#f3f3f3] to-[#ebebeb] text-[#111] antialiased">
        {children}
      </body>
    </html>
  );
}
