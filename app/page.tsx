import Header from "./components/Header";

export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/article`, {
    cache: "no-store",
  });
  const articles = await res.json();

  return (
    <div className="page-wrapper">
      <Header />
      <main className="container" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
        <div className="animate-in" style={{ marginBottom: "40px" }}>
          <h1>Nejčtenější články</h1>
          <span className="accent-line" />
        </div>

        {articles.length === 0 && (
          <p className="animate-in stagger-1" style={{ fontSize: "1.05rem" }}>
            Zatím žádné články. Buďte první, kdo něco napíše!
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {articles.map((article: any, i: number) => (
            <a
              key={article.id}
              href={`/article/${article.id}`}
              className={`card card-interactive animate-in stagger-${Math.min(i + 1, 8)}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <h3 style={{ marginBottom: "10px", fontSize: "1.3rem" }}>
                {article.title}
              </h3>
              <p style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                marginBottom: "14px",
                color: "var(--color-text-secondary)",
              }}>
                {article.content.substring(0, 180)}...
              </p>
              <div className="meta" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span className="meta-accent">{article.author.name}</span>
                <span style={{ color: "var(--color-border)" }}>·</span>
                <span>{new Date(article.publishDate).toLocaleDateString("cs-CZ")}</span>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
