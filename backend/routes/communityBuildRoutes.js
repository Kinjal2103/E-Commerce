const express = require('express');
const communityBuildController = require('../controllers/communityBuildController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for fetching posts & rankings
router.get('/', optionalProtect, communityBuildController.getAllCommunityBuilds);
router.get('/rankings', communityBuildController.getFeaturedRankings);
router.get('/:id', optionalProtect, communityBuildController.getCommunityBuild);
router.get('/:id/comments', communityBuildController.getComments);

// Authenticated routes
router.use(protect); // Applies authentication to all endpoints below

router.post('/', communityBuildController.createCommunityBuild);
router.patch('/:id', communityBuildController.updateCommunityBuild);
router.delete('/:id', communityBuildController.deleteCommunityBuild);

router.post('/:id/like', communityBuildController.toggleLikeCommunityBuild);
router.post('/:id/bookmark', communityBuildController.toggleBookmarkCommunityBuild);
router.post('/:id/clone', communityBuildController.cloneCommunityBuild);

router.post('/:id/comments', communityBuildController.addComment);
router.delete('/:id/comments/:commentId', communityBuildController.deleteComment);

module.exports = router;
