import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface User extends CrudEntity {
  username: string;
  nomecompleto: string;
  codgruppo: string;
  codaccesso: string;
  iD_LINGUA: number;
  iD_INTER: number
}

export interface GruppiUtenti extends CrudEntity {
  codice: string,
  descrizione: string
}

class UserService extends GenericCrudService<User> {
  protected config = getApiConfig()
  private gruppiService = new GenericCrudService<GruppiUtenti>({
    list: this.config.endpoints.gruppiUtente
  })

  constructor() {
    super({
      list: getApiConfig().endpoints.users,
      create: getApiConfig().endpoints.users,
      update: getApiConfig().endpoints.users,
      delete: getApiConfig().endpoints.deleteUser
    })
  }

  async getUsers(): Promise<User[]> {
    return this.getAll()
  }

  async newUser(user: User): Promise<User> {
    return this.create(user)
  }

  async editUser(user: User): Promise<User> {
    return this.update(user)
  }

  async deleteUser(username: string): Promise<boolean> {
    return this.delete(username)
  }

  async getGruppiUtente(): Promise<GruppiUtenti[]> {
    return this.gruppiService.getAll()
  }
}

export const userService = new UserService()
