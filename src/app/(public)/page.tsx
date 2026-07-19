import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
            Bnei Noach
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Sobre
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Cadastrar-se
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
            Portal Comunidade
            <br />
            <span className="text-blue-900 dark:text-blue-200">
              Bnei Noach
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Conectando a comunidade Bnei Noach do Brasil. Estudos, encontros,
            eventos e muito mais em uma única plataforma.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-md bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Comece Agora
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
            >
              Saiba Mais <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Portal Bnei Noach Brasil. Todos os
          direitos reservados.
        </p>
      </footer>
    </div>
  );
}
