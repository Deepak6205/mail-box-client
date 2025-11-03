import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
function App() {
  return (
    <Router>
      <Routes>
                
        <Route path="/" element={<SignUp />} /> 
        <Route path="/signin" element={<Login />} />  
      </Routes>
    </Router>
  );
}

export default App;
