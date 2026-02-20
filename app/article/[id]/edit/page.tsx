"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditArticlePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notAuthor, setNotAuthor] = useState(false);

    useEffect(() => {
        if (!id || status === "loading") return;

        const load = async () => {
            const res = await fetch(`/api/article/${id}`);
            if (!res.ok) {
                setError("Článek nenalezen");
                setLoading(false);
                return;
            }
            const data = await res.json();

            if (!session?.user?.id || data.authorId !== session.user.id) {
                setNotAuthor(true);
                setLoading(false);
                return;
            }

            setTitle(data.title);
            setContent(data.content);
            setPublishDate(new Date(data.publishDate).toISOString().split("T")[0]);
            setLoading(false);
        };

        load();
    }, [id, session, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch(`/api/article/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, publishDate }),
        });

        if (res.ok) {
            router.push(`/article/${id}`);
        } else {
            const data = await res.json();
            setError(data.error || "Úprava článku selhala");
        }
    };

    if (loading || status === "loading") return <div style={{ padding: "16px" }}>Načítání...</div>;
    if (notAuthor) return <div style={{ padding: "16px" }}><p>Nemáte oprávnění upravovat tento článek.</p><a href="/">← Zpět</a></div>;
    if (error) return <div style={{ padding: "16px" }}><p>{error}</p><a href="/">← Zpět</a></div>;

    return (
        <div style={{ padding: "16px" }}>
            <a href={`/article/${id}`}>← Zpět na článek</a>
            <h1>Upravit článek</h1>
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
                <button type="submit">Uložit změny</button>
            </form>
        </div>
    );
}
