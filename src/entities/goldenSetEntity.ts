import { Prisma } from "../prisma/build/generated/prisma/client.ts";
import type { GoldenSet, MutationInitializeGoldenSetArgs, QueryGetGoldenSetByIdArgs, QueryGetGoldenSetsArgs } from "../graphql/generated/resolvers-types.ts";

export interface GoldenSetGraphQL {
  GetGoldenSetById: {
    input: QueryGetGoldenSetByIdArgs;
    output: GoldenSet;
  };
  GetGoldenSets: {
    input: QueryGetGoldenSetsArgs;
    output: Array<GoldenSet | undefined | null>;
  };
  InitializeGoldenSet: {
    input: MutationInitializeGoldenSetArgs;
    output: GoldenSet;
  }
  
}

export interface GoldenSetPrisma {
  GoldenSetInbound: Prisma.goldenSetCreateInput;
  GoldenSetOutbound: Prisma.goldenSetModel;
}