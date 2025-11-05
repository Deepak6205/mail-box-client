import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Inbox from "./components/Inbox"; // ✅ Use Inbox instead of ComposeMail
import ComposeMail from "./components/ComposeMail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sent from "./components/Sent";

function App() {
  return (
    <>
    
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signin" element={<Login />} />
<Route path="/sent" element={<Sent />} />
        <Route path="/mailbox" element={<Inbox />} />
        <Route path="/compose" element={<ComposeMail />} />
      </Routes>
    </Router>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
