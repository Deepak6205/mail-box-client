import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Inbox from "./Inbox";

const mockEmails = {
  mail1: {
    from: "test1@gmail.com",
    to: "user@gmail.com",
    subject: "Hello",
    message: "This is a test mail.",
    timestamp: "2025-11-04T10:00:00Z",
  },
};

beforeEach(() => {
  
  localStorage.setItem("userEmail", "user@gmail.com");

  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockEmails),
    })
  );
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

function renderInbox() {
  return render(
    <BrowserRouter>
      <Inbox />
    </BrowserRouter>
  );
}

test("1. Inbox page renders properly", () => {
  renderInbox();
  expect(screen.getByText(/Inbox/i)).toBeInTheDocument();
});

test("2. Shows loading text while fetching mails", () => {
  renderInbox();
  expect(screen.getByText(/Loading mails/i)).toBeInTheDocument();
});

test("3. Displays mails after loading completes", async () => {
  renderInbox();
  await waitFor(() => {
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });
});

test("4. Shows 'No mails yet' when inbox is empty", async () => {
  
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve({ json: () => Promise.resolve(null) })
  );

  renderInbox();
  await waitFor(() => {
    expect(screen.getByText(/No mails yet/i)).toBeInTheDocument();
  });
});

test("5. Redirects to login if no userEmail in localStorage", () => {
  localStorage.clear(); 
  renderInbox();
  expect(screen.queryByText(/Inbox/i)).not.toBeInTheDocument();
});
