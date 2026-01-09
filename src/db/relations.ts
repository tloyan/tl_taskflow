import { defineRelations } from "drizzle-orm";
import * as auth from "./schema/auth-schema";

export const relations = defineRelations(auth, (r) => ({
  user: {
    session: r.many.session(),
    account: r.many.account(),
  },
  session: {
    user: r.one.user({
      from: r.user.id,
      to: r.session.userId,
    }),
  },
  account: {
    user: r.one.user({
      from: r.user.id,
      to: r.account.userId,
    }),
  },
}));
