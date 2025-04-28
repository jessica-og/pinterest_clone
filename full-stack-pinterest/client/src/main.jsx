import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./routes/layouts/mainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  IconError,
  IconInfo,
  IconSuccess,
  IconWarning,
} from "./components/Notification";
import { ToastContainer } from "react-toastify";
import  ProtectedRoute  from "./components/ProtectedRoute";

const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
const CreatePage = React.lazy(() => import("./routes/createPage/createPage"));
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(() =>
  import("./routes/profilePage/profilePage")
);
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          icon={({ type }) => {
            if (type === "success") return <IconSuccess />;
            if (type === "error") return <IconError />;
            if (type === "warning") return <IconWarning />;
            if (type === "info") return <IconInfo />;
            else return null;
          }}
          style={{ zIndex: 9999 }}
        />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              }
            />
            <Route path="/pin/:id" element={<PostPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
