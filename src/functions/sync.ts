import { syncModelRun } from "@kontent-ai/data-ops";
import { Handler } from "@netlify/functions";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const diffParamsSchema = z.strictObject({
  sourceEnvironmentId: z.string(),
  sourceApiKey: z.string(),
  targetEnvironmentId: z.string(),
  targetApiKey: z.string(),
  entities: z.array(z.enum([
    "contentTypes",
    "contentTypeSnippets",
    "taxonomies",
    "collections",
    "assetFolders",
    "spaces",
    "languages",
    "webSpotlight",
    "workflows",
  ])),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  const contentType = event.headers["content-type"] || event.headers["Content-Type"];
  if (!contentType || !contentType.includes("application/json")) {
    return {
      statusCode: 400,
      body: "Content-Type must be application/json",
    };
  }

  const result = diffParamsSchema.safeParse(JSON.parse(event.body ?? ""));

  if (!result.success) {
    return {
      statusCode: 400,
      body: fromError(result.error).message,
    };
  }

  try {
    await syncModelRun(result.data);

    return {
      statusCode: 200,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    };
  }
};
