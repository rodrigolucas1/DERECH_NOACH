export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Portal Bnei Noach. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="/about" className="text-sm text-gray-500 hover:text-gray-700">
              Sobre
            </a>
            <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
              Contato
            </a>
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
