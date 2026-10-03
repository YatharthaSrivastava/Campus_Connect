const StoreService = require('../services/storeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/v1/study-groups
 * Retrieves active study sessions with campus location tags.
 */
const getStudyGroups = async (req, res) => {
  try {
    const sessions = await StoreService.getStudySessions();
    return sendSuccess(res, sessions, 'Active study groups retrieved.');
  } catch (err) {
    console.error('getStudyGroups error:', err);
    return sendError(res, 'Failed to fetch study groups', 500);
  }
};

/**
 * POST /api/v1/study-groups
 * Payload: { "subject": "DBMS", "location": "Library Pod 3" }
 * Creates a real-time subject-based study group session.
 */
const createStudyGroup = async (req, res) => {
  try {
    const { subject, location, subjectCode } = req.body;

    if (!subject || !location) {
      return sendError(
        res,
        'Missing required parameters: subject and location are required.',
        400
      );
    }

    const creator = req.user;
    const resolvedSubjectCode =
      subjectCode ||
      (subject.toUpperCase().includes('DBMS')
        ? 'KCS501'
        : subject.toUpperCase().includes('OS')
        ? 'KCS401'
        : 'KCS301');

    const newSession = await StoreService.createStudySession({
      subjectCode: resolvedSubjectCode,
      subject: subject.trim(),
      location: location.trim(),
      creatorId: creator._id,
      creatorName: creator.fullName || 'PSIT Student',
      locationCoordinates: {
        type: 'Point',
        coordinates: [80.1983, 26.4729], // PSIT Campus coords
      },
    });

    return sendSuccess(res, newSession, 'Study group created successfully', 201);
  } catch (err) {
    console.error('createStudyGroup error:', err);
    return sendError(res, 'Failed to create study group', 500);
  }
};

module.exports = {
  getStudyGroups,
  createStudyGroup,
};
