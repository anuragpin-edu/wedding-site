import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // One seamless patterned surface behind the whole public site — header,
    // content, and footer all share it, so nothing looks boxed.
    <div className="themed-pattern flex min-h-screen flex-col">
      <main className="animate-page flex-1">{children}</main>
      <Footer />
    </div>
  );
}
