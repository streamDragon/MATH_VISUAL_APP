(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(globalThis, function () {
  "use strict";
  const DEFAULT_URL = "https://qaxuqliefevglwtntmmw.supabase.co",
    DEFAULT_KEY = "sb_publishable_oJhyw_cLpt4iE2VfzVNWng_lVpUzq6I",
    SESSION_KEY = "vizy_learning_session";
  class LearningService {
    constructor(o = {}) {
      this.url = o.url || DEFAULT_URL;
      this.key = o.key || DEFAULT_KEY;
      this.fetch = o.fetch || globalThis.fetch.bind(globalThis);
      this.storage =
        o.storage === undefined ? globalThis.localStorage : o.storage;
      this.session = null;
      try {
        this.session = JSON.parse(this.storage?.getItem(SESSION_KEY) || "null");
      } catch {}
    }
    async init() {
      if (typeof location !== "undefined") {
        const h = new URLSearchParams(location.hash.slice(1));
        if (h.has("access_token")) {
          this.session = {
            access_token: h.get("access_token"),
            refresh_token: h.get("refresh_token"),
            expires_at: Date.now() / 1000 + Number(h.get("expires_in") || 3600),
          };
          history.replaceState(
            null,
            "",
            location.pathname + location.search + "#account",
          );
          await this.refreshUser();
          this.save();
        }
      }
      if (this.session) {
        try {
          if (
            this.session.expires_at &&
            this.session.expires_at < Date.now() / 1000 + 120
          )
            await this.refresh();
          else await this.refreshUser();
        } catch (e) {
          if (/session_expired/.test(e.message)) {
            this.session = null;
            this.save();
          } else throw e;
        }
      }
      return this.session;
    }
    save() {
      try {
        if (this.session)
          this.storage?.setItem(SESSION_KEY, JSON.stringify(this.session));
        else this.storage?.removeItem(SESSION_KEY);
      } catch {}
    }
    async request(path, options = {}) {
      const headers = { apikey: this.key, ...options.headers };
      if (this.session?.access_token)
        headers.Authorization = "Bearer " + this.session.access_token;
      if (options.body && !(options.body instanceof Blob))
        headers["Content-Type"] ??= "application/json";
      const res = await this.fetch(this.url + path, {
        ...options,
        headers,
        signal: AbortSignal.timeout(12000),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) {
        if (res.status === 401) throw Error("session_expired");
        if (
          res.status === 404 ||
          data?.code === "PGRST202" ||
          data?.code === "PGRST205" ||
          data?.code === "42P01"
        )
          throw Error("backend_setup_required");
        throw Error(data?.message || "network_failed");
      }
      return data;
    }
    needSession() {
      if (!this.session?.access_token || !this.session?.user?.id)
        throw Error("sign_in_required");
    }
    async refreshUser() {
      const user = await this.request("/auth/v1/user");
      this.session.user = user;
      this.save();
      return user;
    }
    async refresh() {
      const data = await this.request(
        "/auth/v1/token?grant_type=refresh_token",
        {
          method: "POST",
          body: JSON.stringify({ refresh_token: this.session.refresh_token }),
        },
      );
      this.session = {
        ...data,
        expires_at: Date.now() / 1000 + data.expires_in,
      };
      this.save();
    }
    async signIn(email, redirect) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw Error("email_required");
      await this.request(
        "/auth/v1/otp?redirect_to=" + encodeURIComponent(redirect),
        { method: "POST", body: JSON.stringify({ email, create_user: true }) },
      );
    }
    async signOut() {
      try {
        await this.request("/auth/v1/logout", { method: "POST" });
      } finally {
        this.session = null;
        this.save();
      }
    }
    async rpc(name, params = {}) {
      this.needSession();
      return this.request("/rest/v1/rpc/" + name, {
        method: "POST",
        body: JSON.stringify(params),
      });
    }
    async activity(id) {
      return (
        (
          await this.request(
            "/rest/v1/learning_content?select=payload&id=eq." +
              encodeURIComponent(id) +
              "&published=eq.true",
          )
        )?.[0]?.payload || null
      );
    }
    async catalog() {
      return this.request("/rest/v1/rpc/learning_catalog", {
        method: "POST",
        body: "{}",
      });
    }
    async plan() {
      this.needSession();
      const rows = await this.request(
        "/rest/v1/learning_entitlements?select=plan,expires_at&user_id=eq." +
          encodeURIComponent(this.session.user.id),
      );
      return (
        rows?.find(
          (r) => !r.expires_at || Date.parse(r.expires_at) > Date.now(),
        )?.plan || "free"
      );
    }
    async submitRequest(data) {
      this.needSession();
      const text = String(data.text || "").trim();
      if (!text && !data.imagePath) throw Error("question_required");
      if (text.length > 5000) throw Error("question_too_long");
      return this.rpc("learning_submit_request", {
        question_text: text,
        question_grade: Number(data.grade) || 9,
        question_language: data.language === "en" ? "en" : "he",
        image_path: data.imagePath || null,
        source_url: data.sourceUrl || null,
        client_request_id: data.id || crypto.randomUUID(),
      });
    }
    async uploadImage(file) {
      this.needSession();
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      )
        throw Error("image_limit");
      const ext = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        }[file.type],
        path = this.session.user.id + "/" + crypto.randomUUID() + "." + ext;
      await this.request("/storage/v1/object/learning-requests/" + path, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      return path;
    }
    async ownRequests() {
      this.needSession();
      return this.request(
        "/rest/v1/learning_requests?select=id,question_text,status,created_at,response_activity_id,response_note&order=created_at.desc&limit=30",
      );
    }
    async profile(nickname, avatar, grade) {
      this.needSession();
      return this.request("/rest/v1/learning_profiles", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          user_id: this.session.user.id,
          nickname,
          avatar,
          grade,
        }),
      });
    }
    async cohort(mode, grade, code) {
      return this.rpc("learning_join_cohort", {
        cohort_mode: mode,
        learner_grade: Number(grade),
        class_code: code || null,
      });
    }
    async progress() {
      return this.rpc("learning_progress");
    }
    async raceBoard(cohort) {
      return this.rpc("learning_race_board", { cohort_id: cohort });
    }
    async submitMastery(id, answer, transfer) {
      return this.rpc("learning_submit_mastery", {
        activity_id: id,
        first_answer: answer,
        transfer_answer: transfer,
      });
    }
    async createClass(name, grade, ids) {
      return this.rpc("learning_create_class", {
        class_name: name,
        learner_grade: Number(grade),
        activity_ids: ids,
      });
    }
    async isModerator() {
      return this.rpc("learning_is_moderator");
    }
    async reviewRequests() {
      return this.request(
        "/rest/v1/learning_requests?select=*&order=created_at.desc&limit=100",
      );
    }
    async updateRequest(id, status, responseActivity, note) {
      return this.rpc("learning_review_request", {
        request_id: id,
        next_status: status,
        response_activity: responseActivity || null,
        response_note: note || "",
      });
    }
    async publishActivity(activity) {
      return this.rpc("learning_publish_activity", { activity });
    }
    async signedImage(path) {
      return this.request("/storage/v1/object/sign/learning-requests/" + path, {
        method: "POST",
        body: JSON.stringify({ expiresIn: 300 }),
      });
    }
  }
  return { LearningService };
});
