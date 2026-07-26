import { Header } from "@/client/components/layout/Header";
import { Footer } from "@/client/components/layout/Footer";
import { ContextBar } from "@/client/components/layout/ContextBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <ContextBar />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </>
  );
}
