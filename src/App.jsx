import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ComposeMail from "./components/ComposeMail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/mailbox" element={<ComposeMail />} /> 
      </Routes>
    </Router>
  );
}

export default App;
