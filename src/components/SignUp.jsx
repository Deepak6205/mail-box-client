import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../configure/firebase";
import "../style/SignUp.css";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const err = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Valid email required";
    if (form.password.length < 6) err.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) err.confirm = "Passwords do not match";
    if (!form.agree) err.agree = "You must agree to the terms";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setFirebaseError("");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      console.log("User has successfully signed up:", userCredential.user);
      alert("Sign up successful!");
    } catch (error) {
      console.error("Signup Error:", error.message);
      setFirebaseError(error.message);
    }
  };

  return (
    <Container fluid className="signup-page">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={10} lg={8}>
          <Card className="signup-card shadow-sm overflow-hidden">
            <Row className="g-0">
              
              <Col md={5} className="signup-side">
                <div className="side-content">
                  <h2>Welcome</h2>
                  <p>Create your account to get started with MailBox.</p>
                  <div className="side-illustration" aria-hidden />
                </div>
              </Col>

              
              <Col md={7} className="p-4">
                <h3 className="mb-3">Create account</h3>

                <Form noValidate onSubmit={onSubmit}>
                  
                  {firebaseError && (
                    <div className="text-danger mb-3">{firebaseError}</div>
                  )}

                  
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="you@example.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Create password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  
                  <Form.Group className="mb-3" controlId="confirm">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      name="confirm"
                      type="password"
                      value={form.confirm}
                      onChange={handleChange}
                      isInvalid={!!errors.confirm}
                      placeholder="Confirm password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirm}
                    </Form.Control.Feedback>
                  </Form.Group>

                  
                  <Form.Group className="mb-3" controlId="agree">
                    <InputGroup>
                      <Form.Check
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                        type="checkbox"
                        label="I agree to the Terms and Privacy"
                        isInvalid={!!errors.agree}
                      />
                    </InputGroup>
                    <div className="text-danger small mt-1">{errors.agree}</div>
                  </Form.Group>

                  
                  <div className="d-grid">
                    <Button type="submit" variant="primary" size="lg">
                      Create account
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Already have an account?{" "}
                      <Link to="/signin" className="text-link">
                        Sign in
                      </Link>
                    </small>
                  </div>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
