import { getTeam, SPECIAL_TEAM_CARDS } from "@/lib/teams";

/** Display color for a post/comment author based on their team id. */
export function authorColor(teamId: string): string {
  const team = getTeam(teamId);
  if (team) return team.baseColor;
  const special = SPECIAL_TEAM_CARDS.find((c) => c.id === teamId);
  return special ? "#ffb800" : "#ffffff";
}
