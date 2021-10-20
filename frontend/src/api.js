export async function readProjects() {
  const url = `${window.wpApiSettings["root"]}dfse-vercel/v1/read`;
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "X-WP-Nonce": window.wpApiSettings["nonce"] },
  });
  const projects = await response.json();
  return projects;
}

export async function saveProjects(projects) {
  const url = `${window.wpApiSettings["root"]}dfse-vercel/v1/update`;
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": window.wpApiSettings["nonce"],
    },
    body: JSON.stringify(projects),
  });

  return response.status;
}
