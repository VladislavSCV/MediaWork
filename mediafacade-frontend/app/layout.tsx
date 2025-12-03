import "./globals.css";

export const metadata = {
  title: "Медиафасады",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-white via-[#f5f7fa] to-[#e5edf5] antialiased">
        {children}
      </body>
    </html>
  );
}
