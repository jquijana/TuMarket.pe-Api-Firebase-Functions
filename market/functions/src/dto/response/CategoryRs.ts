export default class CategoryRs {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  item?: ItemRs;
}

export class ItemRs {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}