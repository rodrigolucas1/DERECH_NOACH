"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";

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
      <FadeIn>
        <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 px-8 py-16 text-center text-white sm:px-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <Globe className="mx-auto mb-6 h-12 w-12 text-blue-300" />
          </motion.div>
          <h1 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Sobre o Portal Bnei Noach
          </h1>
          <p className="relative mx-auto mt-4 max-w-2xl text-lg text-blue-200">
            Uma plataforma dedicada a fortalecer e unir a comunidade Bnei Noach
            em todo o Brasil, promovendo estudo, fraternidade e compromisso com os
            Sete Mandamentos Noéticos.
          </p>
        </section>
      </FadeIn>

      <SlideUp className="mt-16">
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
            na observância dos Sete Mandamentos Noéticos.
          </p>
        </div>
      </SlideUp>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          O que oferecemos
        </h2>
        <StaggerContainer className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <AnimatedCard className="rounded-xl border bg-white p-6 shadow-sm h-full">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex rounded-lg bg-blue-50 p-3"
                >
                  <feature.icon className="h-6 w-6 text-blue-900" />
                </motion.div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Nossos Valores
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Fundamentados nos Sete Mandamentos Noéticos que, segundo a tradição
          judaica, foram transmitidos a toda humanidade através de Noé e seus
          filhos.
        </p>
        <StaggerContainer className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <StaggerItem key={value.title}>
              <AnimatedCard className="flex items-start gap-4 rounded-xl border bg-white p-6 shadow-sm h-full">
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
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <SlideUp className="mt-16">
        <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Nossos Parceiros
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Conheça os sites e iniciativas que fazem parte da nossa rede.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { name: "Bnei Noach Brasil", url: "https://www.bneinoach.org.br", description: "Portal oficial da comunidade" },
              { name: "Rabbi Iacov", url: "https://www.rabinoiacov.com", description: "Ensinos e conteúdos do Rabino" },
              { name: "Loja Bnei Noach", url: "https://www.lojabneinoach.com", description: "Produtos e materiais comunitários" },
              { name: "Brooklyn 770", url: "https://www.brooklin770.com.br", description: "Centro judaico e comunitário" },
            ].map((site) => (
              <a
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border bg-white p-4 text-left transition-all hover:shadow-md hover:border-blue-200"
              >
                <Globe className="h-5 w-5 text-blue-900 shrink-0 group-hover:text-blue-600 transition-colors" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{site.name}</p>
                  <p className="text-xs text-gray-500">{site.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-blue-600 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </SlideUp>

      <SlideUp className="mt-16">
        <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-white p-8 text-center shadow-sm">
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
              className="rounded-md bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-all hover:scale-105 active:scale-95"
            >
              Cadastrar-se
            </Link>
            <Link
              href="/"
              className="group text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1"
            >
              Voltar ao início
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
