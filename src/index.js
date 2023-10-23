import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Layout from "./Layout";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Layout />
  </StrictMode>
);
