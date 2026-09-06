import type { DistrictId } from '../../../types';

export const districts: {
  id: DistrictId;
  name: string;
  subtitle: string;
  color: string;
  tag: string;
}[] = [
  {
    id: 'school',
    name: 'School Street',
    subtitle: 'Small actions. Stronger friendships.',
    color: '#ecae58',
    tag: 'LOOK OUT FOR EACH OTHER',
  },
  {
    id: 'retail',
    name: 'Retail District',
    subtitle: 'Think twice. Shop wise.',
    color: '#ec8c76',
    tag: 'SPOT THE WARNING SIGNS',
  },
  {
    id: 'digital',
    name: 'Digi-District',
    subtitle: 'Your next click matters.',
    color: '#959ce0',
    tag: 'STAY SHARP ONLINE',
  },
];
