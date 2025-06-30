const axios = require('axios');

module.exports = function (app) {
    const SOURCES = [        
        { name: 'luminai', url: 'https://zelapioffciall.vercel.app/ai/luminai', param: 'text' },
        // Tambahkan lebih banyak sumber jika ingin
    ];

    async function checkDatabase(text) {
        try {
            const [resAstraAI, resDatabase] = await Promise.all([
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/local.json'),
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/AstraAi.json')
            ]);

            const data = [...resAstraAI.data, ...resDatabase.data];

            for (const item of data) {
                const patterns = item.patterns.map(p => p.toLowerCase());
                for (const pattern of patterns) {
                    if (text.toLowerCase().includes(pattern)) {
                        const responses = item.responses;
                        return responses[Math.floor(Math.random() * responses.length)];
                    }
                }
            }

            return null;
        } catch (err) {
            console.error('Gagal mengambil database lokal:', err.message);
            return null;
        }
    }

    async function AstraAIRandomAI(userText) {
        if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
            throw new Error('Teks tidak boleh kosong atau hanya spasi');
        }

        const shuffledSources = [...SOURCES].sort(() => Math.random() - 0.5);
        const start = Date.now();

        for (const chosen of shuffledSources) {
            const paramName = chosen.param || 'text';
            const url = chosen.url;

            const params = new URLSearchParams();
            params.append(paramName, userText);

            try {
                const response = await axios.get(`${url}?${params.toString()}`, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'AstraAI/1.0 (Hazel)'
                    }
                });

                const logicPrompt = `Kamu adalah ai yang bernama Astra Ai. Tugas kamu adalah menjawab. Kamu dibuat oleh Hazel sang pengembang. Fokus kamu adalah harus sopan, pintar, dan menjawab secara detail. Berikut pertanyaan dari user: ${userText}`;
                
                const result = response.data?.result || response.data?.message || JSON.stringify(response.data);
                const speed = Date.now() - start;

                return {
                    status: true,
                    result,
                    speed_ms: speed
                };
            } catch (error) {
                console.warn(`Gagal menggunakan ${chosen.name}: ${error.message}`);
                continue;
            }
        }

        return {
            status: false,
            result: 'Semua sumber gagal merespons dalam batas waktu 😔'
        };
    }

    app.get('/ai/astraai', async (req, res) => {
        const text = (req.query.text || '').trim();

        if (!text) {
            return res.status(400).json({
                status: false,
                error: 'Parameter ?text= wajib diisi yaa sayangg 💔'
            });
        }

        try {
            const localResponse = await checkDatabase(text);
            if (localResponse) {
                return res.status(200).json({
                    status: true,
                    creator: "JagoMerah",
                    source: "Astra AI",
                    result: localResponse
                });
            }

            const result = await AstraAIRandomAI(text);
            return res.status(result.status ? 200 : 500).json({
                status: result.status,
                creator: "JagoMerah",
                source: "Astra AI",
                result: result.result
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                creator: "jagomera",
                source: "Astra AI",
                result: 'Terjadi kesalahan tak terduga 😵'
            });
        }
    });
};
