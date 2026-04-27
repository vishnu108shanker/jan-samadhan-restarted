const getScore = require('../utilities/scoreCalculator').getScore ;
const Issue = require('../models/Issues') ;

exports.getStats = async (req, res) => {
    try {
        const departments = ["Water", "Electricity", "Roads", "Sanitation", "Healthcare"];
        const stats = [];
        for (const dept of departments) {
            const score = await getScore(dept);
            stats.push({ department: dept, score });
        }

        res.json({ success: true, stats });
    } catch (error) {
        console.error("Error fetching stats:", error.message);
        res.status(500).json({ error: "Internal server error" , details: error.message });
    }
}