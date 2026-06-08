export interface IFixtureBullet {
  text: string;
}

export interface IFixtureExperience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: IFixtureBullet[];
}

export interface IFixtureEducation {
  institution: string;
  degree: string;
  field: string;
  endDate: string;
}

export interface IFixtureSkillGroup {
  group: string;
  items: string[];
}

export interface IFixtureContactProfile {
  label: string;
  url: string;
}

export interface IFixtureContact {
  email: string;
  phone: string;
  location: string;
  profiles: IFixtureContactProfile[];
}

export interface IFixtureResume {
  name: string;
  label: string;
  contact: IFixtureContact;
  summary: string;
  experience: IFixtureExperience[];
  education: IFixtureEducation[];
  skills: IFixtureSkillGroup[];
}
