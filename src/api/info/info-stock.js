const axios = require('axios');

module.exports = function(app) {
    app.get('/info/stock', async (req, res) => {
        try {
            const response = await axios.get('https://zenzxz.dpdns.org/info/blockfruitsstock');
            const original = response.data;

            // Ambil field yang dibutuhkan aja
            const modified = {
                status: original.status,
                author: 'jago', // ganti creator ke author
                count: original.count,
                data: original.data
            };

            res.status(200).json(modified);
        } catch (error) {
            res.status(500).json({
                status: false,
                author: 'jago',
                message: `Error: ${error.message}`
            });
        }
    });
};
