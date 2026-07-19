import { Header } from "@/client/components/layout/Header";
import { Footer } from "@/client/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </>
  );
}
