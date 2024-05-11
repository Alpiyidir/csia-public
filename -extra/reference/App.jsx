import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Navigation,
} from "./components";

ReactDOM.render(
  <Router>
    <Navigation />
    <Routes>
    </Routes>
  </Router>,

  document.getElementById("root")
);