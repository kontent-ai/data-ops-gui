// import { diffEnvironments } from "@kontent-ai/data-ops";
import { Handler } from "@netlify/functions";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const diffParamsSchema = z.strictObject({
  sourceEnvironmentId: z.string(),
  sourceApiKey: z.string(),
  targetEnvironmentId: z.string(),
  targetApiKey: z.string(),
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

  // const diffHtml = await diffEnvironments({
  //   sourceEnvironmentId: result.data.sourceEnvironmentId,
  //   sourceApiKey: result.data.sourceApiKey,
  //   targetEnvironmentId: result.data.targetEnvironmentId,
  //   targetApiKey: result.data.targetApiKey,
  // });

  return {
    statusCode: 200,
    body: "diffHtml",
  };
};
