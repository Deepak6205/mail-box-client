import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "./Inbox.css";

export default function Inbox() {
  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMails = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("Please login first!");
        navigate("/signin");
        return;
      }

      const cleanEmail = userEmail.replace(/\./g, "_");

      try {
        const [resInbox, resSent] = await Promise.all([
          fetch(
            `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/inbox.json`
          ),
          fetch(
            `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/sent.json`
          ),
        ]);

        const inboxData = resInbox.ok ? await resInbox.json() : null;
        const sentData = resSent.ok ? await resSent.json() : null;

        const toList = (data) => {
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
        };

        const inboxList = toList(inboxData).sort((a, b) => {
          const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });

        const sentList = toList(sentData).sort((a, b) => {
          const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });

        setInboxEmails(inboxList);
        setSentEmails(sentList);
      } catch (error) {
        console.error("Error fetching mails:", error);
        setInboxEmails([]);
        setSentEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMails();
  }, [navigate]);

  const unreadCount = inboxEmails.filter((m) => !m.read).length;

  const openMail = async (mail) => {
    setSelectedMail(mail);
    setShowModal(true);

    if (!mail.read) {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;
      const cleanEmail = userEmail.replace(/\./g, "_");

      try {
        await fetch(
          `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/inbox/${mail.id}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          }
        );

        setInboxEmails((prev) => prev.map((m) => (m.id === mail.id ? { ...m, read: true } : m)));
        setSelectedMail((prev) => (prev ? { ...prev, read: true } : prev));
      } catch (err) {
        console.error("Failed to mark message read:", err);
        toast.error("Failed to mark message read.");
      }
    }
  };

  
  const deleteInboxMail = async (mailId) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      toast.error("Please login first.");
      return;
    }
    const cleanEmail = userEmail.replace(/\./g, "_");
    try {
      setDeletingId(mailId);
      const res = await fetch(
        `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/inbox/${mailId}.json`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setInboxEmails((prev) => prev.filter((m) => m.id !== mailId));
      
      if (selectedMail?.id === mailId) {
        setShowModal(false);
        setSelectedMail(null);
      }
      toast.success("Message deleted.");
    } catch (err) {
      console.error("Delete inbox error:", err);
      toast.error("Failed to delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMail(null);
  };

  return (
    <div className="inbox-container">
      <aside className="sidebar">
        <div className="brand">MailBox</div>
        <button className="btn compose-btn" onClick={() => navigate("/compose")}>
          + Compose
        </button>

        <nav className="nav-menu">
          <div className="nav-item" onClick={() => navigate("/mailbox")}>
            <span>📥 Inbox</span>
            <span className="badge unread-badge">{unreadCount}</span>
          </div>
          <div className="nav-item" onClick={() => navigate("/sent")}>
            <span>📤 Sent</span>
            <span className="muted-count">{sentEmails.length}</span>
          </div>
          <div className="nav-item muted">⭐ Starred</div>
          <div className="nav-item muted">🗑 Trash</div>
          <div
            className="nav-item logout text-danger"
            onClick={() => {
              localStorage.clear();
              navigate("/signin");
            }}
          >
            🚪 Logout
          </div>
        </nav>
      </aside>

      <main className="main-area">
        <header className="main-header">
          <h4>Inbox</h4>
          <div className="header-actions">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </header>

        <div className="mail-card">
          {loading ? (
            <div className="loading-state">
              <Spinner animation="border" role="status" />
              <div className="muted">Loading mail...</div>
            </div>
          ) : inboxEmails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No mails yet</div>
              <div className="muted">Compose a message to start a conversation.</div>
              <button className="btn btn-primary mt-3" onClick={() => navigate("/compose")}>
                + Compose
              </button>
            </div>
          ) : (
            <div className="mail-list">
              {inboxEmails.map((mail) => (
                <article
                  key={mail.id}
                  className={`mail-item ${mail.read ? "read" : "unread"}`}
                  onClick={() => openMail(mail)}
                >
                  <div className="mail-left">
                    <div className="avatar">{mail.from?.charAt(0)?.toUpperCase() || "U"}</div>
                    <div className="meta">
                      <div className="subject-row">
                        <div className="subject">{mail.subject || "(No subject)"}</div>
                        {!mail.read && <span className="unread-dot" aria-hidden />}
                      </div>
                      <div className="from-to">
                        <span className="from">From: <strong>{mail.from}</strong></span>
                        <span className="to">To: {mail.to}</span>
                      </div>
                      <div
                        className="snippet"
                        dangerouslySetInnerHTML={{ __html: (mail.message ? mail.message.slice(0, 120) : "") + (mail.message && mail.message.length > 120 ? "..." : "") }}
                      />
                    </div>
                  </div>

                  <div className="mail-right">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <time className="timestamp">{mail.timestamp ? new Date(mail.timestamp).toLocaleString() : ""}</time>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInboxMail(mail.id);
                        }}
                        disabled={deletingId === mail.id}
                        title="Delete"
                      >
                        {deletingId === mail.id ? <Spinner as="span" animation="border" size="sm" /> : "🗑"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{selectedMail?.subject || "(No subject)"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="message-meta muted small mb-2">
            <div><strong>From:</strong> {selectedMail?.from}</div>
            <div><strong>To:</strong> {selectedMail?.to}</div>
            <div>{selectedMail?.timestamp ? new Date(selectedMail.timestamp).toLocaleString() : ""}</div>
          </div>
          <hr />
          <div className="mail-full" dangerouslySetInnerHTML={{ __html: selectedMail?.message || "<em>No content</em>" }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!selectedMail) return;
              await deleteInboxMail(selectedMail.id);
            }}
            disabled={deletingId === selectedMail?.id}
          >
            {deletingId === selectedMail?.id ? <Spinner as="span" animation="border" size="sm" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
