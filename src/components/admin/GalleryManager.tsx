"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_LABELS: Record<string, string> = {
  PEDICURE: "Pedicure",
  MANICURE: "Manicure",
  NAIL_POLISHING: "Nail Polishing",
  GEL: "Gel",
  ACRYLIC: "Acrylic",
  NAIL_ART: "Nail Art",
  NAIL_EXTENSIONS: "Nail Extensions",
  BEFORE_AFTER: "Before & After",
  STUDENT_WORK: "Student Work",
  TRAINING: "Training",
};
const CATEGORIES = Object.keys(CATEGORY_LABELS);

interface GalleryImageRow {
  id: string;
  url: string;
  category: string;
  altText: string | null;
  isFeatured: boolean;
  isPublished: boolean;
}

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

export default function GalleryManager({ images }: { images: GalleryImageRow[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [altText, setAltText] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const fileDataUri = await readFileAsDataUri(file);
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileDataUri,
          fileType: file.type,
          fileSize: file.size,
          category,
          altText: altText || undefined,
          isFeatured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setFile(null);
      setAltText("");
      setIsFeatured(false);
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function toggle(id: string, patch: Partial<Pick<GalleryImageRow, "isFeatured" | "isPublished">>) {
    await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this image? This removes it from Cloudinary too.")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not delete this image.");
      return;
    }
    router.refresh();
  }

  const visible = filterCategory === "ALL" ? images : images.filter((i) => i.category === filterCategory);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleUpload}
        className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-1">
          <label className="mb-2 block text-sm font-medium text-white/80">Image</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-white/70"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-brand-black">
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Alt text <span className="text-white/40">(optional)</span>
          </label>
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div className="flex flex-col justify-between">
          <label className="mb-2 flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Feature this image
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {error && (
          <p className="sm:col-span-2 lg:col-span-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </form>

      <div className="flex items-center gap-3">
        <span className="text-sm text-white/50">Filter:</span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-brand-blue-light"
        >
          <option value="ALL" className="bg-brand-black">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-brand-black">
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-white/50">No images in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? ""} className="h-36 w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="text-xs text-white/50">{CATEGORY_LABELS[img.category]}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggle(img.id, { isFeatured: !img.isFeatured })}
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      img.isFeatured ? "bg-brand-blue-light text-white" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {img.isFeatured ? "Featured" : "Feature"}
                  </button>
                  <button
                    onClick={() => toggle(img.id, { isPublished: !img.isPublished })}
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      img.isPublished ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {img.isPublished ? "Published" : "Hidden"}
                  </button>
                </div>
                <button
                  onClick={() => remove(img.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
