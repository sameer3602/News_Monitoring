export interface Company {
  id: number;
  name: string;
}

export interface Source {
  id: number;
  name: string;
  url: string;
  tagged_companies_ids: number [];
  tagged_companies_details: Company[];  // Now returns array of { id, name } objects
}

export interface PaginatedSourcesResponse {
  sources: Source[];         // Fixed to match actual API response key
  page_number: number;
  has_next: boolean;
  has_prev: boolean;
  total_pages: number;
}

export interface Story {
  id: number;
  title: string;
  url: string;
  published_date: string;
  body_text: string;
  source: Source | null;
  tagged_companies: Company[];
}
