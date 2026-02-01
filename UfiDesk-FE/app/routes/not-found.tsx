// routes/not-found.tsx
export function loader() {
  throw new Response("Not Found", { status: 404 });
}

export default function NotFound() {
  return null; // Your ErrorBoundary in root.tsx will handle the display
}
