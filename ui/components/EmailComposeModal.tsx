import { useState } from "react";
import axios from "axios";
import { X, Send, Loader2 } from "lucide-react";

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionName: string;
  vendorEmail?: string;
}

const EmailComposeModal = ({
  isOpen,
  onClose,
  subscriptionName,
  vendorEmail,
}: EmailComposeModalProps) => {
  const [to, setTo] = useState(vendorEmail || "");
  const [subject, setSubject] = useState(`Subscription Cancellation Request - ${subscriptionName}`);
  const [body, setBody] = useState(
    `Dear ${subscriptionName} Support Team,\n\n` +
    `I am writing to request the cancellation of my subscription to ${subscriptionName}.\n\n` +
    `Please process this cancellation at your earliest convenience and confirm once it has been completed.\n\n` +
    `Thank you for your assistance.\n\n` +
    `Best regards`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setError("Please fill in all fields");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/email/send`,
        { to, subject, body },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset state
          setSuccess(false);
          setError(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error sending email:", err);
      setError(
        err.response?.data?.message || "Failed to send email. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="feature-card"
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "1rem",
          maxHeight: "90vh",
          overflow: "auto",
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", margin: 0 }}>
            Send Cancellation Email
          </h3>
          <button
            className="btn btn-outline"
            style={{ padding: "0.5rem", minWidth: "auto" }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          {success && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#dcfce7",
                border: "1px solid #86efac",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                color: "#166534",
              }}
            >
              Email sent successfully!
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* To */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                To
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            {/* Subject */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            {/* Body */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body"
                rows={12}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            padding: "1.5rem",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button className="btn btn-outline" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {sending ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default EmailComposeModal;