import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "./Sent.css";
import { useMailFolder } from "../hooks/useMailApi";

export default function Sent() {
  const navigate = useNavigate();
  const { mails: sentEmails, loading, deleteMail: deleteSentMail } = useMailFolder("sent");
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openMail = (mail) => {
    setSelectedMail(mail);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedMail(null);
  };

  const handleDelete = async (mailId) => {
    if (!window.confirm("Delete this sent message? This cannot be undone.")) return;
    try {
      setDeletingId(mailId);
      await deleteSentMail(mailId);
      toast.success("Sent message deleted.");
      if (selectedMail?.id === mailId) {
        setShowModal(false);
        setSelectedMail(null);
      }
    } catch (err) {
      console.error("Delete sent error:", err);
      toast.error("Failed to delete sent message.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="sent-container p-3">
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-outline-secondary me-3" onClick={() => navigate("/mailbox")}>
          ← Back
        </button>
        <h3 className="mb-0">📤 Sent</h3>
      </div>

      <div className="sent-card bg-white shadow-sm p-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <div className="text-muted mt-2">Loading sent mails...</div>
          </div>
        ) : sentEmails.length === 0 ? (
          <div className="empty-state text-center py-5">
            <div className="display-6">No sent mails yet</div>
            <div className="text-muted mt-2">Compose a new message to get started.</div>
            <div className="mt-3">
              <button className="btn btn-primary" onClick={() => navigate("/compose")}>
                + Compose
              </button>
            </div>
          </div>
        ) : (
          <div className="list-group">
            {sentEmails.map((mail) => (
              <div
                key={mail.id}
                role="button"
                onClick={() => openMail(mail)}
                className="list-group-item list-group-item-action mail-item d-flex justify-content-between align-items-start"
              >
                <div className="me-3 avatar-placeholder" aria-hidden>
                  {mail.to?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="mail-subject">{mail.subject || "(No subject)"}</div>
                      <div className="mail-to text-muted">To: {mail.to}</div>
                    </div>
                    <div className="mail-meta text-muted text-end">
                      <div className="small">{mail.timestamp ? new Date(mail.timestamp).toLocaleString() : ""}</div>
                      <div style={{ marginTop: 6 }}>
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
                  </div>

                  <div
                    className="mail-snippet text-muted mt-2"
                    dangerouslySetInnerHTML={{
                      __html:
                        (mail.message ? mail.message.slice(0, 140) : "") +
                        (mail.message && mail.message.length > 140 ? "..." : ""),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{selectedMail?.subject || "(No subject)"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2 text-muted small">
            <strong>From:</strong> {selectedMail?.from} &nbsp;•&nbsp; <strong>To:</strong> {selectedMail?.to}
          </div>
          <div className="mb-3 text-muted small">{selectedMail?.timestamp ? new Date(selectedMail.timestamp).toLocaleString() : ""}</div>
          <hr />
          <div className="mail-full" dangerouslySetInnerHTML={{ __html: selectedMail?.message || "<i>No content</i>" }} />
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