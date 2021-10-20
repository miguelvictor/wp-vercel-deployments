export async function getTeams(accessToken) {
  const url = "https://api.vercel.com/v1/teams";
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { teams } = await response.json();

  return teams.map(({ id, slug, name }) => ({ id, slug, name }));
}

export async function getProjects(accessToken, teamId) {
  const url =
    "https://api.vercel.com/v8/projects?" + new URLSearchParams({ teamId });
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const { projects } = await response.json();

  return projects.map(({ id, name, link, latestDeployments }) => ({
    id,
    name,
    link,
    latestDeployments,
  }));
}

export async function getLatestDeployments(accessToken, teamId, projectId) {
  const url =
    "https://api.vercel.com/v5/now/deployments?" +
    new URLSearchParams({ teamId, projectId });
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const { deployments } = await response.json();

  return deployments.map(
    ({ uid: id, created: createdAt, state: readyState }) => ({
      id,
      createdAt,
      readyState,
    })
  );
}

export async function cancelLatestDeployment(
  accessToken,
  teamId,
  projectId,
  deploymentId
) {
  const url =
    `https://api.vercel.com/v12/now/deployments/${deploymentId}/cancel?` +
    new URLSearchParams({ teamId, projectId });
  const response = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const { id, readyState, createdAt } = await response.json();

  return { id, readyState, createdAt };
}

export async function readSettings() {
  const url = `${window.wpApiSettings["root"]}dfse-vercel/v1/read`;
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "X-WP-Nonce": window.wpApiSettings["nonce"] },
  });
  return await response.json();
}

export async function saveSettings(settings) {
  const url = `${window.wpApiSettings["root"]}dfse-vercel/v1/update`;
  return await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": window.wpApiSettings["nonce"],
    },
    body: JSON.stringify(settings),
  });
}

export async function deployToVercel(url) {
  const response = await fetch(url, { method: "POST" });
  return await response.json();
}
