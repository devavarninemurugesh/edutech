export type SkillMap = Record<string, number>
export type Profile = { name:string; education:string; experience:string; target_role:string; goal:string; hours_per_week:number; skills:SkillMap }
export type RoadmapNode = { id:string; title:string; skill:string; status:string; score:number; required_score:number; topics:string[]; estimated_hours:number; prerequisites:string[] }
export type Gap = { skill:string; current_score:number; required_score:number; gap:number; priority:string }
export type WeeklyTask = { id:string; title:string; type:string; minutes:number; status:string }
