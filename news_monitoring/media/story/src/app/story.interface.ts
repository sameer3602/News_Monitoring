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
  tagged_companies: (Company | number)[];
  tagged_companies_details: Company[];
}
