"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, CheckCircle, XCircle, Search } from "lucide-react";

export default function VerifyCertificatePage() {
  const [code, setCode] = useState("");
  const [searchCode, setSearchCode] = useState("");

  const { data: certificate, isLoading, error } = trpc.certificate.verifyCertificate.useQuery(
    { certificateNumber: searchCode },
    { enabled: !!searchCode }
  );

  function handleVerify(ev: React.FormEvent) {
    ev.preventDefault();
    if (code.trim()) {
      setSearchCode(code.trim());
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <Award className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Verificar Certificado</h1>
        <p className="mt-2 text-gray-600">Digite o código do certificado para verificar sua autenticidade</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleVerify} className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label>Código do Certificado</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CERT-M1ABC123-X9Y2"
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={!code.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Verificar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchCode && (
        <div className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Verificando certificado...
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 py-6">
                <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Certificado não encontrado</p>
                  <p className="text-sm text-red-500">O código informado não corresponde a nenhum certificado válido.</p>
                </div>
              </CardContent>
            </Card>
          ) : certificate ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Certificado Válido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Destinatário</p>
                    <p className="font-medium text-gray-900">{certificate.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Template</p>
                    <p className="font-medium text-gray-900">{certificate.template.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Código</p>
                    <p className="font-mono text-xs text-gray-900">{certificate.certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Data de Emissão</p>
                    <p className="font-medium text-gray-900">{new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  {certificate.completionDate && (
                    <div>
                      <p className="text-gray-500">Data de Conclusão</p>
                      <p className="font-medium text-gray-900">{new Date(certificate.completionDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${certificate.status === "ACTIVE" ? "text-green-600" : certificate.status === "REVOKED" ? "text-red-600" : "text-yellow-600"}`}>
                      {certificate.status === "ACTIVE" ? "Ativo" : certificate.status === "REVOKED" ? "Revogado" : "Expirado"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
