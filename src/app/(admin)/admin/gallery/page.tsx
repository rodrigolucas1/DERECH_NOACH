"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Trash2, Images, ArrowLeft, Upload } from "lucide-react";

export default function AdminGalleryPage() {
  const utils = trpc.useUtils();
  const { data: albums, isLoading } = trpc.gallery.albumList.useQuery();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const { data: albumDetail } = trpc.gallery.albumGet.useQuery(
    { id: selectedAlbumId! },
    { enabled: !!selectedAlbumId }
  );

  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState({ title: "", description: "" });
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [mediaForm, setMediaForm] = useState({ url: "", caption: "", type: "IMAGE" as string });

  const createAlbum = trpc.gallery.albumCreate.useMutation({
    onSuccess: () => { toast.success("Álbum criado!"); utils.gallery.albumList.invalidate(); setShowAlbumForm(false); setAlbumForm({ title: "", description: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAlbum = trpc.gallery.albumDelete.useMutation({
    onSuccess: () => { toast.success("Álbum removido!"); utils.gallery.albumList.invalidate(); setSelectedAlbumId(null); },
    onError: (e) => toast.error(e.message),
  });
  const addMedia = trpc.gallery.mediaAdd.useMutation({
    onSuccess: () => { toast.success("Mídia adicionada!"); utils.gallery.albumGet.invalidate({ id: selectedAlbumId! }); utils.gallery.albumList.invalidate(); setShowMediaForm(false); setMediaForm({ url: "", caption: "", type: "IMAGE" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMedia = trpc.gallery.mediaDelete.useMutation({
    onSuccess: () => { toast.success("Mídia removida!"); utils.gallery.albumGet.invalidate({ id: selectedAlbumId! }); utils.gallery.albumList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const selectedAlbum = albums?.find((a: any) => a.id === selectedAlbumId);
  const mediaItems = albumDetail?.media ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeria"
        description={selectedAlbum ? `Álbum: ${selectedAlbum.title}` : "Gerencie álbuns e mídias"}
        action={
          selectedAlbum ? (
            <Button variant="outline" onClick={() => { setSelectedAlbumId(null); setShowMediaForm(false); }}>
              <ArrowLeft className="mr-2 h-4 w-4" />Voltar
            </Button>
          ) : (
            <Button onClick={() => { setAlbumForm({ title: "", description: "" }); setShowAlbumForm(!showAlbumForm); }}>
              <Plus className="mr-2 h-4 w-4" />{showAlbumForm ? "Cancelar" : "Novo Álbum"}
            </Button>
          )
        }
      />

      {showAlbumForm && !selectedAlbumId && (
        <Card>
          <CardHeader><CardTitle>Novo Álbum</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); createAlbum.mutate({ title: albumForm.title, description: albumForm.description || undefined }); }} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título *</Label>
                <Input value={albumForm.title} onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <Input value={albumForm.description} onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createAlbum.isPending}>{createAlbum.isPending ? "Criando..." : "Criar Álbum"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedAlbumId && showMediaForm && (
        <Card>
          <CardHeader><CardTitle>Adicionar Mídia</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); addMedia.mutate({ albumId: selectedAlbumId, url: mediaForm.url, type: mediaForm.type as "IMAGE" | "VIDEO", caption: mediaForm.caption || undefined }); }} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>URL da mídia *</Label>
                <Input value={mediaForm.url} onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select value={mediaForm.type} onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="IMAGE">Imagem</option>
                  <option value="VIDEO">Vídeo</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Legenda</Label>
                <Input value={mediaForm.caption} onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={addMedia.isPending}>{addMedia.isPending ? "Adicionando..." : "Adicionar"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : selectedAlbumId ? (
        <>
          <Button variant="outline" size="sm" onClick={() => setShowMediaForm(true)}>
            <Upload className="mr-2 h-4 w-4" />Adicionar Mídia
          </Button>
          {mediaItems.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12">
              <Images className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Nenhuma mídia neste álbum</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mediaItems.map((m: any) => (
                <Card key={m.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <img src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover" />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0"
                      onClick={() => setDeleteMediaId(m.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {m.caption && <CardContent className="p-3"><p className="text-sm text-gray-600">{m.caption}</p></CardContent>}
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        albums?.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12">
            <Images className="h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Nenhum álbum criado</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums?.map((album: any) => (
              <Card key={album.id} className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                onClick={() => setSelectedAlbumId(album.id)}>
                <div className="relative aspect-video bg-gray-100">
                  {album.coverUrl
                    ? <img src={album.coverUrl} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center"><Images className="h-10 w-10 text-gray-300" /></div>
                  }
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); setDeleteAlbumId(album.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{album.title}</h3>
                  <p className="text-sm text-gray-500">{album._count?.media ?? 0} mídias</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        open={deleteAlbumId !== null}
        onOpenChange={(open) => { if (!open) setDeleteAlbumId(null); }}
        title="Remover álbum"
        description="Tem certeza que deseja remover este álbum e todas as suas mídias? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteAlbumId) deleteAlbum.mutate({ id: deleteAlbumId }); setDeleteAlbumId(null); }}
      />

      <ConfirmDialog
        open={deleteMediaId !== null}
        onOpenChange={(open) => { if (!open) setDeleteMediaId(null); }}
        title="Remover mídia"
        description="Tem certeza que deseja remover esta mídia? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteMediaId) deleteMedia.mutate({ id: deleteMediaId }); setDeleteMediaId(null); }}
      />
    </div>
  );
}
