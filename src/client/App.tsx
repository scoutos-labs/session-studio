import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionList } from "./pages/session-list";
import { SessionDetail } from "./pages/session-detail";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
