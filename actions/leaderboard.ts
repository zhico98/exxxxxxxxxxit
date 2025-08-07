'use server'

import { put } from '@vercel/blob'; // 'del' fonksiyonu kaldırıldı

interface ScoreEntry {
  name: string;
  score: number;
  wallet?: string;
  timestamp: number;
}

const LEADERBOARD_BLOB_PATH = 'leaderboard.json';

/**
 * BLOB_READ_WRITE_TOKEN ortam değişkeninden blob depolama temel URL'sini türetir.
 * Bu, @vercel/blob paketindeki 'get' veya 'download' fonksiyonlarının mevcut olmadığı durumlarda bir geçici çözümdür.
 */
function getBlobBaseUrl(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN ortam değişkeni ayarlanmamış.');
  }
  // Beklenen format: vercel_blob_rw_YOUR_STORE_ID_YOUR_KEY
  const parts = token.split('_');
  // Token'ın yeterli parçaya sahip olup olmadığını ve beklenen ön ekle başlayıp başlamadığını kontrol et
  if (parts.length < 5 || parts[0] !== 'vercel' || parts[1] !== 'blob' || parts[2] !== 'rw') {
    throw new Error('Geçersiz BLOB_READ_WRITE_TOKEN formatı. Beklenen format: vercel_blob_rw_YOUR_STORE_ID_YOUR_KEY');
  }
  const storeId = parts[3]; // Düzeltildi: Store ID artık 3. dizinde olmalı
  if (!storeId) {
    throw new Error('BLOB_READ_WRITE_TOKEN formatı geçersiz: Store ID bulunamadı.');
  }
  return `https://${storeId}.public.blob.vercel-storage.com`;
}

export async function getLeaderboardScores(): Promise<ScoreEntry[]> {
  try {
    const blobUrl = `${getBlobBaseUrl()}/${LEADERBOARD_BLOB_PATH}`;
    // Her zaman en güncel veriyi almak için cache: 'no-store' eklendi
    const response = await fetch(blobUrl, { cache: 'no-store' });

    if (!response.ok) {
      // Blob henüz mevcut değilse (örneğin ilk çalıştırmada), 404 dönebilir.
      // Bu durumda hata fırlatmak yerine boş bir dizi döndür.
      if (response.status === 404) {
        console.warn(`Blob bulunamadı: ${blobUrl}. Boş liderlik tablosu döndürülüyor.`);
        return [];
      }
      // Daha iyi hata ayıklama için tam yanıt durumunu ve metnini logla
      const errorText = await response.text();
      throw new Error(`Blob çekilemedi: ${response.statusText} (Durum: ${response.status}). Yanıt: ${errorText}`);
    }

    const text = await response.text();
    return JSON.parse(text) as ScoreEntry[];
  } catch (error) {
    console.error('Liderlik tablosu skorları fetch ile alınamadı:', error);
    return [];
  }
}

export async function addLeaderboardScore(scoreData: { name: string; score: number; wallet?: string }): Promise<boolean> {
  try {
    const currentScores = await getLeaderboardScores();
    const newEntry: ScoreEntry = {
      ...scoreData,
      timestamp: Date.now(),
    };

    const updatedScores = [...currentScores, newEntry]
      .sort((a, b) => b.score - a.score) // Yüksek skordan düşüğe sırala
      .slice(0, 10); // Sadece ilk 10 skoru tut

    await put(LEADERBOARD_BLOB_PATH, JSON.stringify(updatedScores), {
      access: 'public',
      addRandomSuffix: false, // Dosya adını sabit tut
    });
    return true;
  } catch (error) {
    console.error('Liderlik tablosu skoru blob\'a eklenemedi:', error);
    return false;
  }
}
