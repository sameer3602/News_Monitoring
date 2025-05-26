import { Company } from "./company.model";


export interface Source {
  id: number;
  name: string;
  url: string;
  tagged_companies: Company[];
}
