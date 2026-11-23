"use client";

import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type TocItem = { id: string; label: string };

const LEAD = /^(\(\d+\)|[a-z]\))\s+/i;

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) return nodeText(node.props.children);
  return "";
}

function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "sectiune";
}

function flattenChildren(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      out.push(...flattenChildren((child.props as { children?: ReactNode }).children));
    } else {
      out.push(child);
    }
  });
  return out;
}

function enhance(children: ReactNode, compact = false) {
  const used = new Map<string, number>();
  const items: TocItem[] = [];
  let firstHeading = true;

  const nodes = flattenChildren(children).map((child, index) => {
    if (!isValidElement(child)) return child;

    if (child.type === "h2") {
      const label = nodeText(child.props.children).replace(/\s+/g, " ").trim();
      const base = slugify(label);
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      items.push({ id, label });
      const heading = cloneElement(child as ReactElement<{ id?: string; className?: string; key?: string }>, {
        key: child.key ?? id,
        id,
        className: compact
          ? [
              "scroll-mt-4 border-t border-gray-800 pt-5 text-lg font-semibold tracking-tight text-white",
              firstHeading ? "mt-0 border-t-0 pt-0" : "mt-7",
            ].join(" ")
          : [
              "scroll-mt-24 border-t border-gray-800 pt-8 text-xl font-semibold tracking-tight text-white",
              firstHeading ? "mt-2" : "mt-10",
            ].join(" "),
      });
      firstHeading = false;
      return heading;
    }

    if (child.type === "p" && typeof child.props.children === "string") {
      const match = child.props.children.match(LEAD);
      if (!match) return child;
      const lead = match[1];
      const rest = child.props.children.slice(match[0].length);
      const sub = /^[a-z]\)$/i.test(lead);
      return cloneElement(child as ReactElement<{ className?: string; key?: string }>, {
        key: child.key ?? `legal-${index}`,
        className: sub
          ? "ml-6 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 text-base leading-7 text-gray-300 sm:ml-10"
          : "grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 text-base leading-7 text-gray-300",
        children: (
          <>
            <span className="pt-0.5 text-sm font-semibold tabular-nums text-primary">{lead}</span>
            <span>{rest}</span>
          </>
        ),
      });
    }

    return isValidElement(child) ? cloneElement(child, { key: child.key ?? `legal-${index}` }) : child;
  });

  return { nodes, items };
}

function TocLinks({ items, active }: { items: TocItem[]; active: string }) {
  return (
    <ol className="mt-3 space-y-0.5">
      {items.map((item) => {
        const current = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current ? "true" : undefined}
              className={`block rounded-md px-2.5 py-1.5 text-sm leading-snug transition hover:bg-white/5 hover:text-white ${
                current ? "bg-primary/15 font-medium text-white" : "text-gray-400"
              }`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function LegalDocument({
  tocLabel,
  children,
  showToc = true,
  compact = false,
}: {
  tocLabel: string;
  children: ReactNode;
  showToc?: boolean;
  compact?: boolean;
}) {
  const { nodes, items } = enhance(children, compact);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const navId = useId();
  const articleRef = useRef<HTMLElement>(null);
  const signature = items.map((item) => item.id).join("|");

  useEffect(() => {
    if (!showToc) return;
    const root = articleRef.current;
    if (!root) return;
    const headings = [...root.querySelectorAll("h2")];
    if (!headings.length) return;

    const mark = () => {
      const offset = 120;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= 0) current = heading;
        else break;
      }
      if (current) setActive(current.id);
    };

    mark();
    window.addEventListener("scroll", mark, { passive: true });
    return () => window.removeEventListener("scroll", mark);
  }, [signature, showToc]);

  const article = (
    <article
      ref={articleRef}
      className="min-w-0 break-words space-y-4 text-base leading-7 text-gray-300 [&_li]:text-gray-300 [&_li]:marker:text-primary [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
    >
      {nodes}
    </article>
  );

  if (!showToc) return article;

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-14">
      <nav aria-labelledby={navId} className="mb-8 lg:sticky lg:top-20 lg:mb-0 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
        <p id={navId} className="hidden px-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 lg:block">
          {tocLabel}
        </p>
        <div className="hidden lg:block">
          <TocLinks items={items} active={active} />
        </div>
        <details className="rounded-xl border border-gray-800 bg-gray-900/50 lg:hidden">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
            {tocLabel}
          </summary>
          <div className="border-t border-gray-800 px-2 py-2">
            <TocLinks items={items} active={active} />
          </div>
        </details>
      </nav>

      {article}
    </div>
  );
}
