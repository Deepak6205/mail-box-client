import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";

export default function ComposeMail() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendMailHandler = async () => {
    if (!to || !subject || !message) {
      toast.error("Please fill all fields before sending!");
      return;
    }

    const senderEmail = localStorage.getItem("userEmail");
    if (!senderEmail) {
      toast.error("No sender email found! Please log in again.");
      return;
    }

    setLoading(true);

    const cleanSenderEmail = senderEmail.replace(/\./g, "_");
    const cleanReceiverEmail = to.replace(/\./g, "_");

    const baseMailData = {
      from: senderEmail,
      to,
      subject,
      message,
      timestamp: new Date().toISOString(),
    };

    try {
      
      const mailDataForSender = { ...baseMailData, read: true };
      await fetch(
        `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanSenderEmail}/sent.json`,
        {
          method: "POST",
          body: JSON.stringify(mailDataForSender),
          headers: { "Content-Type": "application/json" },
        }
      );

      
      const mailDataForReceiver = { ...baseMailData, read: false };
      await fetch(
        `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanReceiverEmail}/inbox.json`,
        {
          method: "POST",
          body: JSON.stringify(mailDataForReceiver),
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("✅ Mail sent successfully!");

      setTo("");
      setSubject("");
      setMessage("");

      setTimeout(() => navigate("/mailbox"), 1000);
    } catch (error) {
      console.error("Error sending mail:", error);
      toast.error("❌ Failed to send mail. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2>📧 Compose Mail</h2>

      <div className="mb-3">
        <label className="form-label">To:</label>
        <input
          type="email"
          className="form-control"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="receiver@example.com"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Subject:</label>
        <input
          type="text"
          className="form-control"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Message:</label>
        <ReactQuill
          theme="snow"
          value={message}
          onChange={setMessage}
          placeholder="Write your mail here..."
          className="mb-3"
        />
      </div>

      <button
        onClick={sendMailHandler}
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Mail"}
      </button>
    </div>
  );
}
