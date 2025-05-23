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