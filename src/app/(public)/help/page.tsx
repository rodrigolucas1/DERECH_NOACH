"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  BookOpen,
  Calendar,
  Users,
  Library,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const faqItems = [
  {
    question: "Como criar uma conta?",
    answer:
      'Para criar uma conta, clique no botão "Cadastrar-se" na página inicial. Preencha seus dados pessoais, incluindo nome, e-mail e senha. Você receberá um e-mail de confirmação. Após confirmar, sua conta estará ativa e você poderá participar da comunidade.',
  },
  {
    question: "Como participar de uma comunidade?",
    answer:
      'Navegue até a seção "Comunidades" e explore as comunidades disponíveis. Clique em "Participar" na comunidade de interesse. Algumas comunidades podem exigir aprovação de um administrador. Após ser aceito, você terá acesso ao conteúdo, eventos e discussões da comunidade.',
  },
  {
    question: "Como me inscrever em eventos?",
    answer:
      'Acesse a seção "Eventos" para ver todos os eventos disponíveis. Clique em um evento para ver os detalhes e clique em "Inscrever-se". Você receberá uma confirmação e lembretes antes do evento. É possível cancelar a inscrição a qualquer momento.',
  },
  {
    question: "Como acessar os estudos?",
    answer:
      'Vá até a seção "Estudos" para navegar pelos materiais disponíveis. Os estudos estão organizados por categorias e níveis. Você pode salvar estudos como favoritos para acessá-los facilmente depois. Alguns estudos podem incluir vídeos, textos e exercícios.',
  },
  {
    question: "Como usar a IA do portal?",
    answer:
      'Acesse a seção "IA" no menu principal. O assistente inteligente pode ajudar com dúvidas sobre as Sete Leis de Noé, recomendar estudos e responder perguntas gerais sobre a fé. Digite sua pergunta na caixa de texto e receba uma resposta fundamentada.',
  },
  {
    question: "Como configurar minhas notificações?",
    answer:
      'Acesse "Configurações" e vá até a aba "Notificações". Lá você pode ativar ou desativar notificações por e-mail, in-app, eventos, estudos, notícias, comunidades e IA. Você também pode configurar sua privacidade e preferências gerais na aba "Preferências".',
  },
  {
    question: "Como alterar minha senha?",
    answer:
      'Vá até "Configurações" e selecione a aba "Segurança". Preencha o formulário de alteração de senha com sua senha atual e a nova senha. Confirme a nova senha e clique em "Alterar Senha". Recomendamos usar uma senha forte com pelo menos 8 caracteres.',
  },
];

const quickLinks = [
  { icon: BookOpen, title: "Estudos", description: "Materiais de estudo sobre as Sete Leis de Noé", href: "/studies", color: "bg-green-50 text-green-900" },
  { icon: Calendar, title: "Eventos", description: "Encontros, conferências e celebrações", href: "/events", color: "bg-blue-50 text-blue-900" },
  { icon: Users, title: "Comunidades", description: "Conecte-se com outros membros", href: "/communities", color: "bg-purple-50 text-purple-900" },
  { icon: Library, title: "Biblioteca", description: "Livros, documentos e recursos", href: "/library", color: "bg-amber-50 text-amber-900" },
  { icon: Sparkles, title: "IA", description: "Assistente inteligente do portal", href: "/ai", color: "bg-cyan-50 text-cyan-900" },
];

function FaqItem({ item }: { item: (typeof faqItems)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:text-blue-600"
      >
        <span className="text-sm font-medium text-gray-900">{item.question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-gray-600">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn>
        <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 px-8 py-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-blue-300" />
          </motion.div>
          <h1 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Central de Ajuda
          </h1>
          <p className="relative mt-3 text-lg text-blue-200">
            Como podemos ajudar?
          </p>
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar perguntas frequentes..."
              className="h-11 pl-10 text-gray-900"
            />
          </div>
        </section>
      </FadeIn>

      <SlideUp className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Perguntas Frequentes</h2>
        <p className="mt-1 text-sm text-gray-500">
          Respostas para as dúvidas mais comuns
        </p>
        <Card className="mt-4">
          <CardContent className="divide-y divide-gray-100 px-6">
            {filteredFaq.length > 0 ? (
              filteredFaq.map((item) => <FaqItem key={item.question} item={item} />)
            ) : (
              <div className="py-8 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">
                  Nenhum resultado encontrado para &quot;{searchQuery}&quot;
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Tente buscar com outras palavras
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </SlideUp>

      <SlideUp className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Links Rápidos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Acesse diretamente as principais seções
        </p>
        <StaggerContainer className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <StaggerItem key={link.title}>
              <Link href={link.href}>
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="flex items-start gap-3 pt-4">
                    <div className={`inline-flex rounded-lg p-2.5 ${link.color} group-hover:scale-110 transition-transform`}>
                      <link.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {link.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SlideUp>

      <SlideUp className="mt-10">
        <Card className="bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="flex flex-col items-center gap-6 py-10 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <MessageCircle className="h-7 w-7 text-blue-900" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                Ainda precisa de ajuda?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Nossa equipe está pronta para ajudar. Entre em contato e responderemos o mais rápido possível.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="mailto:contato@bneinoach.org.br"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  E-mail
                </a>
                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideUp>
    </div>
  );
}
