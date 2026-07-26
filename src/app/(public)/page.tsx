"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Calendar, BookOpen, MessageCircle, Library, HandHeart, Globe, ArrowRight, ExternalLink } from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCounter } from "@/client/components/motion/AnimatedCounter";

function HomeSkeleton() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-4">
          <div className="h-12 w-80 mx-auto rounded bg-gray-200" />
          <div className="h-12 w-64 mx-auto rounded bg-gray-200" />
          <div className="h-6 w-96 mx-auto rounded bg-gray-200 mt-6" />
        </div>
      </main>
    </div>
  );
}

const features = [
  { icon: Users, title: "Comunidades", description: "Encontre e participe de comunidades Bnei Noach perto de você.", href: "/communities" },
  { icon: Calendar, title: "Eventos", description: "Acompanhe encontros, conferências e celebrações.", href: "/events" },
  { icon: BookOpen, title: "Estudos", description: "Acesse materiais de estudo sobre as Sete Leis de Noé.", href: "/studies" },
  { icon: Library, title: "Biblioteca", description: "Livros, documentos, vídeos e áudios organizados.", href: "/library" },
  { icon: MessageCircle, title: "Fórum", description: "Participe de discussões com outros membros.", href: "/forum" },
  { icon: HandHeart, title: "Tzedaká", description: "Contribua com projetos de caridade comunitária.", href: "/tzedaka" },
];

const partnerSites = [
  { name: "Bnei Noach Brasil", url: "https://www.bneinoach.org.br", description: "Portal oficial da comunidade Bnei Noach do Brasil" },
  { name: "Rabbi Iacov", url: "https://www.rabinoiacov.com", description: "Ensinos e conteúdos do Rabino Iacov" },
  { name: "Loja Bnei Noach", url: "https://www.lojabneinoach.com", description: "Produtos e materiais para a comunidade" },
  { name: "Brooklyn 770", url: "https://www.brooklin770.com.br", description: "Centro judaico e comunitário" },
];

function HomeContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 px-6 py-20 sm:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <FadeIn className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8"
            >
              <Globe className="h-4 w-4" />
              Comunidade Nacional
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
              Portal Comunidade
              <br />
              <span className="text-blue-900 dark:text-blue-200">
                Bnei Noach
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Conectando a comunidade Bnei Noach do Brasil. Estudos, encontros,
              eventos e muito mais em uma única plataforma.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register" className="rounded-md bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-all hover:scale-105 active:scale-95">
                Comece Agora
              </Link>
              <Link href="/about" className="group text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-1">
                Saiba Mais
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </section>

        <section className="px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <Link
                    href={feature.href}
                    className="group block rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1"
                  >
                    <div className="inline-flex rounded-lg bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors">
                      <feature.icon className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className="px-6 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <SlideUp>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  { label: "Comunidades", value: 12, suffix: "+" },
                  { label: "Membros", value: 500, suffix: "+" },
                  { label: "Eventos", value: 50, suffix: "+" },
                  { label: "Materiais", value: 200, suffix: "+" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      className="text-4xl font-bold text-blue-900"
                    />
                    <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </SlideUp>
          </div>
        </section>

        <section className="px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <SlideUp>
              <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
                Nossos Parceiros
              </h2>
              <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
                Conheça os sites e iniciativas que fazem parte da nossa rede de comunidades.
              </p>
            </SlideUp>
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {partnerSites.map((site) => (
                <StaggerItem key={site.url}>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 h-full"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Globe className="h-6 w-6 text-blue-900 group-hover:text-blue-600 transition-colors" />
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {site.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {site.description}
                    </p>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className="px-6 py-16 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <SlideUp>
              <h2 className="text-3xl font-bold text-gray-900">Pronto para começar?</h2>
              <p className="mt-4 text-lg text-gray-600">
                Junte-se a centenas de Bnei Noach de todo o Brasil. Cadastre-se gratuitamente e comece a se conectar.
              </p>
              <div className="mt-8">
                <Link href="/register" className="rounded-md bg-blue-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-all hover:scale-105 active:scale-95">
                  Criar Conta Grátis
                </Link>
              </div>
            </SlideUp>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
