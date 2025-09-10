import { getApiConfig } from '@/config/api'
import { createCrudMethods } from './baseService'

export interface User {
  username: string;
  nomecompleto: string;
  codgruppo: string;
  codaccesso: string;
  iD_LINGUA: number;
  iD_INTER: number
}

export interface GruppiUtenti
{
  codice: string,
  descrizione: string
}

class UserService {
  private config = getApiConfig()
  private crud = createCrudMethods<User>({
    list: this.config.endpoints.users,
    create: this.config.endpoints.users,
    update: this.config.endpoints.users,
    delete: this.config.endpoints.deleteUser
  })

  private gruppiCrud = createCrudMethods<GruppiUtenti>({
    list: this.config.endpoints.gruppiUtente
  })

  async getUsers(): Promise<User[]> {
    return this.crud.getAll()
  }

  async newUser(user: User): Promise<User> {
    return this.crud.create(user)
  }

  async editUser(user: User): Promise<User> {
    return this.crud.update(user)
  }

  async deleteUser(username: string): Promise<boolean> {
    return this.crud.delete(username)
  }

  async getGruppiUtente(): Promise<GruppiUtenti[]> {
    return this.gruppiCrud.getAll()
  }
}

export const userService = new UserService()
