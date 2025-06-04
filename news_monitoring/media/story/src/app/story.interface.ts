export interface Company {
  id: number;
  name: string;
}

export interface Story {
  id?: number;
  title: string;
  url: string;
  body_text: string;
  published_date: string;
  tagged_companies_ids: number [];
  tagged_companies_details:Company[];
}
