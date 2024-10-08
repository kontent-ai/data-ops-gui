import { ManagementClient } from "@kontent-ai/management-sdk";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { WizardContext } from "../../WizardContext";

export const SyncSource: React.FC = () => {
  const {
    sourceEnvironmentId,
    setSourceEnvironmentId,
    sourceApiKey,
    setSourceApiKey,
    setSourceFile,
    setSourceClient,
  } = useContext(WizardContext);
  const [useModelFile, setUseModelFile] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>();
  const [environmentName, setEnvironmentName] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectInfo = async () => {
      if (sourceEnvironmentId && sourceApiKey && !useModelFile) {
        setLoading(true);
        try {
          const client = new ManagementClient({
            apiKey: sourceApiKey,
            environmentId: sourceEnvironmentId,
          });
          const projectInfo = await client.environmentInformation().toPromise();
          const { name, environment } = projectInfo.data.project;
          setProjectName(name);
          setEnvironmentName(environment);
          setSourceClient(client);
        } catch (error) {
          console.error("Failed to fetch project info", error);
          setProjectName(undefined);
          setEnvironmentName(undefined);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProjectInfo();
  }, [sourceEnvironmentId, sourceApiKey, useModelFile, setSourceClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/sync/target");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sync - Provide Source Information</h2>
      <label>
        <input
          type="checkbox"
          checked={useModelFile}
          onChange={() => setUseModelFile(!useModelFile)}
        />
        Sync from existing model file
      </label>

      {useModelFile
        ? (
          <div>
            <label>
              Choose Model File:
              <input
                type="file"
                onChange={(e) => setSourceFile(e.target.files ? e.target.files[0] : null)}
                required
              />
            </label>
          </div>
        )
        : (
          <>
            <div>
              <label>
                Source Environment ID:
                <input
                  type="text"
                  value={sourceEnvironmentId || ""}
                  onChange={(e) => setSourceEnvironmentId(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Source API Key:
                <input
                  type="password"
                  value={sourceApiKey || ""}
                  onChange={(e) => setSourceApiKey(e.target.value)}
                  required
                />
              </label>
            </div>
            {loading ? <p>Loading project info...</p> : projectName && environmentName
              ? (
                <p>
                  Project: {projectName}, Environment: {environmentName}
                </p>
              )
              : null}
          </>
        )}
      <div>
        <button type="submit">Next</button>
      </div>
    </form>
  );
};
