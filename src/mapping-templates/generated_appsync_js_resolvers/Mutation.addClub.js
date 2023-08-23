// src/mapping-templates/Mutation.addClub.ts
import { util } from "@aws-appsync/utils";
function request(ctx) {
  return {
    operation: "Invoke",
    payload: ctx
  };
}
function response(ctx) {
  if (ctx.result.error) {
    util.error(ctx.result.error.message, ctx.result.error.type);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vTXV0YXRpb24uYWRkQ2x1Yi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFpQyxZQUFZO0FBSXRDLFNBQVMsUUFBUSxLQUFrRDtBQUN4RSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFFWCxTQUFTO0FBQUEsRUFDWDtBQUNGO0FBRU8sU0FBUyxTQUNkLEtBT0E7QUFDQSxNQUFJLElBQUksT0FBTyxPQUFPO0FBQ3BCLFNBQUssTUFBTSxJQUFJLE9BQU8sTUFBTSxTQUFTLElBQUksT0FBTyxNQUFNLElBQUk7QUFBQSxFQUM1RDtBQUVBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogW10KfQo=
