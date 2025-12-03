import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AssignmentResult() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Atama sonuçlarını çek
  async function fetchResults() {
    const { data, error } = await supabase
      .from("atama_sonuclari")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      alert("Atama sonuçları alınırken hata: " + error.message);
      return;
    }

    setResults(data || []);
    setLoading(false);
  }

  // Atama sil
  async function deleteAssignment(id) {
    if (!window.confirm("Bu atamayı silmek istiyor musunuz?")) return;

    const { error } = await supabase
      .from("atama_sonuclari")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Silme hatası: " + error.message);
      return;
    }

    fetchResults();
  }

  // CSV indir
  function downloadCSV() {
    if (!results.length) {
      alert("İndirilecek veri yok.");
      return;
    }

    const headers = [
      "ID",
      "Talep ID",
      "Gün",
      "Saat",
      "Toplam Öğrenci",
      "Derslik (JSON)",
    ];

    const rows = results.map((r) => [
      r.id,
      r.talep_id,
      r.gun,
      r.saat,
      r.toplam_ogrenci,
      typeof r.derslik === "string" ? r.derslik : JSON.stringify(r.derslik),
    ]);

    const csv =
      [headers, ...rows]
        .map((row) =>
          row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "atama_sonuclari.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return <p style={{ color: "white", padding: 20 }}>Yükleniyor...</p>;
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Atama Sonuçları</h2>

      <button
        onClick={downloadCSV}
        style={{
          padding: "8px 16px",
          background: "#38bdf8",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        CSV Olarak İndir
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Talep ID</th>
            <th>Gün</th>
            <th>Saat</th>
            <th>Öğrenci</th>
            <th>Derslik</th>
            <th>Sil</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, idx) => (
            <tr key={r.id}>
              <td>{idx + 1}</td>
              <td>{r.talep_id}</td>
              <td>{r.gun}</td>
              <td>{r.saat}</td>
              <td>{r.toplam_ogrenci}</td>
              <td>
                {typeof r.derslik === "string"
                  ? r.derslik
                  : JSON.stringify(r.derslik)}
              </td>
              <td>
                <button
                  onClick={() => deleteAssignment(r.id)}
                  style={{
                    background: "red",
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
