import { useCallback, useEffect, useState } from "react";
import { getTeams, readSettings, saveSettings } from "./api";

import "./Settings.css";

export default function App() {
  const [isLoading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [teams, setTeams] = useState([]);
  const [activeTeamID, setActiveTeamID] = useState(null);
  const verifyHandler = useCallback(() => {
    setLoading(true);
    getTeams(accessToken)
      .then((teams) => {
        if (teams.length > 0) {
          setTeams(teams);
          setActiveTeamID(teams[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken, setTeams, setActiveTeamID]);
  const saveHandler = useCallback(() => {
    if (accessToken && activeTeamID) {
      const settings = { accessToken, activeTeamID };
      setLoading(true);
      saveSettings(settings).then(() => window.location.reload(false));
    }
  }, [accessToken, activeTeamID]);

  // load already existing settings
  useEffect(() => {
    setLoading(true);
    readSettings()
      .then((settings) => {
        if (settings.hasOwnProperty("activeTeamID") && settings.activeTeamID) {
          setActiveTeamID(settings.activeTeamID);
        }

        if (settings.hasOwnProperty("accessToken") && settings.accessToken) {
          setAccessToken(settings.accessToken);
          return getTeams(settings.accessToken);
        }
      })
      .then((teams) => {
        if (Array.isArray(teams) && teams.length > 0) {
          setTeams(teams);
          if (teams.findIndex(({ id }) => id === activeTeamID) === -1) {
            setActiveTeamID(teams[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTeamID]);

  // component builders
  const teamSelector = teams.length > 0 && (
    <tr>
      <th>
        <label htmlFor="vercel-team">Vercel Team</label>
      </th>
      <td>
        <select
          id="vercel-team"
          onChange={(e) => setActiveTeamID(e.target.value)}
        >
          {teams.map(({ id, slug, name }) => (
            <option key={id} value={id}>
              {slug} - {name}
            </option>
          ))}
        </select>
        <p>
          Select the team which contains the multiple projects that you want to
          manage.
        </p>
      </td>
    </tr>
  );

  return (
    <>
      <h1>Vercel Deployment Settings</h1>
      <p>Some description here</p>

      <table className="form-table">
        <tbody>
          <tr>
            <th>
              <label htmlFor="vercel-access-token">Vercel Access Token</label>
            </th>
            <td>
              <input
                id="vercel-access-token"
                className="regular-text"
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              &nbsp;
              <button
                className="button button-link button-dfse"
                onClick={verifyHandler}
                disabled={isLoading || accessToken.trim().length === 0}
              >
                Verify
              </button>
              <p>
                The access token retrieved from the settings page of your Vercel
                account.
              </p>
            </td>
          </tr>
          {teamSelector}
        </tbody>
      </table>

      <div className="dfse-actions">
        <button
          className="dfse-save button button-primary"
          onClick={saveHandler}
          disabled={isLoading || !activeTeamID}
        >
          Save
        </button>
      </div>
    </>
  );
}
