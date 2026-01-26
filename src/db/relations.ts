import { defineRelations } from "drizzle-orm";
import * as auth from "./schema/auth-schema";
import * as workspaces from "./schema/workspaces";

export const relations = defineRelations({ ...auth, ...workspaces }, (r) => ({
  user: {
    session: r.many.session(),
    account: r.many.account(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  workspace: {
    owner: r.one.user({
      from: r.workspaces.ownerId,
      to: r.user.id,
    }),
  },
}));
