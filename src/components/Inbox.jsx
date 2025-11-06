import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "./Inbox.css";
import { useMailFolder } from "../hooks/useMailApi";

export default function Inbox() {
  const navigate = useNavigate();
  const { mails: inboxEmails, loading, unreadCount, deleteMail: deleteInboxMail, markRead } =
    useMailFolder("inbox");
  const { mails: sentEmails } = useMailFolder("sent"); 
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openMail = async (mail) => {
    setSelectedMail(mail);
    setShowModal(true);
    if (!mail.read) {
      try {
        await markRead(mail.id);
      } catch (err) {
        console.error("markRead error:", err);
        toast.error("Failed to mark message read.");
      }
    }
  };

  const handleDelete = async (mailId) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      setDeletingId(mailId);
      await deleteInboxMail(mailId);
      toast.success("Message deleted.");
      if (selectedMail?.id === mailId) {
        setShowModal(false);
        setSelectedMail(null);
      }
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
                        <span className="from">
                          From: <strong>{mail.from}</strong>
                        </span>
                        <span className="to">To: {mail.to}</span>
                      </div>
                      <div
                        className="snippet"
                        dangerouslySetInnerHTML={{
                          __html:
                            (mail.message ? mail.message.slice(0, 120) : "") +
                            (mail.message && mail.message.length > 120 ? "..." : ""),
                        }}
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
                          handleDelete(mail.id);
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
            <div>
              <strong>From:</strong> {selectedMail?.from}
            </div>
            <div>
              <strong>To:</strong> {selectedMail?.to}
            </div>
            <div>{selectedMail?.timestamp ? new Date(selectedMail.timestamp).toLocaleString() : ""}</div>
          </div>
          <hr />
          <div className="mail-full" dangerouslySetInnerHTML={{ __html: selectedMail?.message || "<em>No content</em>" }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!selectedMail) return;
              await handleDelete(selectedMail.id);
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
