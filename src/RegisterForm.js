import { useState } from "react";
import { supabase } from "./supabaseClient"; // senin Supabase client dosyan

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [okulId, setOkulId] = useState("");

  async function registerUser(email, password, okul_id) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert("Kayıt başarısız: " + signUpError.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      alert("Kullanıcı ID alınamadı");
      return;
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert([{ id: userId, email, okul_id }]);

    if (insertError) {
      alert("Users tablosuna ekleme başarısız: " + insertError.message);
      return;
    }

    alert("Kayıt başarılı!");
    setEmail("");
    setPassword("");
    setOkulId("");
  }

  return (
    <div>
      <h2>Yeni Kullanıcı Kaydı</h2>
      <input
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="number"
        placeholder="Okul ID"
        value={okulId}
        onChange={(e) => setOkulId(e.target.value)}
      />
      <button onClick={() => registerUser(email, password, parseInt(okulId))}>
        Kaydet
      </button>
    </div>
  );
}
