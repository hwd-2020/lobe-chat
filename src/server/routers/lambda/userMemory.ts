import { CreateUserMemoryIdentitySchema, UpdateUserMemoryIdentitySchema } from '@lobechat/types';
import { z } from 'zod';

import { UserMemoryModel } from '@/database/models/userMemory';
import {
  UserMemoryContextModel,
  UserMemoryExperienceModel,
  UserMemoryIdentityModel,
  UserMemoryPreferenceModel,
} from '@/database/models/userMemory/index';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const userMemoryProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      contextModel: new UserMemoryContextModel(ctx.serverDB, ctx.userId),
      experienceModel: new UserMemoryExperienceModel(ctx.serverDB, ctx.userId),
      identityModel: new UserMemoryIdentityModel(ctx.serverDB, ctx.userId),
      preferenceModel: new UserMemoryPreferenceModel(ctx.serverDB, ctx.userId),
      userMemoryModel: new UserMemoryModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const userMemoryRouter = router({
  // ============ Identity CRUD ============
  createIdentity: userMemoryProcedure
    .input(CreateUserMemoryIdentitySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.addIdentityEntry({
        base: {},
        identity: {
          description: input.description,
          episodicDate: input.episodicDate,
          relationship: input.relationship,
          role: input.role,
          tags: input.extractedLabels,
          type: input.type,
        },
      });
    }),

  // ============ Context CRUD ============
  deleteContext: userMemoryProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.contextModel.delete(input.id);
    }),

  // ============ Experience CRUD ============
  deleteExperience: userMemoryProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.experienceModel.delete(input.id);
    }),

  deleteIdentity: userMemoryProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.removeIdentityEntry(input.id);
    }),

  // ============ Preference CRUD ============
  deletePreference: userMemoryProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.preferenceModel.delete(input.id);
    }),

  getContexts: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.searchContexts({});
  }),

  getExperiences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.searchExperiences({});
  }),

  getIdentities: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.getAllIdentities();
  }),

  // ============ Persona ============
  getPersona: userMemoryProcedure.query(async () => {
    return {
      content: `Arvin is a product-and-research hybrid founder who consistently turns hands-on engineering reality into measurable, programmatically verifiable evaluation artifacts—then publishes enough tooling and evidence for others to reproduce, audit, and improve the work.

## Core profile

**Builder with a design-engineering spine**

He operates with an interaction-design-engineer mindset: translating ambiguity into usable workflows, implementable interfaces, and ship-ready systems. His training and instincts emphasize usability, clarity, and end-to-end experience rather than purely theoretical "model talk."

**Empirical evaluator of agentic systems**

Arvin's defining trait is verification-driven rigor. He prefers realistic tasks with programmatic checks over vibes-based comparisons, and he pushes for artifacts (benchmarks, validation scripts, traces) that make claims testable and disagreements resolvable.

**Open-source organizer and maintainer**

He does not just release code; he runs an ecosystem. That includes repository operations, PR review norms, documentation expectations, attribution/branding enforcement, and public-facing communication that keeps collaboration scalable and the project coherent.

**Operator who handles edge-cases**

Arvin is willing to do the unglamorous work required for credibility: user support, compliance-style requests, takedowns, payment/refund workflows, and incident handling. The consistent pattern is ownership of the full lifecycle, not only the headline features.

## Working style
- **Instrumentation-minded:** if something cannot be measured, reproduced, or verified, it is not "done" yet.
- **Transparency as a strategy:** he publishes methodology and artifacts to invite scrutiny and community compounding.
- **High-agency pragmatism:** he would rather run the evaluation, pay the cost, and ship the evidence than debate hypotheticals.
- **Comfort across levels:** he moves fluidly from partnership/comms and governance decisions down to repo hygiene and implementation details.

## Values and motivations
- **Truth-seeking through construction:** learning comes from building systems and letting reality push back.
- **Community compounding:** work is designed so others can extend it—auditable, modular, PR-friendly.
- **Legibility and fairness:** clear rules, clear attribution, clear verification—reducing ambiguity that later becomes conflict.

## Strengths that stand out
- **Systems thinking across product → research → operations**
- **Credibility through receipts (reproducible artifacts and evidence)**
- **Pragmatic leadership with strong follow-through**

## Likely pressure points
- **Context-switching load:** founder + maintainer + operator + researcher can fragment attention and increase burnout risk.
- **Social debt from enforcement:** branding/attribution and takedown decisions are necessary but draining.
- **Rigor overhead:** a high verification bar is a competitive advantage, but it must be scoped to avoid slowing iteration unnecessarily.`,
      summary:
        'A product-and-research hybrid founder who turns hands-on engineering into verifiable artifacts, then publishes tooling for others to reproduce, audit, and improve.',
    };
  }),

  getPreferences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.searchPreferences({});
  }),

  updateContext: userMemoryProcedure
    .input(
      z.object({
        data: z.object({
          currentStatus: z.string().optional(),
          description: z.string().optional(),
          title: z.string().optional(),
        }),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.contextModel.update(input.id, input.data);
    }),

  updateExperience: userMemoryProcedure
    .input(
      z.object({
        data: z.object({
          action: z.string().optional(),
          keyLearning: z.string().optional(),
          situation: z.string().optional(),
        }),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.experienceModel.update(input.id, input.data);
    }),

  updateIdentity: userMemoryProcedure
    .input(
      z.object({
        data: UpdateUserMemoryIdentitySchema,
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.updateIdentityEntry({
        identity: {
          description: input.data.description,
          episodicDate: input.data.episodicDate,
          relationship: input.data.relationship,
          role: input.data.role,
          tags: input.data.extractedLabels,
          type: input.data.type,
        },
        identityId: input.id,
      });
    }),

  updatePreference: userMemoryProcedure
    .input(
      z.object({
        data: z.object({
          conclusionDirectives: z.string().optional(),
          suggestions: z.string().optional(),
        }),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.preferenceModel.update(input.id, input.data);
    }),
});

export type UserMemoryRouter = typeof userMemoryRouter;
