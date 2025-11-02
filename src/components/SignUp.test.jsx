import { render, screen, fireEvent } from "@testing-library/react";
import SignUp from "./SignUp";


jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("../configure/firebase", () => ({
  auth: {},
}));

describe("SignUp Component", () => {
  
  test("renders all form fields", () => {
    render(<SignUp />);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  
  test("shows error for invalid email", () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
  });

  
  test("shows error if password is too short", () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  
  test("shows error when passwords do not match", () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  
  test("shows error if terms checkbox is not checked", () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument();
  });
});
