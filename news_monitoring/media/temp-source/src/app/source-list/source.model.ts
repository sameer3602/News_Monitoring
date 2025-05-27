export interface Company {
  id: number;
  name: string;
}

export interface Source {
  id: number;
  name: string;
  url: string;
  tagged_companies: Company[];  // array of company objects
}

export interface Story {
  id: number;
  title: string;
  url: string;
  published_date: string;
  body_text: string;
  source: Source | null;  // <-- use Source from source.model.ts
  tagged_companies:Company[]; // keep consistent too
}