import { useCallback, useEffect, useState } from "react";

function normalizeData(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map((val, idx) => ({ id: val?.id ?? idx, read: val?.read ?? false, ...(val || {}) }))
      .filter(Boolean);
  }
  if (typeof data === "object") {
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      read: value?.read ?? false,
      ...value,
    }));
  }
  return [];
}

const DB_BASE = "https://mail-box-client-59016-default-rtdb.firebaseio.com";

function getUser() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
}


export async function sendMail({ to, subject, message }) {
  const senderEmail = getUser();
  if (!senderEmail) throw new Error("No sender logged in");

  const cleanSender = senderEmail.replace(/\./g, "_");
  const cleanReceiver = to.replace(/\./g, "_");

  const baseMail = {
    from: senderEmail,
    to,
    subject,
    message,
    timestamp: new Date().toISOString(),
  };

  const mailForSender = { ...baseMail, read: true };
  const mailForReceiver = { ...baseMail, read: false };

  const senderUrl = `${DB_BASE}/mails/${cleanSender}/sent.json`;
  const receiverUrl = `${DB_BASE}/mails/${cleanReceiver}/inbox.json`;

  const [r1, r2] = await Promise.all([
    fetch(senderUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailForSender),
    }),
    fetch(receiverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailForReceiver),
    }),
  ]);

  if (!r1.ok || !r2.ok) {
    const errText1 = await r1.text().catch(() => "");
    const errText2 = await r2.text().catch(() => "");
    throw new Error(`Failed to send mail: ${errText1} ${errText2}`);
  }

  return true;
}


export function useMailFolder(folder) {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMails = useCallback(async () => {
    const userEmail = getUser();
    if (!userEmail) {
      setMails([]);
      setLoading(false);
      return;
    }
    const cleanEmail = userEmail.replace(/\./g, "_");
    setLoading(true);
    try {
      const res = await fetch(`${DB_BASE}/mails/${cleanEmail}/${folder}.json`);
      const data = res.ok ? await res.json() : null;
      const list = normalizeData(data).sort((a, b) => {
        const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });
      setMails(list);
    } catch (err) {
      console.error("useMailFolder fetch error:", err);
      setMails([]);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  const deleteMail = useCallback(
    async (id) => {
      const userEmail = getUser();
      if (!userEmail) throw new Error("No user");
      const cleanEmail = userEmail.replace(/\./g, "_");
      const url = `${DB_BASE}/mails/${cleanEmail}/${folder}/${id}.json`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMails((prev) => prev.filter((m) => m.id !== id));
      return true;
    },
    [folder]
  );

  const markRead = useCallback(
    async (id) => {
      const userEmail = getUser();
      if (!userEmail) throw new Error("No user");
      const cleanEmail = userEmail.replace(/\./g, "_");
      const url = `${DB_BASE}/mails/${cleanEmail}/${folder}/${id}.json`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error("Mark read failed");
      setMails((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
      return true;
    },
    [folder]
  );

  useEffect(() => {
    fetchMails();
  }, [fetchMails]);

  const unreadCount = mails.filter((m) => !m.read).length;

  return {
    mails,
    loading,
    unreadCount,
    refresh: fetchMails,
    deleteMail,
    markRead,
  };
}