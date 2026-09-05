export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectName, htmlContent } = req.body;

    if (!projectName || !htmlContent) {
        return res.status(400).json({ error: 'Data project name atau HTML tidak lengkap' });
    }

    // MENGAMBIL TOKEN DARI ENVIRONMENT VARIABLE VERCEL (SANGAT AMAN)
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

    if (!VERCEL_TOKEN) {
        return res.status(500).json({ error: 'Server belum dikonfigurasi dengan VERCEL_TOKEN.' });
    }

    try {
        const response = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: projectName,
                files: [
                    {
                        file: 'index.html',
                        data: htmlContent
                    }
                ],
                projectSettings: {
                    framework: null
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({
                success: true,
                url: data.url,
                name: data.name
            });
        } else {
            return res.status(response.status).json({
                error: data.error ? data.error.message : 'Gagal melakukan deploy ke Vercel.'
            });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
