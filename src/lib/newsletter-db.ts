import { promises as fs } from "fs";
import path from "path";
import type { NewsletterSubscriber } from "@/data/newsletter";

const NEWSLETTER_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

export async function readNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const data = await fs.readFile(NEWSLETTER_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeNewsletterSubscribers(subscribers: NewsletterSubscriber[]): Promise<void> {
  const dir = path.dirname(NEWSLETTER_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(NEWSLETTER_PATH, JSON.stringify(subscribers, null, 2), "utf-8");
}

