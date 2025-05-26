export interface Company {
  id: number;
  name: string;
  toLowerCase: () => string;  // or some string property
}