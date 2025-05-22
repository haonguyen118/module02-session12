import { createBrowserRouter } from "react-router-dom";
import React, { Suspense } from "react";
import { Spin } from "antd";

const LibraryManager = React.lazy(() => import("../pages/library-manager"));

const routers = createBrowserRouter([
  {
    path: "/library-manager",
    element: (
      <Suspense fallback={<Spin size="large" />}>
        <LibraryManager />
      </Suspense>
    ),
  },
]);

export default routers;
