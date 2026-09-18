export function readSiteConfig(env = process.env) {
  const email = (env.DEALERSHIP_EMAIL || "").trim();
  if (
    email &&
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      email,
    )
  ) {
    throw new Error("DEALERSHIP_EMAIL must be a valid email address");
  }
  let siteUrl;
  if (env.SITE_URL) {
    const url = new URL(env.SITE_URL);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        "SITE_URL must be an HTTPS origin without a path or credentials",
      );
    }
    siteUrl = url.origin;
  }
  const indexable = env.ALLOW_INDEXING === "true";
  if (indexable && (!siteUrl || !email)) {
    throw new Error("Indexing requires SITE_URL and DEALERSHIP_EMAIL");
  }
  return { email, siteUrl, indexable };
}
