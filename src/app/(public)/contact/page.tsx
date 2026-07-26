"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Users, Send } from "lucide-react";
import { FadeIn, SlideUp } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contato</h1>
        <p className="mt-2 text-gray-600">
          Entre em contato com a comunidade Bnei Noach do Brasil
        </p>
      </FadeIn>

      <div className="grid gap-8 md:grid-cols-2">
        <SlideUp>
          <AnimatedCard className="rounded-xl border bg-white p-6 shadow-sm h-full">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Envie sua mensagem
            </h2>
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-lg bg-green-50 p-6 text-center"
              >
                <Send className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-green-700 font-medium">Mensagem enviada com sucesso!</p>
                <p className="text-sm text-green-600 mt-1">Retornaremos em breve.</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Como podemos ajudar?"
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-md bg-blue-900 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  Enviar
                </motion.button>
              </form>
            )}
          </AnimatedCard>
        </SlideUp>

        <SlideUp delay={0.2}>
          <div className="space-y-6 h-full">
            <AnimatedCard className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Informações de contato
              </h2>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  contato@bneinoach.org.br
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Brasil
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  Comunidade Bnei Noach do Brasil
                </li>
              </ul>
            </AnimatedCard>

            <AnimatedCard className="rounded-xl border bg-white p-6 shadow-sm">
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
            </AnimatedCard>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
