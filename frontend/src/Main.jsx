import { useReducer, useEffect, useState } from "react";
import { format } from "timeago.js";
import {
  cancelLatestDeployment,
  deployToVercel,
  getLatestDeployments,
  getProjects,
  readSettings,
} from "./api";

const Actions = {
  LoadProjects: "LOAD_PROJECTS",
  DeployOne: "DEPLOY_ONE",
  UpdateDeployments: "UPDATE_DEPLOYMENTS",
};
const initialState = {
  projects: [],
};
const DEPLOY_REFRESH_DELAY = 4 * 1000;
const REFRESH_INTERVAL = 10 * 1000;

const reducer = (state, action) => {
  switch (action.type) {
    case Actions.LoadProjects:
      return {
        ...state,
        projects: action.payload,
      };
    case Actions.DeployOne:
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload
            ? {
                ...project,
                latestDeployments: [
                  { id: null, readyState: "QUEUED", createdAt: Date.now() },
                ],
              }
            : project
        ),
      };
    case Actions.UpdateDeployments:
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id
            ? { ...project, latestDeployments: action.payload.deployments }
            : project
        ),
      };
    default:
      return state;
  }
};

export default function Main() {
  const [{ projects }, dispatch] = useReducer(reducer, initialState);
  const [configured, setConfigured] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [activeTeamID, setActiveTeamID] = useState(null);
  const cancel = (id) => {
    const project = projects.find(({ id: _id }) => _id === id);
    console.log(project);
    const deploymentId = project.latestDeployments[0].id;
    if (!deploymentId) return;

    cancelLatestDeployment(accessToken, deploymentId, activeTeamID)
      .then((deployment) =>
        dispatch({
          type: Actions.UpdateDeployments,
          payload: { id, deployments: [deployment] },
        })
      )
      .catch(console.error);
  };
  const deploy = (id, url) => {
    dispatch({ type: Actions.DeployOne, payload: id });
    deployToVercel(url)
      .then(
        () =>
          new Promise((resolve) => setTimeout(resolve, DEPLOY_REFRESH_DELAY))
      )
      .then(() => getLatestDeployments(accessToken, activeTeamID, id))
      .then((deployments) =>
        dispatch({
          type: Actions.UpdateDeployments,
          payload: { id, deployments },
        })
      );
  };

  // effects
  useEffect(() => {
    // get settings and retrieve projects
    readSettings()
      .then(({ accessToken, activeTeamID }) => {
        if (!accessToken || !activeTeamID) return;
        setConfigured(true);
        setAccessToken(accessToken);
        setActiveTeamID(activeTeamID);
        return getProjects(accessToken, activeTeamID);
      })
      .then((projects) => {
        if (Array.isArray(projects) && projects.length > 0) {
          dispatch({ type: Actions.LoadProjects, payload: projects });
        }
      })
      .catch(console.error);

    // refresh project status
    setInterval(() => {
      if (accessToken && activeTeamID) {
        getProjects(accessToken, activeTeamID).then((projects) =>
          dispatch({ type: Actions.LoadProjects, payload: projects })
        );
      }
    }, REFRESH_INTERVAL);
  }, [accessToken, activeTeamID]);

  // components
  const rows = projects.map(({ id, name, link, latestDeployments }, i) => {
    const { readyState, createdAt } =
      latestDeployments.length > 0 ? latestDeployments[0] : {};
    const { url } = link.deployHooks.length > 0 ? link.deployHooks[0] : {};

    return (
      <tr key={id}>
        <td>{i + 1}</td>
        <td>{name}</td>
        <td>
          {readyState && createdAt
            ? readyState.toLowerCase() + " " + format(createdAt).toLowerCase()
            : "no deployments"}
        </td>
        <td align="center">
          {["QUEUED", "BUILDING"].includes(readyState) && (
            <button className="button button-link" onClick={() => cancel(id)}>
              Cancel
            </button>
          )}
          {["READY", "CANCELED", "ERROR"].includes(readyState) && (
            <button
              className="button button-link"
              onClick={() => deploy(id, url)}
            >
              Deploy
            </button>
          )}
        </td>
      </tr>
    );
  });

  return (
    <>
      <h1>Deploy to Vercel</h1>

      {/* Vercel Account Needs Setup  */}
      {!configured && (
        <p>
          No existing settings was found. Please go to the settings page to
          setup your Vercel account.
        </p>
      )}

      {/* Vercel Team contains no projects */}
      {projects.length === 0 && <p>No existing projects were found.</p>}

      {/* Projects and status table */}
      {configured && projects.length > 0 && (
        <>
          <table
            className="dfse-settings-table"
            cellPadding="0"
            cellSpacing="0"
          >
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th className="dfse-project-name">Project Name</th>
                <th className="dfse-project-status">Status</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </>
      )}
    </>
  );
}
