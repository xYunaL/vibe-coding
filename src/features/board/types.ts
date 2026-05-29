export type BoardScope = "global" | "team";

export type Comment = {
  id: string;
  authorNickname: string;
  authorTeamId: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
};

export type Post = {
  id: string;
  scope: BoardScope;
  /** Present when scope === "team". */
  teamId?: string;
  title: string;
  body: string;
  authorNickname: string;
  authorTeamId: string;
  likes: number;
  createdAt: string;
  comments: Comment[];
};
