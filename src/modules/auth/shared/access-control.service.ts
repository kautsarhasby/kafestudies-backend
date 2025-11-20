import { Injectable } from '@nestjs/common';
import { Role } from 'src/modules/users/enum/role.enum';

interface isAuthorizedParams {
  currentRole: string;
  requiredRole: string;
}

@Injectable()
export class AccessControlService {
  private hierarchies: Array<Map<string, number>> = [];
  private priority: number = 1;
  constructor() {
    this.buildRoles([Role.GUEST, Role.USER, Role.ADMINISTRATOR]);
  }

  private buildRoles(roles: Role[]) {
    const hierarchy: Map<string, number> = new Map();
    roles.forEach((role) => {
      hierarchy.set(role, this.priority++);
      this.priority++;
    });
    this.hierarchies.push(hierarchy);
  }

  public isAuthorized({ currentRole, requiredRole }: isAuthorizedParams) {
    for (const hierarchy of this.hierarchies) {
      const priority = hierarchy.get(currentRole);
      const requiredPriority = hierarchy.get(requiredRole);
      if (priority && requiredPriority && priority >= requiredPriority) {
        return true;
      }
    }
    return false;
  }
}
