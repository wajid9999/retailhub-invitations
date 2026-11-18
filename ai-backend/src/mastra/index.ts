import { Mastra } from "@mastra/core";
import { inviteoraAgent } from "./agents/inviteora-agent.ts";
import { hisaabproAgent } from "./agents/hisaabpro-agent.ts";

export const mastra = new Mastra({
  agents: {
    inviteoraAgent,
    hisaabproAgent,
  },
});
