import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
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
      console.log("Fetching inbox for:", cleanEmail);

      try {
        let res = await fetch(
          `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/inbox.json`
        );
        let data = await res.json();

        if (!data) {
          res = await fetch(
            `https://mail-box-client-59016-default-rtdb.firebaseio.com/mails/${cleanEmail}/sent.json`
          );
          data = await res.json();
        }

        if (!data) {
          setEmails([]);
        } else {
          const loaded = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setEmails(loaded.reverse());
        }
      } catch (error) {
        console.error("Error fetching mails:", error);
      }
      setLoading(false);
    };

    fetchMails();
  }, [navigate]);

  return (
    <div className="d-flex" style={{ height: "100vh", background: "#f8f9fa" }}>
     
      <div className="bg-white border-end p-3" style={{ width: "250px" }}>
        <button
          className="btn btn-primary w-100 mb-3"
          onClick={() => navigate("/compose")}
        >
          + Compose
        </button>
        <ul className="list-group">
          <li className="list-group-item active">📥 Inbox</li>
          <li className="list-group-item">📤 Sent</li>
          <li className="list-group-item">⭐ Starred</li>
          <li className="list-group-item">🗑 Trash</li>
          <li
            className="list-group-item text-danger"
            style={{ cursor: "pointer" }}
            onClick={() => {
              localStorage.clear();
              navigate("/signin");
            }}
          >
            🚪 Logout
          </li>
        </ul>
      </div>

   
      <div className="flex-grow-1 p-3">
        <h4 className="fw-bold">Inbox</h4>
        <hr />

        {loading ? (
          <p className="text-muted">Loading mails...</p>
        ) : emails.length === 0 ? (
          <p className="text-muted">No mails yet.</p>
        ) : (
          <div className="list-group">
            {emails.map((mail) => (
              <div
                key={mail.id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                style={{
                  borderRadius: "8px",
                  marginBottom: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                }}
              >
                
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{mail.subject}</div>
                  <small className="text-primary">From: {mail.from}</small>
                  <br />
                  <small>To: {mail.to}</small>
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "14px" }}
                    dangerouslySetInnerHTML={{
                      __html: mail.message?.slice(0, 80) + "...",
                    }}
                  ></p>
                </div>

                
                <small className="text-muted" style={{ fontSize: "12px" }}>
                  {new Date(mail.timestamp).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
