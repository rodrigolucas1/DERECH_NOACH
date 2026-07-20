import { Mail, MapPin, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contato</h1>
        <p className="mt-2 text-gray-600">
          Entre em contato com a comunidade Bnei Noach do Brasil
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Envie sua mensagem
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Mensagem
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Como podemos ajudar?"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-900 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Enviar
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Informações de contato
            </h2>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                contato@bneinoach.org.br
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                Brasil
              </li>
              <li className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                Comunidade Bnei Noach do Brasil
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Sobre a comunidade
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              A Comunidade Bnei Noach do Brasil é um espaço dedicado aos filhos
              de Noé que desejam seguir os Sete Mandamentos de Noé. Nosso
              objetivo é fortalecer os laços da comunidade por meio de estudos,
              encontros e eventos que promovam a ética universal e os valores
              compartilhados pelas tradições Abraâmicas.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
