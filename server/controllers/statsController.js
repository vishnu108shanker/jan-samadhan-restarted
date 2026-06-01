const { getScore, DEPARTMENTS } = require('../utilities/scoreCalculator');

exports.getStats = async (req, res) => {
    try {
        const stats = await Promise.all(
            DEPARTMENTS.map(async (department) => ({
                department,
                score: await getScore(department),
            }))
        );

        res.json({ success: true, stats });
    } catch (error) {
        console.error("Error fetching stats:", error.message);
        res.status(500).json({ error: "Internal server error" , details: error.message });
    }
}