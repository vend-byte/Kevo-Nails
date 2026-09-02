"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  isActive: boolean;
}
interface Announcement {
  id: string;
  message: string;
  link: string | null;
  isActive: boolean;
}
interface Promotion {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  discountText: string | null;
  isActive: boolean;
}

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

const TABS = ["Banners", "Announcements", "Promotions"] as const;

export default function MarketingManager({
  banners,
  announcements,
  promotions,
}: {
  banners: Banner[];
  announcements: Announcement[];
  promotions: Promotion[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Banners");

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-brand-blue-light text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Banners" && <BannerSection banners={banners} />}
      {tab === "Announcements" && <AnnouncementSection announcements={announcements} />}
      {tab === "Promotions" && <PromotionSection promotions={promotions} />}
    </div>
  );
}

function ActiveToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-full px-2 py-0.5 text-xs ${
        active ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <button
      onClick={async () => {
        if (!confirm("Delete this?")) return;
        setDeleting(true);
        await onDelete();
        setDeleting(false);
      }}
      disabled={deleting}
      className="text-xs text-red-400 hover:underline disabled:opacity-50"
    >
      {deleting ? "…" : "Delete"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// BANNERS
// ---------------------------------------------------------------------------

function BannerSection({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fileDataUri = file ? await readFileAsDataUri(file) : undefined;
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          buttonText: buttonText || undefined,
          buttonLink: buttonLink || undefined,
          isActive: true,
          fileDataUri,
          fileType: file?.type,
          fileSize: file?.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setTitle("");
      setDescription("");
      setButtonText("");
      setButtonLink("");
      setFile(null);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2">
        <input
          required
          placeholder="Title (e.g. NEW INTAKE NOW OPEN)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light sm:col-span-2"
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light sm:col-span-2"
        />
        <input
          placeholder="Button text (optional)"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <input
          placeholder="Button link (optional, e.g. /apply)"
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-white/70 sm:col-span-2"
        />
        {error && (
          <p className="sm:col-span-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:col-span-2 sm:w-fit"
        >
          {submitting ? "Saving…" : "Add Banner"}
        </button>
      </form>

      <div className="space-y-3">
        {banners.length === 0 && <p className="text-white/50">No banners yet.</p>}
        {banners.map((b) => (
          <div key={b.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            {b.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.imageUrl} alt="" className="h-14 w-20 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{b.title}</p>
              {b.description && <p className="text-xs text-white/50">{b.description}</p>}
            </div>
            <ActiveToggle
              active={b.isActive}
              onToggle={async () => {
                await fetch(`/api/admin/banners/${b.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: !b.isActive }),
                });
                router.refresh();
              }}
            />
            <DeleteButton
              onDelete={async () => {
                await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
                router.refresh();
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ANNOUNCEMENTS
// ---------------------------------------------------------------------------

function AnnouncementSection({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, link: link || undefined, isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setMessage("");
      setLink("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-white/5 p-6">
        <input
          required
          placeholder="Announcement message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-w-[240px] flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <input
          placeholder="Link (optional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="min-w-[160px] rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Add"}
        </button>
        {error && <p className="w-full text-sm text-red-300">{error}</p>}
      </form>

      <div className="space-y-3">
        {announcements.length === 0 && <p className="text-white/50">No announcements yet.</p>}
        {announcements.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex-1 text-sm text-white">{a.message}</p>
            <ActiveToggle
              active={a.isActive}
              onToggle={async () => {
                await fetch(`/api/admin/announcements/${a.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: !a.isActive }),
                });
                router.refresh();
              }}
            />
            <DeleteButton
              onDelete={async () => {
                await fetch(`/api/admin/announcements/${a.id}`, { method: "DELETE" });
                router.refresh();
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROMOTIONS
// ---------------------------------------------------------------------------

function PromotionSection({ promotions }: { promotions: Promotion[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fileDataUri = file ? await readFileAsDataUri(file) : undefined;
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          discountText: discountText || undefined,
          isActive: true,
          fileDataUri,
          fileType: file?.type,
          fileSize: file?.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setTitle("");
      setDescription("");
      setDiscountText("");
      setFile(null);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2">
        <input
          required
          placeholder="Title (e.g. PEDICURE SPECIAL)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light sm:col-span-2"
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <input
          placeholder="Discount text (e.g. 20% off)"
          value={discountText}
          onChange={(e) => setDiscountText(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-white/70 sm:col-span-2"
        />
        {error && (
          <p className="sm:col-span-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:col-span-2 sm:w-fit"
        >
          {submitting ? "Saving…" : "Add Promotion"}
        </button>
      </form>

      <div className="space-y-3">
        {promotions.length === 0 && <p className="text-white/50">No promotions yet.</p>}
        {promotions.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-14 w-20 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{p.title}</p>
              {p.discountText && <p className="text-xs text-brand-blue-light">{p.discountText}</p>}
            </div>
            <ActiveToggle
              active={p.isActive}
              onToggle={async () => {
                await fetch(`/api/admin/promotions/${p.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: !p.isActive }),
                });
                router.refresh();
              }}
            />
            <DeleteButton
              onDelete={async () => {
                await fetch(`/api/admin/promotions/${p.id}`, { method: "DELETE" });
                router.refresh();
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
