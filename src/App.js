import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import AdminPanel from "./AdminPanel";

export default function App() {
 const [session, setSession] = useState(null);
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(true);
 const [role, setRole] = useState(null);

 // --- Kullanıcı girişini izleme ---
 useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
   setSession(data.session);
   setLoading(false);
  });

  const { data: authListener } = supabase.auth.onAuthStateChange(
   (_event, session) => {
    setSession(session);
   }
  );

  return () => authListener.subscription.unsubscribe();
 }, []);

 // --- Giriş fonksiyonu ---
 async function handleLogin(e) {
  e.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
   email,
   password,
  });

  if (error) {
   alert("Giriş başarısız: " + error.message);
   return;
  }

  // 👇 Giriş yapan kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser();

  // 👇 Kullanıcının okul_id'sini çek
  const { data: userData, error: userError } = await supabase
   .from('users')
   .select('okul_id, role')
   .eq('id', user.id)
   .single();

  if (userError || !userData) {
  alert("Kullanıcının okul bilgisi alınamadı");
  return;
  }

  setRole(userData.role);

  // 👇 KRİTİK DÜZELTME: RLS'nin okuyacağı 'my.okul_id' oturum değişkenini ayarla
    // Bu, RLS politikasındaki (current_setting('my.okul_id'::text)) ifadesi için gereklidir.
    const { error: rpcError } = await supabase.rpc('set_okul_id', {
        id: userData.okul_id,
        value: userData.okul_id.toString() // Parametrenin adını 'id' olarak değiştirdik
    });
    
    if (rpcError) {
        // Bu hata oluşursa bile kullanıcı oturum açmıştır, sadece RLS kısıtlamalı veriler gelmeyebilir.
        console.error("RPC Hata: Okul ID oturum ayarı başarısız oldu.", rpcError);
    }
    
  console.log("my.okul_id set edildi:", userData.okul_id);

  setEmail("");
  setPassword("");
 }

 // --- Çıkış fonksiyonu ---
 async function handleLogout() {
  await supabase.auth.signOut();
 }

 // --- Yükleniyor ekranı ---
 if (loading) {
  return (
   <div style={{ color: "white", padding: 40 }}>
    Yükleniyor...
   </div>
  );
 }

 // --- Kullanıcı GİRİŞ yapmamışsa Login ekranı göster ---
 if (!session) {
  return (
   <div
    style={{
     background: "#0f172a",
     minHeight: "100vh",
     display: "flex",
     alignItems: "center",
     justifyContent: "center",
     color: "white",
     fontFamily: "sans-serif",
    }}
   >
    <div
     style={{
      width: 350,
      padding: 30,
      background: "#1e293b",
      borderRadius: 12,
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
     }}
    >
     <h2 style={{ textAlign: "center", marginBottom: 20 }}>
      EDUSPACE – Yönetici Girişi
     </h2>

     <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
      <input
       type="email"
       placeholder="Email"
       value={email}
       required
       onChange={(e) => setEmail(e.target.value)}
       style={{
        padding: 10,
        borderRadius: 6,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "white",
       }}
      />

            <input
              type="password"
              placeholder="Şifre"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "white",
              }}
            />

            <button
              type="submit"
              style={{
                padding: 12,
                borderRadius: 6,
                background: "#38bdf8",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Kullanıcı GİRİŞ YAPMIŞSA AdminPanel'i göster ---
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          padding: 16,
          background: "#1e293b",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 20,
        }}
      >
        <b>EDUSPACE – Sınav Planlama</b>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Çıkış Yap
        </button>
      </div>

      {/* Ana Panel */}
      <AdminPanel session={session} role={role} />
    </div>
  );
}