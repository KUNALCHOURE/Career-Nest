// In-memory store for resume analysis data
const analysisStore = new Map();

const storeAnalysis = (userId, analysisData) => {
    analysisStore.set(userId.toString(), {
        data: analysisData,
        timestamp: new Date()
    });
};

const getAnalysis = (userId) => {
    const analysis = analysisStore.get(userId.toString());
    if (!analysis) return null;

    // Check if analysis is older than 24 hours
    const hoursSinceAnalysis = (new Date() - analysis.timestamp) / (1000 * 60 * 60);
    if (hoursSinceAnalysis > 24) {
        analysisStore.delete(userId.toString());
        return null;
    }

    return analysis.data;
};

const clearAnalysis = (userId) => {
    analysisStore.delete(userId.toString());
};

export {
    storeAnalysis,
    getAnalysis,
    clearAnalysis
}; 