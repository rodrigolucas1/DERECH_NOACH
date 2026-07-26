"use client";

import { useState, useEffect } from "react";
import { GraduationCap, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "derech-noach-training-mode";

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const defaultSteps: TourStep[] = [
  { target: "header", title: "Cabeçalho", content: "Navegue pelas seções do portal, acesse notificações e seu perfil." },
  { target: "sidebar", title: "Menu Lateral", content: "Navegue rapidamente entre as seções do admin." },
  { target: "search", title: "Pesquisa", content: "Use a barra de pesquisa para encontrar conteúdos no portal." },
];

export function TrainingModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setEnabled(true);
    } catch {}
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
    if (next) {
      setCurrentStep(0);
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }

  function nextStep() {
    if (currentStep < defaultSteps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      setShowTooltip(false);
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  }

  const step = defaultSteps[currentStep];

  return (
    <>
      <button
        onClick={toggle}
        className={`fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${
          enabled
            ? "bg-blue-900 text-white hover:bg-blue-800"
            : "bg-white text-blue-900 border border-blue-200 hover:bg-blue-50"
        }`}
        title={enabled ? "Desativar Modo de Treinamento" : "Ativar Modo de Treinamento"}
      >
        <GraduationCap className="h-5 w-5" />
      </button>

      {showTooltip && enabled && (
        <div className="fixed bottom-20 left-6 z-50 w-72 rounded-xl border bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600">
              Passo {currentStep + 1} de {defaultSteps.length}
            </span>
            <button onClick={() => setShowTooltip(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
          <p className="mt-1 text-xs text-gray-600">{step.content}</p>
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Anterior
            </Button>
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={nextStep}
            >
              {currentStep === defaultSteps.length - 1 ? "Concluir" : "Próximo"}
              {currentStep < defaultSteps.length - 1 && <ChevronRight className="h-3 w-3 ml-1" />}
            </Button>
          </div>
          <div className="mt-2 flex justify-center gap-1">
            {defaultSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-4 bg-blue-600" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
