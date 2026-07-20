import Link from "next/link";
import {
  Heart,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  Library,
  HandHelping,
  Scale,
  ShieldCheck,
  Eye,
  Sun,
  Sparkles,
  Target,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Comunidades",
    description:
      "Encontre e participe de comunidades Bnei Noach em diversas cidades do Brasil.",
  },
  {
    icon: Calendar,
    title: "Eventos",
    description:
      "Acompanhe encontros, conferências e celebrações da comunidade.",
  },
  {
    icon: BookOpen,
    title: "Estudos",
    description:
      "Acesse materiais de estudo, aulas e recursos para aprofundar seu conhecimento.",
  },
  {
    icon: HandHelping,
    title: "Tzedaká",
    description:
      "Contribua com projetos de caridade e apoie iniciativas comunitárias.",
  },
  {
    icon: MessageCircle,
    title: "Fórum",
    description:
      "Participe de discussões, tire dúvidas e conecte-se com outros membros.",
  },
  {
    icon: Library,
    title: "Biblioteca",
    description:
      "Consulte uma coleção organizada de textos, artigos e referências.",
  },
];

const values = [
  {
    icon: Scale,
    title: "Não idolatrar",
    description:
      "Reconhecer e servir um único Criador, rejeitando toda forma de idolatria.",
  },
  {
    icon: Sparkles,
    title: "Não blasfemar",
    description:
      "Respeitar o Nome divino e abster-se de pronunciá-lo em vão.",
  },
  {
    icon: ShieldCheck,
    title: "Não matar",
    description:
      "Valorizar a vida humana e abster-se de qualquer forma de assassinato.",
  },
  {
    icon: Heart,
    title: "Não cometer imoralidade sexual",
    description:
      "Observar as leis de pureza e respeitar os vínculos familiares.",
  },
  {
    icon: Eye,
    title: "Não roubar",
    description:
      "Respeitar a propriedade alheia e ser honesto em todas as transações.",
  },
  {
    icon: Sun,
    title: "Não comer de animal vivo",
    description:
      "Abster-se de consumir carne arrancada de um animal vivo.",
  },
  {
    icon: Target,
    title: "Estabelecer tribunais",
    description:
      "Garantir a justiça e o cumprimento da lei na sociedade.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="rounded-lg bg-gradient-to-br from-blue-900 to-blue-800 px-8 py-16 text-center text-white sm:px-16">
        <Globe className="mx-auto mb-6 h-12 w-12 text-blue-300" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sobre o Portal Bnei Noach
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-200">
          Uma plataforma dedicada a fortalecer e unir a comunidade Bnei Noach
          em todo o Brasil, promovendo estudo, fraternidade e compromisso com os
          Sete Mandamentos Noéticos.
        </p>
      </section>

      <section className="mt-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Nossa Missão</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            O Portal Bnei Noach nasceu com o propósito de conectar comunidades
            filhas de Noé espalhadas por todo o Brasil. Acreditamos que, por
            meio do estudo, do diálogo e da cooperação, é possível fortalecer
            os laços entre os descendentes espirituais de Noá e construir uma
            rede de apoio mútuo que transcenda as fronteiras geográficas.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nosso objetivo é oferecer um espaço seguro e acessível onde cada
            pessoa possa aprofundar seu conhecimento, participar de eventos,
            contribuir com projetos de caridade e caminhar junto com outros
            naobservância dos Sete Mandamentos Noéticos.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          O que oferecemos
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <feature.icon className="h-8 w-8 text-blue-900" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Nossos Valores
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Fundamentados nos Sete Mandamentos Noéticos que, segundo a tradição
          judaica, foram transmitidos a toda humanidade através de Noé e seus
          filhos.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <value.icon className="h-5 w-5 text-blue-900" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 text-center">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Junte-se à comunidade
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Faça parte desta rede que cresce a cada dia. Cadastre-se
            gratuitamente e comece a se conectar com Bnei Noach de todo o
            Brasil.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Cadastrar-se
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
            >
              Voltar ao início <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
