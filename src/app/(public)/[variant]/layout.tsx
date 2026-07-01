import { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

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
