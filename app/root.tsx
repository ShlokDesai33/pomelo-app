import stylesheet from "~/tailwind.css";
import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Logo from "./logo";
import { User } from "lucide-react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 h-full flex flex-col">
        <header className="w-full shadow bg-white">
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-4 py-6">
            <nav className="flex items-center gap-x-8">
              <Link to="/" className="border-r border-gray-300 pr-8">
                <Logo />
              </Link>
              
              <Link
                to="/create-event"
                className="text-sm font-medium mt-1 text-gray-600"
              >
                Create Event
              </Link>
            </nav>

            <span className="inline-flex items-center gap-x-2 text-sm font-medium text-gray-600">
              <User className="h-5 w-5 text-gray-600" />
              My Account
            </span>
          </div>
        </header>
        <main className="px-4 max-w-7xl w-full mx-auto mt-8">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
