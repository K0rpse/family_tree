export type Gender = "male" | "female";

export type FamilyMember = {
  id: number;
  name: string;
  gender: Gender;
  img: string;
  pids?: number[];
  mid?: number;
  fid?: number;
};

export type FamilyConfig = {
  roots: number[];
  mode: "dark" | "light";
  template: string;
};
