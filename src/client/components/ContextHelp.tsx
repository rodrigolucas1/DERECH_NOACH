"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ContextHelpProps {
  module: string;
}

const helpContent: Record<string, string> = {
  events:
    "Explore eventos da comunidade. Você pode se inscrever em eventos presenciais e online.",
  studies:
    "Acesse materiais de estudo sobre as Sete Leis de Noé.",
  library:
    "Biblioteca com livros, vídeos, áudios e documentos.",
  ai: "Assistente IA para tirar dúvidas sobre a Torá e a comunidade.",
  admin: "Painel administrativo para gerenciar a plataforma.",
  settings:
    "Configure suas preferências, notificações e privacidade.",
};

export function ContextHelp({ module }: ContextHelpProps) {
  const [open, setOpen] = useState(false);

  const text = helpContent[module] ?? "Ajuda disponível para esta seção.";

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 left-0 w-72 rounded-lg border bg-white p-4 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Ajuda</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
