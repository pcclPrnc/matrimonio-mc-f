const GITHUB_API = "https://api.github.com";

export function getGithubCredentials() {
  return {
    token:  localStorage.getItem("github_pat")    || "",
    owner:  localStorage.getItem("github_owner")  || "",
    repo:   localStorage.getItem("github_repo")   || "",
    branch: localStorage.getItem("github_branch") || "main",
  };
}

export function isGithubConfigured() {
  const { token, owner, repo } = getGithubCredentials();
  return !!(token && owner && repo);
}

async function getFileSha(path, { owner, repo, branch, token }) {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
    );
    if (res.ok) return (await res.json()).sha;
  } catch {}
  return null;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file to public/media/{storageKey}.{ext} in the GitHub repo.
 * Returns a raw.githubusercontent.com URL that is accessible immediately.
 */
export async function uploadMedia(storageKey, file) {
  const creds = getGithubCredentials();
  if (!isGithubConfigured()) throw new Error("Credenziali GitHub non configurate");

  const ext = file.name.split(".").pop().toLowerCase();
  const path = `public/media/${storageKey}.${ext}`;
  const sha = await getFileSha(path, creds);
  const content = await fileToBase64(file);

  const res = await fetch(
    `${GITHUB_API}/repos/${creds.owner}/${creds.repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `media: upload ${storageKey}`,
        content,
        branch: creds.branch,
        ...(sha && { sha }),
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error ${res.status}`);
  }

  /* raw.githubusercontent.com is served directly from git — no deploy needed */
  return `https://raw.githubusercontent.com/${creds.owner}/${creds.repo}/${creds.branch}/public/media/${storageKey}.${ext}`;
}

const MEDIA_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"];

/**
 * Deletes a media file from the repo (tries all common extensions).
 */
export async function deleteMedia(storageKey) {
  const creds = getGithubCredentials();
  if (!isGithubConfigured()) return;

  for (const ext of MEDIA_EXTENSIONS) {
    const path = `public/media/${storageKey}.${ext}`;
    const sha = await getFileSha(path, creds);
    if (!sha) continue;

    await fetch(
      `${GITHUB_API}/repos/${creds.owner}/${creds.repo}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${creds.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `media: delete ${storageKey}`,
          sha,
          branch: creds.branch,
        }),
      }
    );
    break;
  }
}
