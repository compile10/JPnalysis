import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  adminPanel: ["access"],
  invite: ["create"],
} as const;

export const ac = createAccessControl(statement);

/**
 * A subset of the statement above, naming the actions a route requires -
 * e.g. `{ invite: ["create"] }`. Unknown resources or actions fail to compile.
 */
export type Permissions = {
  [K in keyof typeof statement]?: (typeof statement)[K][number][];
};

export const adminRole = ac.newRole({
  ...adminAc.statements,
  adminPanel: ["access"],
  invite: ["create"],
});

export const userRole = ac.newRole({
  ...userAc.statements,
  adminPanel: [],
  invite: [],
});
