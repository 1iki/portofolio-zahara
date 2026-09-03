/**
 * Content Service Abstraction Layer — MongoDB & API Integration
 * Portfolio: Zahara Elhusna
 *
 * Architecture:
 *   Frontend Components (Public Website & CMS)
 *        ↓
 *   contentService API methods
 *        ↓
 *   Server REST API Layer (/api/works, /api/documentation, /api/health)
 *        ↓
 *   MongoDB PortoZeze Database (Primary Source of Truth)
 *
 * Principles:
 * 1. MongoDB is the PRIMARY SOURCE OF TRUTH.
 * 2. NO content storage in localStorage.
 * 3. NO false fallbacks — write failures throw explicit database errors.
 * 4. Preserves MAX_MEDIA = 55 limit and media[0] primary thumbnail designation.
 */

import { MAX_MEDIA, normalizeMedia } from "./mediaUtils";

// Real-time event listener subscribers for UI synchronization
const listeners = new Set();

function notifySubscribers() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error("[ContentService] Subscriber error:", err);
    }
  });
}

/**
 * Subscribe to data changes.
 * @param {Function} callback
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToDataChanges(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Fetch database health status from `/api/health`.
 */
export async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    const json = await res.json();
    return json;
  } catch (err) {
    return { success: false, database: "MongoDB", status: "disconnected", error: err.message };
  }
}

// ── TAXONOMY OPTIONS API ─────────────────────────────────────────
export async function getOptions(type, search = '', signal = null) {
  try {
    const params = new URLSearchParams({ type });
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    const res = await fetch(`/api/options?${params.toString()}`, { signal: signal || undefined });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Gagal mengambil data options.');
    }
    return json.data || [];
  } catch (err) {
    if (err.name === 'AbortError') {
      return null; // Silent cancellation for in-flight requests
    }
    console.error('[contentService.getOptions] Error:', err);
    return [];
  }
}

export async function createOption(type, value) {
  const res = await fetch('/api/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, value }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menyimpan option baru ke MongoDB.');
  }
  return json.data;
}

// ── WORKS API ────────────────────────────────────────────────────
export async function getWorks() {
  try {
    const res = await fetch("/api/works");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (err) {
    console.error("[ContentService] Failed to fetch works from API:", err);
    return [];
  }
}

export async function getWorkById(id) {
  try {
    const res = await fetch(`/api/works/${id}`);
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  } catch (err) {
    return null;
  }
}

export async function createWork(newWork) {
  const normalizedMedia = normalizeMedia(newWork);
  const payload = {
    ...newWork,
    media: normalizedMedia.slice(0, MAX_MEDIA),
    thumbnail: normalizedMedia[0]?.src || newWork.thumbnail || null,
  };

  const res = await fetch("/api/works", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal menyimpan karya ke database MongoDB.");
  }

  notifySubscribers();
  return json.data;
}

export async function updateWork(id, updatedWork) {
  const normalizedMedia = normalizeMedia(updatedWork);
  const payload = {
    ...updatedWork,
    media: normalizedMedia.slice(0, MAX_MEDIA),
    thumbnail: normalizedMedia[0]?.src || updatedWork.thumbnail || null,
  };

  const res = await fetch(`/api/works/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal memperbarui karya di MongoDB.");
  }

  notifySubscribers();
  return json.data;
}

export async function deleteWork(id) {
  const res = await fetch(`/api/works/${id}`, {
    method: "DELETE",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal menghapus karya dari MongoDB.");
  }

  notifySubscribers();
}

// ── DOCUMENTATION API ────────────────────────────────────────────
export async function getDocumentation() {
  try {
    const res = await fetch("/api/documentation");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (err) {
    console.error("[ContentService] Failed to fetch documentation from API:", err);
    return [];
  }
}

export async function getDocumentationById(id) {
  try {
    const res = await fetch(`/api/documentation/${id}`);
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  } catch (err) {
    return null;
  }
}

export async function createDocumentation(newDoc) {
  const normalizedMedia = normalizeMedia(newDoc);
  const payload = {
    ...newDoc,
    media: normalizedMedia.slice(0, MAX_MEDIA),
    mediaUrl: normalizedMedia[0]?.src || newDoc.mediaUrl || null,
    thumbnailUrl: normalizedMedia[0]?.src || newDoc.thumbnailUrl || null,
  };

  const res = await fetch("/api/documentation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal menyimpan dokumentasi ke MongoDB.");
  }

  notifySubscribers();
  return json.data;
}

export async function updateDocumentation(id, updatedDoc) {
  const normalizedMedia = normalizeMedia(updatedDoc);
  const payload = {
    ...updatedDoc,
    media: normalizedMedia.slice(0, MAX_MEDIA),
    mediaUrl: normalizedMedia[0]?.src || updatedDoc.mediaUrl || null,
    thumbnailUrl: normalizedMedia[0]?.src || updatedDoc.thumbnailUrl || null,
  };

  const res = await fetch(`/api/documentation/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal memperbarui dokumentasi di MongoDB.");
  }

  notifySubscribers();
  return json.data;
}

export async function deleteDocumentation(id) {
  const res = await fetch(`/api/documentation/${id}`, {
    method: "DELETE",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal menghapus dokumentasi dari MongoDB.");
  }

  notifySubscribers();
}

// ── SCRIPTS FULL CRUD ────────────────────────────────────────────
export async function getScripts() {
  try {
    const res = await fetch("/api/scripts", { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Gagal memuat naskah.');
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function getScriptById(id) {
  try {
    const res = await fetch(`/api/scripts/${id}`);
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  } catch (err) {
    return null;
  }
}

export async function createScript(newScript) {
  const res = await fetch("/api/scripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newScript),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menyimpan naskah ke database MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function updateScript(id, updatedScript) {
  const res = await fetch(`/api/scripts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedScript),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui naskah di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function deleteScript(id) {
  const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menghapus naskah dari MongoDB.");
  }
  notifySubscribers();
}

// ── EXPERIENCE FULL CRUD ─────────────────────────────────────────
export async function getExperience() {
  try {
    const res = await fetch("/api/experience");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function getExperienceById(id) {
  try {
    const res = await fetch(`/api/experience/${id}`);
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  } catch (err) {
    return null;
  }
}

export async function createExperience(newExp) {
  const res = await fetch("/api/experience", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newExp),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menyimpan pengalaman ke database MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function updateExperience(id, updatedExp) {
  const res = await fetch(`/api/experience/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedExp),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui pengalaman di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function deleteExperience(id) {
  const res = await fetch(`/api/experience/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menghapus pengalaman dari MongoDB.");
  }
  notifySubscribers();
}

// ── EDUCATION FULL CRUD ──────────────────────────────────────────
export async function getEducation() {
  try {
    const res = await fetch("/api/education");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function getEducationById(id) {
  try {
    const res = await fetch(`/api/education/${id}`);
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  } catch (err) {
    return null;
  }
}

export async function createEducation(newEdu) {
  const res = await fetch("/api/education", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newEdu),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menyimpan pendidikan ke database MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function updateEducation(id, updatedEdu) {
  const res = await fetch(`/api/education/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedEdu),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui pendidikan di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function deleteEducation(id) {
  const res = await fetch(`/api/education/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menghapus pendidikan dari MongoDB.");
  }
  notifySubscribers();
}

// ── CONTACT SINGLETON CRUD ───────────────────────────────────────
export async function getContact() {
  try {
    const res = await fetch("/api/contact");
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    return null;
  }
}

export async function updateContact(contactData) {
  const res = await fetch("/api/contact", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui kontak di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

// ── WORK CATEGORIES CRUD ──────────────────────────────────────────
export async function getWorkCategories() {
  try {
    const res = await fetch("/api/work-categories");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function createWorkCategory(newCat) {
  const res = await fetch("/api/work-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCat),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menyimpan kategori karya ke MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function updateWorkCategory(id, updatedCat) {
  const res = await fetch(`/api/work-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedCat),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui kategori karya di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function deleteWorkCategory(id) {
  const res = await fetch(`/api/work-categories/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menghapus kategori karya dari MongoDB.");
  }
  notifySubscribers();
}

// ── EXPERIENCE CATEGORIES CRUD ────────────────────────────────────
export async function getExperienceCategories() {
  try {
    const res = await fetch("/api/experience-categories");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function createExperienceCategory(newCat) {
  const res = await fetch("/api/experience-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCat),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menyimpan kategori pengalaman ke MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function updateExperienceCategory(id, updatedCat) {
  const res = await fetch(`/api/experience-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedCat),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui kategori pengalaman di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function deleteExperienceCategory(id) {
  const res = await fetch(`/api/experience-categories/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menghapus kategori pengalaman dari MongoDB.");
  }
  notifySubscribers();
}

// ── ROLE FILTERS CRUD ─────────────────────────────────────────────
export async function getRoleFilters() {
  try {
    const res = await fetch("/api/role-filters");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function createRoleFilter(newFilter) {
  const res = await fetch("/api/role-filters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newFilter),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menyimpan role filter ke MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function updateRoleFilter(id, updatedFilter) {
  const res = await fetch(`/api/role-filters/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFilter),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal memperbarui role filter di MongoDB.");
  }
  notifySubscribers();
  return json.data;
}

export async function deleteRoleFilter(id) {
  const res = await fetch(`/api/role-filters/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal menghapus role filter dari MongoDB.");
  }
  notifySubscribers();
}

// ── MEDIA UPLOAD TO CLOUDINARY ────────────────────────────────────
export async function uploadMediaToCloudinary(fileInput, customPublicId = null) {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: fileInput, customPublicId }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal upload media ke Cloudinary.");
  }

  return json.data;
}

export async function uploadScriptPdf(fileInput, customPublicId = null) {
  const res = await fetch("/api/upload/script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: fileInput, customPublicId }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal upload PDF Naskah ke Cloudinary.");
  }

  return json.data;
}

export async function cleanupUploadedScriptPdf(pdfPublicId) {
  if (!pdfPublicId) return;
  const res = await fetch('/api/upload/script/cleanup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfPublicId }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Gagal membersihkan upload PDF sementara.');
}

// ── RESET & BACKUP UTILITIES ─────────────────────────────────────
export async function resetToDefaults() {
  const res = await fetch("/api/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.error || "Gagal mere-seed database MongoDB.");
  }

  notifySubscribers();
  return json;
}

export async function exportCMSBackup() {
  const res = await fetch("/api/export");
  const json = await res.json();
  if (!res.ok) {
    throw new Error("Gagal mengunduh backup dari MongoDB.");
  }

  const jsonString = JSON.stringify(json, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split("T")[0];

  const a = document.createElement("a");
  a.href = url;
  a.download = `zahara-mongodb-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importCMSBackup(parsedData) {
  if (!parsedData || typeof parsedData !== "object") {
    return { success: false, error: "Format JSON backup tidak valid." };
  }

  try {
    const counts = { works: 0, docs: 0, scripts: 0, experience: 0, education: 0, work_categories: 0, experience_categories: 0, role_filters: 0 };

    // Import works
    if (Array.isArray(parsedData.works)) {
      for (const w of parsedData.works) {
        await createWork(w).catch(() => updateWork(w.id, w));
        counts.works++;
      }
    }

    // Import documentation
    if (Array.isArray(parsedData.documentation)) {
      for (const d of parsedData.documentation) {
        await createDocumentation(d).catch(() => updateDocumentation(d.id, d));
        counts.docs++;
      }
    }

    // Import scripts
    if (Array.isArray(parsedData.scripts)) {
      for (const s of parsedData.scripts) {
        await createScript(s).catch(() => updateScript(s.id, s));
        counts.scripts++;
      }
    }

    // Import experience
    if (Array.isArray(parsedData.experience)) {
      for (const e of parsedData.experience) {
        await createExperience(e).catch(() => updateExperience(e.id, e));
        counts.experience++;
      }
    }

    // Import education
    if (Array.isArray(parsedData.education)) {
      for (const ed of parsedData.education) {
        await createEducation(ed).catch(() => updateEducation(ed.id, ed));
        counts.education++;
      }
    }

    // Import contact (singleton)
    if (parsedData.contact && typeof parsedData.contact === "object") {
      await updateContact(parsedData.contact);
    }

    // Import work categories
    if (Array.isArray(parsedData.work_categories)) {
      for (const wc of parsedData.work_categories) {
        await createWorkCategory(wc).catch(() => updateWorkCategory(wc.id, wc));
        counts.work_categories++;
      }
    }

    // Import experience categories
    if (Array.isArray(parsedData.experience_categories)) {
      for (const ec of parsedData.experience_categories) {
        await createExperienceCategory(ec).catch(() => updateExperienceCategory(ec.id, ec));
        counts.experience_categories++;
      }
    }

    // Import role filters
    if (Array.isArray(parsedData.role_filters)) {
      for (const rf of parsedData.role_filters) {
        await createRoleFilter(rf).catch(() => updateRoleFilter(rf.id, rf));
        counts.role_filters++;
      }
    }

    notifySubscribers();
    return { success: true, counts };
  } catch (err) {
    return { success: false, error: `Gagal impor backup: ${err.message}` };
  }
}
