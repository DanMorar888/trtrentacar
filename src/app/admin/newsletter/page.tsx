"use client";

import { useEffect, useState } from "react";
import type { NewsletterSubscriber } from "@/data/newsletter";
import { AdminCard, AdminCardRow } from "../AdminMobileList";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((res) => {
        if (!res.ok) throw new Error("Neautorizat");
        return res.json();
      })
      .then((data) => setSubscribers(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function exportSubscribersCsv() {
    if (subscribers.length === 0) return;

    const csvEscape = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = ["Email", "Data inscrierii (ISO)", "Data inscrierii (ro-RO)"];
    const rows = subscribers.map((s) => [
      s.email,
      s.subscribedAt,
      new Date(s.subscribedAt).toLocaleString("ro-RO"),
    ]);

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `newsletter-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-gray-400">Se încarcă…</p>;
  if (error) return <p className="text-red-400">{error}. Verifică autentificarea.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsletter</h1>
          <p className="mt-2 text-gray-300">
            Adrese înscrise: <span className="font-semibold text-white">{subscribers.length}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={exportSubscribersCsv}
          disabled={subscribers.length === 0}
          className="min-h-11 rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-300 hover:bg-green-900/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {subscribers.length === 0 ? (
          <p className="rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-8 text-center text-gray-400">
            Nu există încă abonări la newsletter.
          </p>
        ) : (
          subscribers.map((s) => (
            <AdminCard key={`${s.email}-${s.subscribedAt}`}>
              <dl>
                <AdminCardRow label="Email">
                  <span className="break-all">{s.email}</span>
                </AdminCardRow>
                <AdminCardRow label="Data înscrierii">
                  {new Date(s.subscribedAt).toLocaleString("ro-RO")}
                </AdminCardRow>
              </dl>
            </AdminCard>
          ))
        )}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-xl border border-gray-600 bg-gray-800/50 shadow md:block">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Data înscrierii</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-400">
                  Nu există încă abonări la newsletter.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={`${s.email}-${s.subscribedAt}`} className="hover:bg-gray-800/80">
                  <td className="px-4 py-3 text-sm text-gray-100">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(s.subscribedAt).toLocaleString("ro-RO")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

