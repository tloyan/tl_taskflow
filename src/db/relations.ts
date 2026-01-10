import { defineRelations } from "drizzle-orm";
import * as auth from "./schema/auth-schema";

export const relations = defineRelations({ ...auth }, (r) => ({
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
}));
