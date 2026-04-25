# =============================================================================
# TEST POWERSHELL — Adaptive Learning RAG API
# 13 test case sesuai corpus yang tersedia
# Jalankan: .\test_curl.ps1
# Atau copy-paste satu blok sesuai kebutuhan
# =============================================================================

$BASE_URL = "http://localhost:8000"

# Helper function
function Invoke-Module {
    param(
        [string]$Label,
        [string]$Body
    )
    Write-Host ""
    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host " $Label" -ForegroundColor Cyan
    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "$BASE_URL/generate-module" `
        -Method POST `
        -ContentType "application/json" `
        -Body $Body
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
}

# Health check
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " HEALTH CHECK" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Invoke-RestMethod -Uri "$BASE_URL/health" | ConvertTo-Json

# =============================================================================
# MATEMATIKA
# =============================================================================

Invoke-Module "1. Matematika — Penjumlahan | Kelas 1 | Difficulty 1 | Disleksia | engaged" '{
    "topic": "penjumlahan bilangan 1 sampai 5",
    "grade": 1,
    "disability_mode": "disleksia",
    "difficulty": 1,
    "emotion_state": "engaged",
    "child_name": "Budi"
}'

Invoke-Module "2. Matematika — Penjumlahan | Kelas 2 | Difficulty 2 | Tunanetra | confused" '{
    "topic": "penjumlahan bilangan sampai 20",
    "grade": 2,
    "disability_mode": "tunanetra",
    "difficulty": 2,
    "emotion_state": "confused",
    "child_name": "Siti"
}'

Invoke-Module "3. Matematika — Perkalian | Kelas 3 | Difficulty 3 | Tunarungu | overwhelmed" '{
    "topic": "perkalian sebagai penjumlahan berulang",
    "grade": 3,
    "disability_mode": "tunarungu",
    "difficulty": 3,
    "emotion_state": "overwhelmed",
    "child_name": "Dika"
}'

Invoke-Module "4. Matematika — Pembagian | Kelas 4 | Difficulty 4 | Disleksia | bored" '{
    "topic": "pembagian bilangan dan hubungannya dengan perkalian",
    "grade": 4,
    "disability_mode": "disleksia",
    "difficulty": 4,
    "emotion_state": "bored",
    "child_name": "Rina"
}'

Invoke-Module "5. Matematika — Pecahan | Kelas 5 | Difficulty 4 | Tunanetra | confused" '{
    "topic": "pecahan dan pecahan senilai",
    "grade": 5,
    "disability_mode": "tunanetra",
    "difficulty": 4,
    "emotion_state": "confused",
    "child_name": "Arya"
}'

# =============================================================================
# BAHASA INDONESIA
# =============================================================================

Invoke-Module "6. B. Indonesia — Membaca | Kelas 1 | Difficulty 1 | Tunarungu | engaged" '{
    "topic": "membaca suku kata dan kata sederhana",
    "grade": 1,
    "disability_mode": "tunarungu",
    "difficulty": 1,
    "emotion_state": "engaged",
    "child_name": "Maya"
}'

Invoke-Module "7. B. Indonesia — Menulis | Kelas 2 | Difficulty 2 | Disleksia | overwhelmed" '{
    "topic": "menulis kalimat yang baik dan benar",
    "grade": 2,
    "disability_mode": "disleksia",
    "difficulty": 2,
    "emotion_state": "overwhelmed",
    "child_name": "Fajar"
}'

Invoke-Module "8. B. Indonesia — Cerita | Kelas 3 | Difficulty 3 | Tunanetra | bored" '{
    "topic": "unsur-unsur cerita dan memahami isi bacaan",
    "grade": 3,
    "disability_mode": "tunanetra",
    "difficulty": 3,
    "emotion_state": "bored",
    "child_name": "Nisa"
}'

# =============================================================================
# IPA
# =============================================================================

Invoke-Module "9. IPA — Bagian Tubuh | Kelas 1 | Difficulty 1 | Tunanetra | engaged" '{
    "topic": "bagian-bagian tubuh dan fungsinya",
    "grade": 1,
    "disability_mode": "tunanetra",
    "difficulty": 1,
    "emotion_state": "engaged",
    "child_name": "Rafi"
}'

Invoke-Module "10. IPA — Hewan & Habitat | Kelas 2 | Difficulty 2 | Tunarungu | confused" '{
    "topic": "hewan dan tempat tinggalnya",
    "grade": 2,
    "disability_mode": "tunarungu",
    "difficulty": 2,
    "emotion_state": "confused",
    "child_name": "Layla"
}'

Invoke-Module "11. IPA — Tumbuhan | Kelas 3 | Difficulty 3 | Disleksia | engaged" '{
    "topic": "tumbuhan dan proses fotosintesis",
    "grade": 3,
    "disability_mode": "disleksia",
    "difficulty": 3,
    "emotion_state": "engaged",
    "child_name": "Kevin"
}'

Invoke-Module "12. IPA — Pencernaan | Kelas 4 | Difficulty 4 | Tunanetra | overwhelmed" '{
    "topic": "sistem pencernaan manusia",
    "grade": 4,
    "disability_mode": "tunanetra",
    "difficulty": 4,
    "emotion_state": "overwhelmed",
    "child_name": "Zahra"
}'

Invoke-Module "13. IPA — Tata Surya | Kelas 6 | Difficulty 5 | Tunarungu | bored" '{
    "topic": "tata surya dan gerakan bumi",
    "grade": 6,
    "disability_mode": "tunarungu",
    "difficulty": 5,
    "emotion_state": "bored",
    "child_name": "Haikal"
}'

Write-Host "============================================================" -ForegroundColor Green
Write-Host " SELESAI — 13 test case selesai dijalankan" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
