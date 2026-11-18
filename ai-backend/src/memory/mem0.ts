import MemoryClient from "mem0ai";

let client: MemoryClient | undefined;

function getClient(): MemoryClient {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) throw new Error("MEM0_API_KEY is not configured");
  client ??= new MemoryClient({ apiKey });
  return client;
}

/**
 * Namespaced IDs prevent cross-app and cross-tenant memory collisions.
 * Use stable internal IDs, never email addresses or phone numbers.
 */
export function memoryScope(input: {
  app: "inviteora" | "hisaabpro";
  tenantId: string;
  subjectId: string;
}): string {
  const safe = [input.app, input.tenantId, input.subjectId]
    .map((part) => part.trim().replace(/[^a-zA-Z0-9_-]/g, "_"));
  if (safe.some((part) => !part || part.length > 100)) {
    throw new Error("Invalid memory scope");
  }
  return safe.join(":");
}

export async function addScopedMemory(
  scope: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  if (!scope || !messages.length) throw new Error("Memory scope and messages are required");
  return getClient().add(messages, { userId: scope });
}

export async function searchScopedMemory(scope: string, query: string) {
  if (!scope || !query.trim()) throw new Error("Memory scope and query are required");
  return getClient().search(query, { filters: { user_id: scope } });
}
