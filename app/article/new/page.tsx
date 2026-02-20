"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
    const [error, setError] = useState("");

    if (status === "loading") return <div style={{ padding: "16px" }}>Načítání...</div>;
    if (!session?.user) {
        return (
            <div style={{ padding: "16px" }}>
                <p>Musíte být přihlášeni pro vytvoření článku.</p>
                <a href="/login">Přihlásit se</a>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/article", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, publishDate }),
        });

        if (res.ok) {
            const article = await res.json();
            router.push(`/article/${article.id}`);
        } else {
            const data = await res.json();
            setError(data.error || "Vytvoření článku selhalo");
        }
    };

    return (
        <div style={{ padding: "16px" }}>
            <a href="/">← Zpět</a>
            <h1>Nový článek</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "8px" }}>
                    <label>Název:</label><br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: "100%" }}
                    />
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <label>Obsah:</label><br />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={10}
                        style={{ width: "100%" }}
                    />
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <label>Datum publikace:</label><br />
                    <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Vytvořit článek</button>
            </form>
        </div>
    );
}
