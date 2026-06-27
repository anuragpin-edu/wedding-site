import Nav from "@/components/Nav";

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav silo="wedding" />
      {children}
    </>
  );
}
