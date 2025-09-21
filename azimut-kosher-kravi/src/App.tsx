import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";

// TODO: import your Pages here

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <div>Home Page</div> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
