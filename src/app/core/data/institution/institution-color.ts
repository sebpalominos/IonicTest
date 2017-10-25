export type InstitutionColorType = {
  slug: string;
  foregroundColor?: string;
  backgroundColor?: string;
};

export const INSTITUTION_COLORS: InstitutionColorType[] = [
  { slug: 'westpac', foregroundColor: 'white', backgroundColor: '#D5002B' },
  { slug: 'stgeorge', foregroundColor: '#004833', backgroundColor: '#78BE20' },
  { slug: 'bom', foregroundColor: '#F7F8F9', backgroundColor: '#1F252C' },
  { slug: 'bom', foregroundColor: '#F7F8F9', backgroundColor: '#1F252C' },
  { slug: 'banksa', foregroundColor: '#F8F8F8', backgroundColor: '#002F6C' },
  { slug: 'cba', foregroundColor: 'black', backgroundColor: '#FFCC00' },
];