import Nav from "@/components/Nav";

export default async function VariantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;

  return (
    <>
      <Nav variant={variant} />
      {children}
    </>
  );
}
