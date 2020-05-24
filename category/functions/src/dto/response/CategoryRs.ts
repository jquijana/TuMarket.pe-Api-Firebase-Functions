export default class CategoryRs {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  items?: CategoryItemRs[]
}

export class CategoryItemRs {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
}