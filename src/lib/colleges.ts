export interface CollegeInfo {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  type: string;
}

export const COLLEGES: CollegeInfo[] = [
  {
    id: 'psit_kanpur',
    name: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
    shortName: 'PSIT Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'Engineering & Tech',
  },
  {
    id: 'iit_kanpur',
    name: 'Indian Institute of Technology (IIT), Kanpur',
    shortName: 'IIT Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'Institute of National Importance',
  },
  {
    id: 'hbtu_kanpur',
    name: 'Harcourt Butler Technical University (HBTU), Kanpur',
    shortName: 'HBTU Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'State Technical University',
  },
  {
    id: 'dtu_delhi',
    name: 'Delhi Technological University (DTU), Delhi',
    shortName: 'DTU Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'State University',
  },
  {
    id: 'nit_delhi',
    name: 'National Institute of Technology (NIT), Delhi',
    shortName: 'NIT Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'NIT',
  },
  {
    id: 'vit_vellore',
    name: 'Vellore Institute of Technology (VIT), Vellore',
    shortName: 'VIT Vellore',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: 'Deemed University',
  },
  {
    id: 'bits_pilani',
    name: 'Birla Institute of Technology and Science (BITS), Pilani',
    shortName: 'BITS Pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    type: 'Deemed University',
  },
  {
    id: 'nit_trichy',
    name: 'National Institute of Technology (NIT), Trichy',
    shortName: 'NIT Trichy',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    type: 'NIT',
  },
  {
    id: 'iit_bombay',
    name: 'Indian Institute of Technology (IIT), Bombay',
    shortName: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'IIT',
  },
  {
    id: 'iit_delhi',
    name: 'Indian Institute of Technology (IIT), Delhi',
    shortName: 'IIT Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'IIT',
  },
];

export const getCollegeShortName = (fullName?: string): string => {
  if (!fullName) return 'CampusConnect';
  const found = COLLEGES.find((c) => c.name === fullName || fullName.includes(c.shortName));
  if (found) return found.shortName;
  // If custom college name, abbreviate or slice
  if (fullName.length > 22) {
    return fullName.slice(0, 20) + '...';
  }
  return fullName;
};
