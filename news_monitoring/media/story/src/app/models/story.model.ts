import { Source} from "./source.model";
import { Company } from "./company.model";

export interface Story {
  id: number;
  title: string;
  url: string;
  published_date: string;
  body_text: string;
  source: Source | null ;  // <-- use Source from source.model.ts
  tagged_companies:Company[]; // keep consistent too
}