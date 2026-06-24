import { redirect } from "next/navigation";

// The Events content now lives on the homepage's "Celebrations" section.
// Keep this route working for any old links by redirecting there.
export default function EventsPage() {
  redirect("/#celebrations");
}
