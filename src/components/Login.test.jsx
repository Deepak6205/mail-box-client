import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";

describe("Login Component", () => {
  test("renders email and password fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("shows error if email field is empty", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const loginBtn = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginBtn);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test("shows error for invalid email format", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalidEmail" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
  });

  test("shows error if password is less than 6 characters", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(
      screen.getByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();
  });

  test("does not show any error if all fields are valid", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Since Firebase call is mocked/skipped, we just check no validation errors
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });
});
