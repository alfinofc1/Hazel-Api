const axios = require('axios');

module.exports = function(app) {
    async function getRandomBaskara() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/main/baskara.json');
            const list = Array.isArray(data) ? data : data.quotes || [];
            const randomText = list[Math.floor(Math.random() * list.length)];
            return randomText;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/baskara', async (req, res) => {
        try {
            const result = await getRandomBaskara();
            res.json({
                status: true,
                creator: "JagoMerah",
                baskara: result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Error: ${error.message}`
            });
        }
    });
};
