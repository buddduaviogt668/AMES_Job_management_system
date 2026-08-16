import { InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
const GRAPH_SCOPES = ["openid", "profile", "email", "offline_access", "Files.ReadWrite"];

// These are non-secret identifiers supplied by the AMES owner. They may be overridden in Vercel env settings.
const DEFAULT_CLIENT_ID = "13f41ca9-df24-4cbc-a094-0cecf1fdd13f";
const DEFAULT_TENANT_ID = "dd3afa8e-adc4-4984-9d28-6973c8da7485";
const DEFAULT_ROOT_SHARE_URL = "";

let msalApp;
let msalReady;
const runtimeEnv = import.meta.env || {};

const getConfig = () => ({
  clientId: runtimeEnv.VITE_MICROSOFT_CLIENT_ID || DEFAULT_CLIENT_ID,
  tenantId: runtimeEnv.VITE_MICROSOFT_TENANT_ID || DEFAULT_TENANT_ID,
  redirectUri: runtimeEnv.VITE_MICROSOFT_REDIRECT_URI || (typeof window !== "undefined" ? `${window.location.origin}/` : "http://localhost:5173/"),
  rootShareUrl: runtimeEnv.VITE_ONEDRIVE_ROOT_SHARE_URL || DEFAULT_ROOT_SHARE_URL,
});

export const getOneDriveConfig = () => getConfig();

export const isOneDriveConfigured = () => {
  const config = getConfig();
  return Boolean(config.clientId && config.tenantId && config.rootShareUrl);
};

const ensureMsal = async () => {
  if (!msalReady) {
    const config = getConfig();
    msalApp = new PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri: config.redirectUri,
        postLogoutRedirectUri: config.redirectUri,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    });
    msalReady = msalApp.initialize();
  }
  await msalReady;
  return msalApp;
};

const getAccount = async () => {
  const app = await ensureMsal();
  return app.getActiveAccount() || app.getAllAccounts()[0] || null;
};

export const getOneDriveStatus = async () => {
  if (!isOneDriveConfigured()) return { configured: false, connected: false };
  const account = await getAccount();
  return {
    configured: true,
    connected: Boolean(account),
    accountName: account?.name || account?.username || "",
    accountUsername: account?.username || "",
    rootName: "Ames Food Advisory",
    rootShareUrl: getConfig().rootShareUrl,
  };
};

export const connectOneDrive = async () => {
  const app = await ensureMsal();
  const account = await getAccount();
  const result = account
    ? await app.acquireTokenSilent({ account, scopes: GRAPH_SCOPES }).catch(async (error) => {
        if (!(error instanceof InteractionRequiredAuthError)) throw error;
        return app.loginPopup({ scopes: GRAPH_SCOPES, prompt: "select_account" });
      })
    : await app.loginPopup({ scopes: GRAPH_SCOPES, prompt: "select_account" });
  app.setActiveAccount(result.account);
  return getOneDriveStatus();
};

export const disconnectOneDrive = async () => {
  const app = await ensureMsal();
  const account = await getAccount();
  if (account) await app.logoutPopup({ account, postLogoutRedirectUri: getConfig().redirectUri });
  app.setActiveAccount(null);
  return getOneDriveStatus();
};

const getAccessToken = async () => {
  const app = await ensureMsal();
  const account = await getAccount();
  if (!account) throw new Error("Connect OneDrive before uploading documents.");
  try {
    const token = await app.acquireTokenSilent({ account, scopes: GRAPH_SCOPES });
    return token.accessToken;
  } catch (error) {
    if (!(error instanceof InteractionRequiredAuthError)) throw error;
    const token = await app.acquireTokenPopup({ account, scopes: GRAPH_SCOPES });
    return token.accessToken;
  }
};

const encodeShareUrl = (url) => {
  const bytes = new TextEncoder().encode(url);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `u!${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
};

const graphRequest = async (path, options = {}) => {
  const token = await getAccessToken();
  const response = await fetch(`${GRAPH_ROOT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body instanceof ArrayBuffer || options.body instanceof Blob ? { "Content-Type": "application/octet-stream" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OneDrive request failed (${response.status})${detail ? `: ${detail.slice(0, 240)}` : ""}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

const resolveRoot = async () => {
  const shareId = encodeURIComponent(encodeShareUrl(getConfig().rootShareUrl));
  return graphRequest(`/shares/${shareId}/driveItem?$select=id,name,webUrl,parentReference,folder`);
};

const listChildren = async (driveId, parentId) => {
  const result = await graphRequest(`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(parentId)}/children?$select=id,name,folder,webUrl&$top=200`);
  return Array.isArray(result?.value) ? result.value : [];
};

const ensureFolder = async (driveId, parentId, name) => {
  const existing = (await listChildren(driveId, parentId)).find((item) => item.name === name && item.folder);
  if (existing) return existing;
  try {
    return await graphRequest(`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(parentId)}/children`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        folder: {},
        "@microsoft.graph.conflictBehavior": "fail",
      }),
    });
  } catch (error) {
    // Another browser tab may have created the folder between list and create; resolve it once more.
    const retry = (await listChildren(driveId, parentId)).find((item) => item.name === name && item.folder);
    if (retry) return retry;
    throw error;
  }
};

const cleanFolderName = (value, fallback) => {
  const cleaned = String(value || fallback).replace(/["*:<>?/\\|]/g, "-").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
};

const proposalSuffix = (proposalNumber, invoiceNumber) => {
  const raw = invoiceNumber || proposalNumber || "AFA-100000";
  const match = String(raw).match(/(\d+)$/);
  return match ? `AFA-${match[1]}` : "AFA-100000";
};

export const buildOneDriveFolderModel = ({ businessName, proposalNumber, invoiceNumber }) => {
  const client = cleanFolderName(businessName, "Client");
  const proposal = cleanFolderName(proposalNumber, "AFA-P-100000");
  const numberFolder = proposalSuffix(proposalNumber, invoiceNumber);
  return {
    root: "Ames Food Advisory",
    client,
    proposal,
    proposalPath: ["Ames Food Advisory", client, proposal, "Proposal"],
    invoicePath: ["Ames Food Advisory", client, numberFolder, "Invoices"],
    jobPath: ["Ames Food Advisory", client, numberFolder, "Job Documents"],
  };
};

export const ensureDocumentFolders = async ({ businessName, proposalNumber, invoiceNumber }) => {
  const root = await resolveRoot();
  if (!root?.id || !root?.parentReference?.driveId) throw new Error("The shared Ames Food Advisory folder could not be resolved.");
  const driveId = root.parentReference.driveId;
  const clientFolder = await ensureFolder(driveId, root.id, cleanFolderName(businessName, "Client"));
  const proposalFolder = await ensureFolder(driveId, clientFolder.id, cleanFolderName(proposalNumber, "AFA-P-100000"));
  const proposalDocuments = await ensureFolder(driveId, proposalFolder.id, "Proposal");
  const numberFolder = await ensureFolder(driveId, clientFolder.id, proposalSuffix(proposalNumber, invoiceNumber));
  const invoices = await ensureFolder(driveId, numberFolder.id, "Invoices");
  const jobDocuments = await ensureFolder(driveId, numberFolder.id, "Job Documents");
  return { root, driveId, clientFolder, proposalFolder, proposalDocuments, numberFolder, invoices, jobDocuments };
};

const uploadBytes = async (driveId, folderId, fileName, body, contentType) => {
  const token = await getAccessToken();
  const safeName = encodeURIComponent(fileName);
  const response = await fetch(`${GRAPH_ROOT}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(folderId)}:/${safeName}:/content`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType || "application/octet-stream" },
    body,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OneDrive upload failed (${response.status})${detail ? `: ${detail.slice(0, 240)}` : ""}`);
  }
  return response.json();
};

export const uploadDocumentToOneDrive = async ({ kind, businessName, proposalNumber, invoiceNumber, file, fileName, contentType }) => {
  const folders = await ensureDocumentFolders({ businessName, proposalNumber, invoiceNumber });
  const destination = kind === "proposal" ? folders.proposalDocuments : kind === "job" ? folders.jobDocuments : folders.invoices;
  const body = file instanceof Blob || file instanceof ArrayBuffer ? file : new Blob([file], { type: contentType || "application/octet-stream" });
  return uploadBytes(folders.driveId, destination.id, fileName, body, contentType || body.type);
};

export const createOneDriveFoldersForRecord = async ({ businessName, proposalNumber, invoiceNumber }) =>
  ensureDocumentFolders({ businessName, proposalNumber, invoiceNumber });
