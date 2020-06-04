export default class CategoryRs {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  order?: number;
  items?: CategoryItemRs[]
}

export class CategoryItemRs {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  order?: number;
}