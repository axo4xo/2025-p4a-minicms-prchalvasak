"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function ratingLabel(rating: number): string {
    if (rating === 0) return "odpad!";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function ArticlePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // review form
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewError, setReviewError] = useState("");

    // edit review
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");

    const fetchArticle = async () => {
        try {
            const res = await fetch(`/api/article/${id}`);
            if (!res.ok) {
                setError("Článek nenalezen");
                return;
            }
            const data = await res.json();
            setArticle(data);
        } catch {
            setError("Chyba při načítání článku");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchArticle();
    }, [id]);

    const handleDeleteArticle = async () => {
        if (!confirm("Opravdu chcete smazat tento článek?")) return;
        const res = await fetch(`/api/article/${id}`, { method: "DELETE" });
        if (res.ok) {
            router.push("/");
        } else {
            const data = await res.json();
            alert(data.error || "Smazání selhalo");
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError("");

        const res = await fetch("/api/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                articleId: id,
                rating: reviewRating,
                comment: reviewComment,
            }),
        });

        if (res.ok) {
            setReviewComment("");
            setReviewRating(5);
            fetchArticle();
        } else {
            const data = await res.json();
            setReviewError(data.error || "Vytvoření recenze selhalo");
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Opravdu chcete smazat tuto recenzi?")) return;
        const res = await fetch("/api/review", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: reviewId }),
        });
        if (res.ok) {
            fetchArticle();
        } else {
            const data = await res.json();
            alert(data.error || "Smazání recenze selhalo");
        }
    };

    const handleEditReview = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/review", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editingReviewId,
                rating: editRating,
                comment: editComment,
            }),
        });
        if (res.ok) {
            setEditingReviewId(null);
            fetchArticle();
        } else {
            const data = await res.json();
            alert(data.error || "Úprava recenze selhala");
        }
    };

    if (loading) return <div style={{ padding: "16px" }}>Načítání...</div>;
    if (error) return <div style={{ padding: "16px" }}><p>{error}</p><a href="/">← Zpět</a></div>;
    if (!article) return null;

    const isAuthor = session?.user?.id === article.authorId;
    const avgRating = article.reviews.length > 0
        ? (article.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / article.reviews.length).toFixed(1)
        : null;

    return (
        <div style={{ padding: "16px" }}>
            <a href="/">← Zpět na články</a>

            <h1>{article.title}</h1>
            <p><strong>Autor:</strong> {article.author.name}</p>
            <p><strong>Publikováno:</strong> {new Date(article.publishDate).toLocaleDateString("cs-CZ")}</p>

            {isAuthor && (
                <div style={{ margin: "12px 0" }}>
                    <a href={`/article/${id}/edit`}><button>Upravit článek</button></a>
                    {" "}
                    <button onClick={handleDeleteArticle}>Smazat článek</button>
                </div>
            )}

            <hr />
            <div style={{ whiteSpace: "pre-wrap" }}>{article.content}</div>

            <hr />
            <h2>Recenze {avgRating && `(průměr: ${avgRating}/5)`}</h2>

            {article.reviews.length === 0 && <p>Zatím žádné recenze.</p>}

            {article.reviews.map((review: any) => {
                const isReviewAuthor = session?.user?.id === review.authorId;

                if (editingReviewId === review.id) {
                    return (
                        <div key={review.id} style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "8px" }}>
                            <form onSubmit={handleEditReview}>
                                <div>
                                    <label>Hodnocení: </label>
                                    <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))}>
                                        <option value={0}>0 - odpad!</option>
                                        <option value={1}>1 ★</option>
                                        <option value={2}>2 ★★</option>
                                        <option value={3}>3 ★★★</option>
                                        <option value={4}>4 ★★★★</option>
                                        <option value={5}>5 ★★★★★</option>
                                    </select>
                                </div>
                                <div>
                                    <textarea
                                        value={editComment}
                                        onChange={(e) => setEditComment(e.target.value)}
                                        rows={3}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <button type="submit">Uložit</button>
                                {" "}
                                <button type="button" onClick={() => setEditingReviewId(null)}>Zrušit</button>
                            </form>
                        </div>
                    );
                }

                return (
                    <div key={review.id} style={{ border: "1px solid #eee", padding: "12px", marginBottom: "8px" }}>
                        <p>
                            <strong>{review.rating === 0 ? "odpad!" : ratingLabel(review.rating)}</strong>
                            {" "}({review.rating}/5)
                        </p>
                        <p>{review.comment}</p>
                        <small>
                            {review.author.name} | {new Date(review.createdAt).toLocaleDateString("cs-CZ")}
                        </small>
                        {isReviewAuthor && (
                            <div style={{ marginTop: "8px" }}>
                                <button onClick={() => {
                                    setEditingReviewId(review.id);
                                    setEditRating(review.rating);
                                    setEditComment(review.comment);
                                }}>Upravit</button>
                                {" "}
                                <button onClick={() => handleDeleteReview(review.id)}>Smazat</button>
                            </div>
                        )}
                    </div>
                );
            })}

            {session?.user && (
                <>
                    <h3>Napsat recenzi</h3>
                    {reviewError && <p style={{ color: "red" }}>{reviewError}</p>}
                    <form onSubmit={handleSubmitReview}>
                        <div>
                            <label>Hodnocení: </label>
                            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                                <option value={0}>0 - odpad!</option>
                                <option value={1}>1 ★</option>
                                <option value={2}>2 ★★</option>
                                <option value={3}>3 ★★★</option>
                                <option value={4}>4 ★★★★</option>
                                <option value={5}>5 ★★★★★</option>
                            </select>
                        </div>
                        <div>
                            <textarea
                                placeholder="Váš komentář..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={3}
                                style={{ width: "100%" }}
                                required
                            />
                        </div>
                        <button type="submit">Odeslat recenzi</button>
                    </form>
                </>
            )}

            {!session?.user && (
                <p><a href="/login">Přihlaste se</a> pro přidání recenze.</p>
            )}
        </div>
    );
}