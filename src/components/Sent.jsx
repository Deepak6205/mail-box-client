import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import "./Sent.css";

export default function Sent() {
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSent = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("Please login first!");
        navigate("/signin");
        return;
      }
      const cleanEmail = userEmail.replace(/\./g, "_");

      try {
        const res = await fetch(
          `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/sent.json`
        );
        const data = res.ok ? await res.json() : null;
        if (!data) {
          setSentEmails([]);
          return;
        }
        const list = Array.isArray(data)
          ? data.map((v, i) => ({ id: v?.id ?? i, read: v?.read ?? true, ...(v || {}) }))
          : Object.entries(data).map(([k, v]) => ({ id: k, read: v?.read ?? true, ...v }));
        list.sort((a, b) => (b.timestamp ? new Date(b.timestamp).getTime() : 0) - (a.timestamp ? new Date(a.timestamp).getTime() : 0));
        setSentEmails(list);
      } catch (err) {
        console.error("Error loading sent:", err);
        setSentEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSent();
  }, [navigate]);

  const openMail = (mail) => {
    setSelectedMail(mail);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedMail(null);
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
                      <div className="small">
                        {mail.timestamp ? new Date(mail.timestamp).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mail-snippet text-muted mt-2"
                    dangerouslySetInnerHTML={{ __html: (mail.message ? mail.message.slice(0, 140) : "") + (mail.message && mail.message.length > 140 ? "..." : "") }}
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
          <div className="mb-3 text-muted small">
            {selectedMail?.timestamp ? new Date(selectedMail.timestamp).toLocaleString() : ""}
          </div>
          <hr />
          <div className="mail-full" dangerouslySetInnerHTML={{ __html: selectedMail?.message || "<i>No content</i>" }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}