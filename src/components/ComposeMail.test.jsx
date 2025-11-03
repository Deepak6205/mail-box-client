
import { render, screen, fireEvent } from "@testing-library/react";
import ComposeMail from "./ComposeMail";

test("renders ComposeMail component", () => {
  render(<ComposeMail />);
  const heading = screen.getByText(/compose mail/i);
  expect(heading).toBeInTheDocument();
});

test("has input for receiver email", () => {
  render(<ComposeMail />);
  const emailInput = screen.getByPlaceholderText(/receiver email/i);
  expect(emailInput).toBeInTheDocument();
});

test("has textarea for message", () => {
  render(<ComposeMail />);
  const messageBox = screen.getByPlaceholderText(/write your message/i);
  expect(messageBox).toBeInTheDocument();
});

test("button should be present", () => {
  render(<ComposeMail />);
  const sendButton = screen.getByText(/send/i);
  expect(sendButton).toBeInTheDocument();
});

test("should type email and message", () => {
  render(<ComposeMail />);
  const emailInput = screen.getByPlaceholderText(/receiver email/i);
  const messageBox = screen.getByPlaceholderText(/write your message/i);

  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(messageBox, { target: { value: "Hello!" } });

  expect(emailInput.value).toBe("test@example.com");
  expect(messageBox.value).toBe("Hello!");
});
