"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Images, X, ChevronLeft, ChevronRight, Folder } from "lucide-react";

function GallerySkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-32 rounded bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

interface MediaItem {
  id: string;
  url: string;
  caption?: string;
  mediaType: string;
}

interface Album {
  id: string;
  title: string;
  coverUrl?: string;
  _count: { media: number };
}

interface AlbumDetail extends Album {
  media: MediaItem[];
}

function GalleryContent() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: albums, isLoading } = trpc.gallery.albumList.useQuery();

  const { data: albumDetail } = trpc.gallery.albumGet.useQuery(
    { id: selectedAlbum! },
    { enabled: !!selectedAlbum }
  );

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIndex === null || !albumDetail?.media) return;
    const len = albumDetail.media.length;
    setLightboxIndex(direction === "next" ? (lightboxIndex + 1) % len : (lightboxIndex - 1 + len) % len);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        {selectedAlbum && albumDetail ? (
          <div>
            <button
              onClick={() => { setSelectedAlbum(null); setLightboxIndex(null); }}
              className="mb-4 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              &larr; Voltar às galerias
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{albumDetail.title}</h1>
            <p className="mt-2 text-gray-600">
              {albumDetail.media.length} {albumDetail.media.length === 1 ? "item" : "itens"}
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Galeria</h1>
            <p className="mt-2 text-gray-600">Álbuns públicos da comunidade</p>
          </div>
        )}
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : selectedAlbum && albumDetail ? (
        albumDetail.media.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center">
            <Images className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Nenhum mídia nesta galeria.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {albumDetail.media.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="mb-4 break-inside-avoid"
              >
                <button
                  onClick={() => openLightbox(idx)}
                  className="group relative block w-full overflow-hidden rounded-lg"
                >
                  <img
                    src={item.url}
                    alt={item.caption ?? ""}
                    className="w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-sm text-white">{item.caption}</p>
                    </div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )
      ) : !albums?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Images className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma galeria disponível</p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <StaggerItem key={album.id}>
              <AnimatedCard
                className="group h-full cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm"
                onClick={() => setSelectedAlbum(album.id)}
              >
                {album.coverUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-50">
                    <Folder className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {album.title}
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    {album._count.media} {album._count.media === 1 ? "item" : "itens"}
                  </p>
                </div>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && albumDetail?.media && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute right-4 top-4 text-white/80 hover:text-white"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
              className="absolute left-4 text-white/80 hover:text-white"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={albumDetail.media[lightboxIndex].url}
              alt={albumDetail.media[lightboxIndex].caption ?? ""}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
              className="absolute right-4 text-white/80 hover:text-white"
            >
              <ChevronRight className="h-10 w-10" />
            </button>

            <div className="absolute bottom-4 text-sm text-white/60">
              {lightboxIndex + 1} / {albumDetail.media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryContent />
    </Suspense>
  );
}
