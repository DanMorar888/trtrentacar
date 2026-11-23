import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { ContactMessage } from "@/data/contact";

const CONTACT_PATH = path.join(process.cwd(), "data", "contact-messages.json");

export async function readContactMessages(): Promise<ContactMessage[]> {
  try {
    const data = await fs.readFile(CONTACT_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">
): Promise<ContactMessage> {
  const messages = await readContactMessages();
  const next: ContactMessage = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  const dir = path.dirname(CONTACT_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONTACT_PATH, JSON.stringify([...messages, next], null, 2), "utf-8");
  return next;
}
