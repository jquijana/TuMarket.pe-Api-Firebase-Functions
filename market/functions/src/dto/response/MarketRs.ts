import CategoryRs from './CategoryRs';

export class MarketRs {
  id?: string;
  category?: CategoryRs;
  name?: string;
  description?: string;
  images?: MarketImageRs[];
  ubigeo?: UbigeoRs;
  contact?: ContactRs;
  qualification?: QualificationRs;
  additionalData?: AdditionalData;
}

export class ContactRs {
  administrator?: string;
  cellphone?: string;
  email?: string;
  web?: string;
}

export class MarketImageRs {
  id?: string;
  isMain?: boolean;
  name?: string;
  url?: string;
}

export class QualificationRs {
  votes?: number;
  stars?: number;
  average?: number;
}

export class UbigeoRs {
  latitude?: number;
  longitude?: number;
  distance?: string;
  address?: string;
}


export class AdditionalData {
  information?: string;
  urlVideo?: string;
}
