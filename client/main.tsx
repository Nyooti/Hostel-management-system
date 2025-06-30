import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Students from "./pages/Students";
import StudentRegistration from "./pages/StudentRegistration";
import RoomManagement from "./pages/RoomManagement";
import Hostels from "./pages/Hostels";
import Visitors from "./pages/Visitors";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/register" element={<StudentRegistration />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/hostels" element={<Hostels />} />
          {/* Placeholder routes for other modules */}
          <Route path="/bookings" element={<NotFound />} />
          <Route path="/payments" element={<NotFound />} />
          <Route path="/mess" element={<NotFound />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/reports" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
