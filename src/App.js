import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Simulator from "./pages/Simulator";
import ResourceTracker from "./pages/ResourceTracker.tsx";
import CardDrawSimulator from "./pages/CardSimulator.tsx";
import NoPage from "./pages/NoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Simulator />} />
          <Route path="/resourceTracker" element={<ResourceTracker />} />
          <Route path="/cardDrawSimulator" element={<CardDrawSimulator />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}