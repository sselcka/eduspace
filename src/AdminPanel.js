import React, { useEffect, useState } from 'react'
import RegisterForm from "./RegisterForm";
import { supabase } from './supabaseClient'


export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('admin')

  // Tables
  const [hocalar, setHocalar] = useState([])
  const [bolumler, setBolumler] = useState([])
  const [dersler, setDersler] = useState([])
  const [derslikler, setDerslikler] = useState([])
  const [sinavTalepleri, setSinavTalepleri] = useState([])
  const [atamaSonuclari, setAtamaSonuclari] = useState([])

  // Admin inputs
  const [t_sicil, setT_sicil] = useState('')
  const [t_adsoyad, setT_adsoyad] = useState('')
  const [d_ad, setD_ad] = useState('')

  const [c_ad, setC_ad] = useState('')
  const [c_tur, setC_tur] = useState('TEORİK SINIF')
  const [c_kapasite, setC_kapasite] = useState('')

  const [courseBolumId, setCourseBolumId] = useState('')
  const [courseKodu, setCourseKodu] = useState('')
  const [courseSinif, setCourseSinif] = useState('')

  // Teacher form (sınav talebi)
  const [selBolum, setSelBolum] = useState('')
  const [selHocaId, setSelHocaId] = useState('')
  const [selDersId, setSelDersId] = useState('')
  const [selSinif, setSelSinif] = useState('')
  const [ogrenciSayisi, setOgrenciSayisi] = useState('')
  const [sure, setSure] = useState(40)
  const [beklenenTur, setBeklenenTur] = useState('')
  const [gunOptions] = useState(['PZT', 'SALI', 'CARS', 'PERS', 'CUMA'])
  const [musaitGunler, setMusaitGunler] = useState([])

  // utility: fetch all lists from supabase
  async function fetchAll() {
    // parallel fetch
    const [hRes, bRes, drRes, crRes, stRes, aRes] = await Promise.all([
      supabase.from('hocalar').select('*').order('id'),
      supabase.from('bolumler').select('*').order('id'),
      supabase.from('dersler').select('*').order('id'),
      supabase.from('derslikler').select('*').order('id'),
      supabase.from('sinav_talepleri').select('*').order('id'),
      supabase.from('atama_sonuclari').select('*').order('id')
    ])

    if (hRes.error) console.error('hocalar fetch error', hRes.error)
    else setHocalar(hRes.data || [])

    if (bRes.error) console.error('bolumler fetch error', bRes.error)
    else setBolumler(bRes.data || [])

    if (drRes.error) console.error('dersler fetch error', drRes.error)
    else setDersler(drRes.data || [])

    if (crRes.error) console.error('derslikler fetch error', crRes.error)
    else setDerslikler(crRes.data || [])

    if (stRes.error) console.error('sinav_talepleri fetch error', stRes.error)
    else setSinavTalepleri(stRes.data || [])

    if (aRes.error) console.error('atama_sonuclari fetch error', aRes.error)
    else setAtamaSonuclari(aRes.data || [])
  }

  useEffect(() => {
    fetchAll()

    // realtime subscriptions (isteğe bağlı - güncelleme anında UI'ı yeniler)
    const sub1 = supabase
      .channel('public:changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hocalar' }, () => { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bolumler' }, () => { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dersler' }, () => { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'derslikler' }, () => { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sinav_talepleri' }, () => { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atama_sonuclari' }, () => { fetchAll() })
      .subscribe()

    return () => {
      supabase.removeChannel(sub1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------- CRUD: Hocalar -------------------------
  async function addHoca(e) {
    e?.preventDefault?.()
    if (!t_sicil || !t_adsoyad) { alert('Sicil ve isim girin'); return }
    const { error } = await supabase.from('hocalar').insert([{ okul_id: 1, ad: t_adsoyad.trim(), sicil: t_sicil.trim() }])
    if (error) return alert('Hoca ekleme hatası: ' + error.message)
    setT_adsoyad(''); setT_sicil('')
    await fetchAll()
  }

  async function deleteHoca(id) {
    if (!window.confirm('Hocayı silmek istiyor musunuz?')) return
    const { error } = await supabase.from('hocalar').delete().eq('id', id)
    if (error) return alert('Hoca silme hatası: ' + error.message)
    await fetchAll()
  }

  // ------------------------- CRUD: Bolumler -------------------------
  async function addBolum(e) {
    e?.preventDefault?.()
    if (!d_ad) { alert('Bölüm adı girin'); return }
    const { error } = await supabase.from('bolumler').insert([{ okul_id: 1, ad: d_ad.trim() }])
    if (error) return alert('Bölüm ekleme hatası: ' + error.message)
    setD_ad(''); await fetchAll()
  }

  async function deleteBolum(id) {
    if (!window.confirm('Bölümü silmek istiyor musunuz?')) return
    const { error } = await supabase.from('bolumler').delete().eq('id', id)
    if (error) return alert('Bölüm silme hatası: ' + error.message)
    await fetchAll()
  }

  // ------------------------- CRUD: Derslikler -------------------------
  async function addDerslik(e) {
    e?.preventDefault?.()
    if (!c_ad || !c_tur || !c_kapasite) { alert('Tüm derslik alanlarını doldurun'); return }
    const kapasiteNum = parseInt(c_kapasite, 10)
    if (Number.isNaN(kapasiteNum)) { alert('Kapasite sayı olmalı'); return }
    const { error } = await supabase.from('derslikler').insert([{ okul_id: 1, ad: c_ad.trim(), tur: c_tur.trim(), kapasite: kapasiteNum }])
    if (error) return alert('Derslik ekleme hatası: ' + error.message)
    setC_ad(''); setC_kapasite(''); setC_tur('TEORİK SINIF')
    await fetchAll()
  }

  async function deleteDerslik(id) {
    if (!window.confirm('Dersliği silmek istiyor musunuz?')) return
    const { error } = await supabase.from('derslikler').delete().eq('id', id)
    if (error) return alert('Derslik silme hatası: ' + error.message)
    await fetchAll()
  }

  // ------------------------- CRUD: Dersler -------------------------
  async function deleteDers(id) {
    if (!window.confirm('Dersi silmek istiyor musunuz?')) return
    const { error } = await supabase.from('dersler').delete().eq('id', id)
    if (error) return alert('Ders silme hatası: ' + error.message)
    await fetchAll()
  }

  async function addDers(e) {
    e?.preventDefault?.()

    if (!courseBolumId || !courseKodu || !courseSinif) {
      alert('Tüm ders alanlarını doldurun')
      return
    }

    const { error } = await supabase.from('dersler').insert([{
      bolum_id: Number(courseBolumId),
      kod: courseKodu.trim(),
      sinif: parseInt(courseSinif, 10)
    }])

    if (error) return alert('Ders ekleme hatası: ' + error.message)

    setCourseBolumId(''); setCourseKodu(''); setCourseSinif('')
    await fetchAll()
  }

  // ------------------------- Öğretmen: Sınav Talebi Ekle -------------------------
  function toggleGun(kisa) {
    setMusaitGunler(prev => prev.includes(kisa) ? prev.filter(x => x !== kisa) : [...prev, kisa])
  }

  async function addExamRequest(e) {
    e?.preventDefault?.()
    if (!selBolum || !selHocaId || !selDersId || !ogrenciSayisi || musaitGunler.length === 0) {
      alert('Lütfen bölüm, hoca, ders, öğrenci sayısı ve en az bir gün seçin.')
      return
    }
    const ders = dersler.find(d => d.id === Number(selDersId))
    const { error } = await supabase.from('sinav_talepleri').insert([{
      hoca_id: Number(selHocaId),
      bolum_id: Number(selBolum),
      ders_id: Number(selDersId),
      sinif: ders?.sinif || null,
      ogrenci_sayisi: parseInt(ogrenciSayisi, 10),
      sure: parseInt(sure, 10),
      beklenen_tur: beklenenTur || null,
      musait_gunler: musaitGunler,
      durum: 'BEKLIYOR'
    }])
    if (error) return alert('Sınav talebi ekleme hatası: ' + error.message)
    // reset form
    setSelBolum(''); setSelHocaId(''); setSelDersId(''); setOgrenciSayisi(''); setSure(40); setBeklenenTur(''); setMusaitGunler([])
    await fetchAll()
    alert('Sınav talebi eklendi')
  }

  async function deleteExamRequest(id) {
    if (!window.confirm('Sınav talebini silmek istiyor musunuz?')) return
    const { error } = await supabase.from('sinav_talepleri').delete().eq('id', id)
    if (error) return alert('Sınav talebi silme hatası: ' + error.message)
    await fetchAll()
  }

  // ------------------------- OTOMATİK ATAMA (Basit mantık) -------------------------
  async function otomatikAtama() {
    // fetch fresh
    const { data: talepData, error: talepErr } = await supabase.from('sinav_talepleri').select('*').eq('durum', 'BEKLIYOR').order('id')
    const { data: derslikData, error: derslikErr } = await supabase.from('derslikler').select('*').order('kapasite', { ascending: true })

    if (talepErr) return alert('Talep çekme hatası: ' + talepErr.message)
    if (derslikErr) return alert('Derslik çekme hatası: ' + derslikErr.message)
    if (!talepData?.length) return alert('Atanacak talep yok')

    // prepare occupancy map: day -> slots(8) -> assigned group keys to prevent same group in same slot
    const days = ['PZT', 'SALI', 'CARS', 'PERS', 'CUMA']
    const slotsPerDay = 8
    const occupancy = {}
    days.forEach(d => { occupancy[d] = Array.from({ length: slotsPerDay }, () => ({ groupKeys: new Set(), teacherIds: new Set() })) })

    const examCountPerDay = {}
    days.forEach(d => examCountPerDay[d] = {})

    const newAssignments = []

    function pickRoomsFor(nStudents, preferType) {
      const candidates = preferType ? derslikData.filter(r => (r.tur || '').toString().toLowerCase() === (preferType || '').toLowerCase()) : derslikData.slice()
      if (!candidates.length) candidates.push(...derslikData)

      // try single
      const single = candidates.find(r => r.kapasite >= nStudents)
      if (single) return [single]

      // try combinations of two
      for (let a = 0; a < candidates.length; a++) {
        for (let b = a + 1; b < candidates.length; b++) {
          const sum = (candidates[a].kapasite || 0) + (candidates[b].kapasite || 0)
          if (sum >= nStudents) return [candidates[a], candidates[b]]
        }
      }

      // fallback: largest rooms until sum satisfies
      const sorted = [...candidates].sort((x, y) => (y.kapasite || 0) - (x.kapasite || 0))
      const sel = []
      let total = 0
      for (const r of sorted) {
        sel.push(r); total += (r.kapasite || 0)
        if (total >= nStudents) return sel
      }
      return null
    }

    for (const talep of talepData) {
      const durationSlots = (talep.sure || 0) > 60 ? 2 : 1
      const groupKey = `${talep.bolum_id || talep.bolum}_${talep.ders_id}_${talep.sinif}`
      let placed = false

      // try each requested day
      const musait = Array.isArray(talep.musait_gunler) && talep.musait_gunler.length ? talep.musait_gunler : days
      for (const d of musait) {
        // group count rule
        const curCount = examCountPerDay[d][groupKey] || 0
        if (curCount >= 3) continue

        // iterate slots
        for (let s = 0; s <= slotsPerDay - durationSlots; s++) {
          // check availability for teacher and group adjacent rules
          let ok = true
          for (let ss = s; ss < s + durationSlots; ss++) {
            if (occupancy[d][ss].groupKeys.has(groupKey)) { ok = false; break }
            if (occupancy[d][ss].teacherIds.has(talep.hoca_id)) { ok = false; break }
          }
          if (!ok) continue

          // pick rooms
          const rooms = pickRoomsFor(talep.ogrenci_sayisi || 0, talep.beklenen_tur)
          if (!rooms) continue

          // need helpers = rooms.length - 1 ; find available teachers (simple: any teachers not busy)
          const disableTeachers = new Set([talep.hoca_id])
          const freeHelpers = hocalar.filter(h => !disableTeachers.has(h.id) && (() => {
            for (let ss = s; ss < s + durationSlots; ss++) {
              if (occupancy[d][ss].teacherIds.has(h.id)) return false
            }
            return true
          })())

          if (freeHelpers.length < Math.max(0, rooms.length - 1)) continue

          // distribute students per room (big->small)
          const sortedRooms = rooms.slice().sort((a, b) => (b.kapasite || 0) - (a.kapasite || 0))
          let remaining = talep.ogrenci_sayisi || 0
          const perRoom = new Array(rooms.length).fill(0)
          sortedRooms.forEach((r, idx) => {
            const assign = Math.min(r.kapasite || 0, remaining)
            perRoom[idx] = assign
            remaining -= assign
          })
          if (remaining > 0) continue

          // create assignment rows
          const helperIds = freeHelpers.slice(0, Math.max(0, rooms.length - 1)).map(h => h.id)
          const invigilators = [talep.hoca_id, ...helperIds]

          // build derslik summary
          const derslikSummary = rooms.map(r => ({ id: r.id, ad: r.ad, kapasite: r.kapasite, tur: r.tur }))

          const startHour = 9 + s
          const endHour = startHour + durationSlots
          const saatStr = `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`

          newAssignments.push({
            talep_id: talep.id,
            gun: d,
            slot: s,
            saat: saatStr,
            derslikler: derslikSummary,
            toplam_ogrenci: talep.ogrenci_sayisi,
            sure: talep.sure
          })

          // mark occupancy
          for (let ss = s; ss < s + durationSlots; ss++) {
            invigilators.forEach(tid => occupancy[d][ss].teacherIds.add(tid))
            occupancy[d][ss].groupKeys.add(groupKey)
          }

          examCountPerDay[d][groupKey] = (examCountPerDay[d][groupKey] || 0) + 1
          placed = true
          break
        }
        if (placed) break
      } // end for each day

      // if placed -> update talep durum 'ATANDI'
      if (placed) {
        const { error } = await supabase.from('sinav_talepleri').update({ durum: 'ATANDI' }).eq('id', talep.id)
        if (error) console.warn('talep durum update hata', error)
      }
    } // end for each talep

    // insert generated assignments into atama_sonuclari table
    for (const a of newAssignments) {
      const { error } = await supabase.from('atama_sonuclari').insert([{
        talep_id: a.talep_id,
        gun: a.gun,
        saat: a.saat,
        derslik: JSON.stringify(a.derslikler),
        toplam_ogrenci: a.toplam_ogrenci,
        sure: a.sure
      }])
      if (error) console.warn('atama insert error', error)
    }

    await fetchAll()
    alert(`Atama tamamlandı. ${newAssignments.length} atama kaydı oluşturuldu.`)
  }

  async function deleteAssignment(id) {
    if (!window.confirm('Atama silinsin mi?')) return
    const { error } = await supabase.from('atama_sonuclari').delete().eq('id', id)
    if (error) return alert('Atama silme hatası: ' + error.message)
    await fetchAll()
  }

// ------------------------- Render UI -------------------------
return (
  <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', color: '#e5e7eb', fontFamily: 'system-ui' }}>
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>

      <button
        onClick={() => setActiveTab('admin')}
        style={{
          padding: 8,
          background: activeTab === 'admin' ? '#38bdf8' : '#020617',
          color: activeTab === 'admin' ? 'black' : 'white',   // ✔ yazı rengi eklendi
          borderRadius: 6
        }}
      >
        Yönetici
      </button>

      <button
        onClick={() => setActiveTab('teacher')}
        style={{
          padding: 8,
          background: activeTab === 'teacher' ? '#38bdf8' : '#020617',
          color: activeTab === 'teacher' ? 'black' : 'white', // ✔ yazı rengi eklendi
          borderRadius: 6
        }}
      >
        Öğretmen
      </button>

      <button
        onClick={() => setActiveTab('results')}
        style={{
          padding: 8,
          background: activeTab === 'results' ? '#38bdf8' : '#020617',
          color: activeTab === 'results' ? 'black' : 'white', // ✔ yazı rengi eklendi
          borderRadius: 6
        }}
      >
        Atama Sonuçları
      </button>

    </div>

      {activeTab === 'admin' && (
        <section>
           <h2>Yönetici Paneli</h2>

          {/* Yeni Kullanıcı Kaydı (sadece admin sekmesinde görünür) */}
          <div style={{ marginTop: 8, padding: 12, border: '1px solid #1f2937', borderRadius: 8 }}></div>
            <RegisterForm />    

          {/* Hoca Ekle */}
          <div style={{ marginTop: 8, padding: 12, border: '1px solid #1f2937', borderRadius: 8 }}>
            <h3>Hoca Ekle</h3>
            <form onSubmit={addHoca} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input placeholder="Sicil No" value={t_sicil} onChange={e => setT_sicil(e.target.value)} />
              <input placeholder="Ad Soyad" value={t_adsoyad} onChange={e => setT_adsoyad(e.target.value)} />
              <button type="submit">Hocayı Ekle</button>
            </form>

            <div style={{ marginTop: 10 }}>
              <h4>Mevcut Hocalar</h4>
              <ul>
                {hocalar.map(h => (
                  <li key={h.id} style={{ cursor: 'pointer' }}>
                    {h.ad} - Sicil: {h.sicil} <button onClick={() => deleteHoca(h.id)}>Sil</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bölüm Ekle */}
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #1f2937', borderRadius: 8 }}>
            <h3>Bölüm Ekle</h3>
            <form onSubmit={addBolum} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input placeholder="Bölüm Adı" value={d_ad} onChange={e => setD_ad(e.target.value)} />
              <button type="submit">Bölüm Ekle</button>
            </form>

            <div style={{ marginTop: 10 }}>
              <h4>Mevcut Bölümler</h4>
              <ul>
                {bolumler.map(b => (
                  <li key={b.id} style={{ cursor: 'pointer' }}>
                    {b.ad} <button onClick={() => deleteBolum(b.id)}>Sil</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Derslik Ekle */}
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #1f2937', borderRadius: 8 }}>
            <h3>Derslik Ekle</h3>
            <form onSubmit={addDerslik} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input placeholder="Derslik Adı (Örn C-101)" value={c_ad} onChange={e => setC_ad(e.target.value)} />
              <select value={c_tur} onChange={e => setC_tur(e.target.value)}>
                <option>TEORİK SINIF</option>
                <option>BİLGİSAYAR LAB</option>
                <option>LABORATUVAR</option>
              </select>
              <input placeholder="Kapasite" value={c_kapasite} onChange={e => setC_kapasite(e.target.value)} />
              <button type="submit">Derslik Ekle</button>
            </form>

            <div style={{ marginTop: 10 }}>
              <h4>Mevcut Derslikler</h4>
              <ul>
                {derslikler.map(d => (
                  <li key={d.id}>
                    {d.ad} ({d.tur}) - Kap: {d.kapasite} <button onClick={() => deleteDerslik(d.id)}>Sil</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ders Ekle */}
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #1f2937', borderRadius: 8 }}>
            <h3>Ders Ekle</h3>
            <form onSubmit={addDers} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={courseBolumId} onChange={e => setCourseBolumId(e.target.value)}>
                <option value=''>Bölüm seç...</option>
                {bolumler.map(b => <option key={b.id} value={b.id}>{b.ad}</option>)}
              </select>
              <input placeholder="Ders Kodu (IAT201)" value={courseKodu} onChange={e => setCourseKodu(e.target.value)} />
              <input placeholder="Kaçıncı Sınıf" value={courseSinif} onChange={e => setCourseSinif(e.target.value)} />
              <button type="submit">Ders Ekle</button>
            </form>

            <div style={{ marginTop: 10 }}>
              <h4>Mevcut Dersler</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th>#</th><th>Bölüm</th><th>Kod</th><th>Sınıf</th><th>İşlem</th></tr></thead>
                <tbody>
                  {dersler.map((d, idx) => (
                    <tr key={d.id}>
                      <td>{idx + 1}</td>
                      <td>{d.bolum_ad || (bolumler.find(b => b.id === d.bolum_id)?.ad)}</td>
                      <td>{d.kod}</td>
                      <td>{d.sinif}</td>
                      <td><button onClick={() => deleteDers(d.id)}>Sil</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Otomatik Atama */}
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #1f2937', borderRadius: 8 }}>
            <h3>Otomatik Sınıf Atama</h3>
            <p className="muted">Kaydedilmiş sınav taleplerini 09.00–17.00 arasında 1 saatlik slotlara yerleştirir.</p>
            <button onClick={otomatikAtama}>OTOMATİK SINIF ATAMA</button>
          </div>
        </section>
      )}

      {activeTab === 'teacher' && (
        <section>
          <h2>Öğretmen Paneli</h2>
          <form onSubmit={addExamRequest} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={selBolum} onChange={e => setSelBolum(e.target.value)}>
                <option value=''>Bölüm seç...</option>
                {bolumler.map(b => <option key={b.id} value={b.id}>{b.ad}</option>)}
              </select>

              <select value={selHocaId} onChange={e => setSelHocaId(e.target.value)}>
                <option value=''>Hoca seç...</option>
                {hocalar.map(h => <option key={h.id} value={h.id}>{h.sicil} - {h.ad}</option>)}
              </select>

              <select value={selDersId} onChange={e => setSelDersId(e.target.value)}>
                <option value=''>Önce bölüm seçin</option>
                {dersler.filter(dc => dc.bolum_id === Number(selBolum)).map(d => <option key={d.id} value={d.id}>{d.kod}</option>)}
              </select>

              <input placeholder="Kaçıncı Sınıf" value={selSinif} onChange={e => setSelSinif(e.target.value)} disabled />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <select value={beklenenTur} onChange={e => setBeklenenTur(e.target.value)}>
                <option value=''>Fark etmez</option>
                {[...new Set(derslikler.map(x => x.tur))].map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <input placeholder="Sınava girecek öğrenci sayısı" value={ogrenciSayisi} onChange={e => setOgrenciSayisi(e.target.value)} />

              <select value={sure} onChange={e => setSure(Number(e.target.value))}>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={60}>60</option>
                <option value={80}>80</option>
              </select>
            </div>

            <div>
              <label>Hangi Günler Uygun?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {gunOptions.map(g => (
                  <label key={g}><input type="checkbox" checked={musaitGunler.includes(g)} onChange={() => toggleGun(g)} /> {g}</label>
                ))}
              </div>
            </div>

            <div>
              <button type="submit">Sınav Talebi Ekle</button>
            </div>
          </form>

          <h3>Kaydedilmiş Sınav Talepleri</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>#</th><th>Hoca</th><th>Bölüm</th><th>Ders</th><th>Sınıf</th><th>Öğrenci</th><th>Süre</th><th>Günler</th><th>Durum</th><th>İşlem</th></tr></thead>
            <tbody>
              {sinavTalepleri.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td>{hocalar.find(h => h.id === t.hoca_id)?.ad || '-'}</td>
                  <td>{bolumler.find(b => b.id === t.bolum_id)?.ad || '-'}</td>
                  <td>{dersler.find(d => d.id === t.ders_id)?.kod || t.ders_kodu || '-'}</td>
                  <td>{t.sinif}</td>
                  <td>{t.ogrenci_sayisi}</td>
                  <td>{t.sure} dk</td>
                  <td>{Array.isArray(t.musait_gunler) ? t.musait_gunler.join(', ') : ''}</td>
                  <td>{t.durum}</td>
                  <td><button onClick={() => deleteExamRequest(t.id)}>Sil</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'results' && (
        <section>
          <h2>Atama Sonuçları</h2>
          <p>Otomatik atama sonrası atama_sonuclari tablosu görüntülenir.</p>
          <button onClick={() => {
            if (!atamaSonuclari.length) { alert('Henüz atama yok'); return }
            const header = ['ID','Talep ID','Gün','Saat','Toplam Öğrenci','Derslik (JSON)']
            const rows = [header, ...atamaSonuclari.map(a => [a.id, a.talep_id, a.gun, a.saat, a.toplam_ogrenci, a.derslik])]
            const csv = rows.map(r => r.map(cell => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(';')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'atama_sonuclari.csv'; a.click(); URL.revokeObjectURL(url)
          }}>Excel (CSV) Olarak İndir</button>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead><tr><th>#</th><th>Talep ID</th><th>Gün</th><th>Saat</th><th>Toplam</th><th>Derslik</th><th>İşlem</th></tr></thead>
            <tbody>
              {atamaSonuclari.map((a, idx) => (
                <tr key={a.id}>
                  <td>{idx + 1}</td>
                  <td>{a.talep_id}</td>
                  <td>{a.gun}</td>
                  <td>{a.saat}</td>
                  <td>{a.toplam_ogrenci}</td>
                  <td>{typeof a.derslik === 'string' ? a.derslik : JSON.stringify(a.derslik)}</td>
                  <td><button onClick={() => deleteAssignment(a.id)}>Sil</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
