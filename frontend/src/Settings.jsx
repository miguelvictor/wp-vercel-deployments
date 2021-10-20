import { useCallback, useReducer, useEffect, useState } from "react";
import { readProjects, saveProjects } from "./api";

import "./Settings.css";

const Actions = {
  LoadProjects: "LOAD_PROJECTS",
  AddNewProject: "ADD_NEW_PROJECT",
  UpdateProjectName: "UPDATE_PROJECT_NAME",
  UpdateProjectUrl: "UPDATE_PROJECT_URL",
};

const initialState = {
  projects: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case Actions.LoadProjects:
      return {
        ...state,
        projects: action.payload,
      };
    case Actions.AddNewProject:
      return {
        ...state,
        projects: [...state.projects, { name: "", url: "" }],
      };
    case Actions.UpdateProjectName:
      return {
        ...state,
        projects: state.projects.map(({ name, url }, i) => ({
          name: action.payload.index === i ? action.payload.value : name,
          url,
        })),
      };
    case Actions.UpdateProjectUrl:
      return {
        ...state,
        projects: state.projects.map(({ name, url }, i) => ({
          name,
          url: action.payload.index === i ? action.payload.value : url,
        })),
      };
    default:
      return state;
  }
};

const isValidUrl = (urlToValidate) => {
  let url;

  try {
    url = new URL(urlToValidate);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};
const isValid = (projects) =>
  projects.every(
    ({ name, url }) => name.trim().length === 0 || isValidUrl(url)
  );

export default function App() {
  const [isLoading, setLoading] = useState(false);
  const [{ projects }, dispatch] = useReducer(reducer, initialState);
  const changeHandler = useCallback(
    (e) => {
      const type =
        e.target.type === "text"
          ? Actions.UpdateProjectName
          : Actions.UpdateProjectUrl;
      const index =
        e.target.type === "text"
          ? parseInt(e.target.id.substring(5))
          : parseInt(e.target.id.substring(4));
      dispatch({ type, payload: { index, value: e.target.value } });
    },
    [dispatch]
  );
  const addHandler = useCallback(
    (e) => {
      e.preventDefault();
      dispatch({ type: Actions.AddNewProject });
    },
    [dispatch]
  );
  const saveHandler = useCallback(() => {
    if (isValid(projects)) {
      setLoading(true);
      saveProjects(projects.filter(({ name }) => name.trim().length > 0))
        .then(() => window.location.reload(false))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      alert("invalid!");
    }
  }, [projects]);

  // effects
  useEffect(() => {
    setLoading(true);
    readProjects()
      .then((projects) =>
        dispatch({ type: Actions.LoadProjects, payload: projects })
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // components
  const rows = projects.map(({ name, url }, i) => (
    <tr key={i}>
      <td className="dfse-counter">{i + 1}</td>
      <td>
        <input
          className="dfse-form-input"
          type="text"
          name={`name-${i}`}
          id={`name-${i}`}
          value={name}
          onChange={changeHandler}
        />
      </td>
      <td>
        <input
          className="dfse-form-input"
          type="url"
          name={`url-${i}`}
          id={`url-${i}`}
          value={url}
          onChange={changeHandler}
        />
      </td>
    </tr>
  ));

  return (
    <>
      <h1>Vercel Deployment Settings</h1>
      <p>Some description here</p>
      <table className="dfse-settings-table" cellPadding="0" cellSpacing="0">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th className="dfse-project-name">Name</th>
            <th className="dfse-project-url">Deploy Hook URL</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      <div className="dfse-actions">
        <button
          className="dfse-add-new-project button"
          onClick={addHandler}
          disabled={isLoading}
        >
          Add new project
        </button>
        <button
          className="dfse-save button button-primary"
          onClick={saveHandler}
          disabled={isLoading}
        >
          Save
        </button>
      </div>
    </>
  );
}
