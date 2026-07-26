"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const steps: TourStep[] = [
  {
    target: "header",
    title: "Bem-vindo ao Portal Bnei Noach!",
    content: "Este é o cabeçalho da plataforma. Aqui você encontra o menu de navegação e seu perfil.",
  },
  {
    target: "nav",
    title: "Navegação",
    content: "Use estes links para acessar Comunidades, Eventos, Estudos e outros módulos da plataforma.",
  },
  {
    target: "search",
    title: "Pesquisa Global",
    content: "Use a pesquisa para encontrar estudos, eventos, notícias e muito mais em toda a plataforma.",
  },
  {
    target: "ai",
    title: "Assistente IA",
    content: "Nosso assistente de Inteligência Artificial pode ajudar com dúvidas sobre a Torá e a comunidade.",
  },
  {
    target: "help",
    title: "Central de Ajuda",
    content: "Precisa de ajuda? Acesse nossa central de FAQ e tutoriais.",
  },
];

const STORAGE_KEY = "bneinoach-tour-completed";

export function GuidedTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleClose() {
    setIsOpen(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  function handleRestart() {
    setCurrentStep(0);
    setIsOpen(true);
  }

  useEffect(() => {
    (window as any).__restartTour = handleRestart;
    return () => {
      delete (window as any).__restartTour;
    };
  }, []);

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Passo {currentStep + 1} de {steps.length}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
          <p className="mb-6 text-sm text-gray-600">{step.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? "w-6 bg-blue-600" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Pular Tour
              </Button>
              <Button size="sm" onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Próximo
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  "Concluir"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
