const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const CommunityBuild = require('../models/communityBuildModel');
const Bookmark = require('../models/bookmarkModel');
const CloneTracking = require('../models/cloneTrackingModel');
const { verifyToken } = require('../utils/jwt');

jest.mock('../models/userModel');
jest.mock('../models/productModel');
jest.mock('../models/communityBuildModel');
jest.mock('../models/bookmarkModel');
jest.mock('../models/cloneTrackingModel');
jest.mock('../utils/jwt');

describe('Community Build Controller Endpoints', () => {
  let mockUser;
  let mockProducts;
  let mockBuild;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      name: 'HexEnthusiast',
      email: 'hex@example.com',
      role: 'user',
      profilePicture: 'avatar.jpg',
      showcasePostsCount: 0,
      totalLikesReceived: 0,
      followersCount: 0,
      reputationScore: 0,
      save: jest.fn().mockResolvedValue(true)
    };

    mockProducts = [
      { _id: 'cpu-4', name: 'Intel Core i9-13900K', brand: 'Intel', price: 500, imageUrl: 'cpu.jpg' },
      { _id: 'gpu-41', name: 'NVIDIA GeForce RTX 4090 24GB', brand: 'NVIDIA', price: 1600, imageUrl: 'gpu.jpg' },
      { _id: 'motherboard-9', name: 'ASUS TUF Gaming Z790-Plus WiFi D4', brand: 'ASUS', price: 250, imageUrl: 'mb.jpg' },
      { _id: 'ram-11', name: 'G.Skill Trident Z RGB 32GB DDR4', brand: 'G.Skill', price: 120, imageUrl: 'ram.jpg' },
      { _id: 'storage-42', name: 'WD Black SN850X 2TB', brand: 'WD', price: 180, imageUrl: 'ssd.jpg' },
      { _id: 'psu-21', name: 'Corsair RM750x 750W', brand: 'Corsair', price: 130, imageUrl: 'psu.jpg' },
      { _id: 'case-24', name: 'Corsair 4000D Airflow', brand: 'Corsair', price: 100, imageUrl: 'case.jpg' },
      { _id: 'cpucooler-43', name: 'ASUS ROG RYUJIN II 360', brand: 'ASUS', price: 300, imageUrl: 'cooler.jpg' }
    ];

    mockBuild = {
      _id: 'build123',
      author: 'user123',
      usernameSnapshot: 'HexEnthusiast',
      profileImageSnapshot: 'avatar.jpg',
      buildName: 'Project Obsidian',
      buildDescription: 'Gaming Beast',
      buildPurpose: 'Gaming',
      coverImage: 'obsidian.jpg',
      specs: {
        cpu: { productId: 'cpu-4', name: 'Intel Core i9-13900K', brand: 'Intel', image: 'cpu.jpg', currentPrice: 500, snapshotPrice: 500 },
        gpu: { productId: 'gpu-41', name: 'NVIDIA GeForce RTX 4090 24GB', brand: 'NVIDIA', image: 'gpu.jpg', currentPrice: 1600, snapshotPrice: 1600 },
        motherboard: { productId: 'motherboard-9', name: 'ASUS TUF Gaming Z790-Plus WiFi D4', brand: 'ASUS', image: 'mb.jpg', currentPrice: 250, snapshotPrice: 250 },
        ram: { productId: 'ram-11', name: 'G.Skill Trident Z RGB 32GB DDR4', brand: 'G.Skill', image: 'ram.jpg', currentPrice: 120, snapshotPrice: 120 },
        storage: { productId: 'storage-42', name: 'WD Black SN850X 2TB', brand: 'WD', image: 'ssd.jpg', currentPrice: 180, snapshotPrice: 180 },
        cooler: { productId: 'cpucooler-43', name: 'ASUS ROG RYUJIN II 360', brand: 'ASUS', image: 'cooler.jpg', currentPrice: 300, snapshotPrice: 300 },
        psu: { productId: 'psu-21', name: 'Corsair RM750x 750W', brand: 'Corsair', image: 'psu.jpg', currentPrice: 130, snapshotPrice: 130 },
        case: { productId: 'case-24', name: 'Corsair 4000D Airflow', brand: 'Corsair', image: 'case.jpg', currentPrice: 100, snapshotPrice: 100 }
      },
      totalCost: 3480,
      likes: [],
      comments: [],
      likesCount: 10,
      commentsCount: 2,
      cloneCount: 5,
      estimatedFPS1080p: 280,
      estimatedFPS1440p: 210,
      estimatedFPS4K: 105,
      powerConsumption: 650,
      compatibilityScore: 100,
      tags: ['RTX4090', 'Gaming'],
      status: 'published',
      visibility: 'public',
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockReturnThis()
    };
  });

  describe('POST /api/community-builds', () => {
    it('should create a community build successfully and return 201', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      Product.find.mockResolvedValue(mockProducts);
      CommunityBuild.create.mockResolvedValue(mockBuild);

      const res = await request(app)
        .post('/api/community-builds')
        .set('Authorization', 'Bearer valid-token')
        .send({
          buildName: 'Project Obsidian',
          buildDescription: 'Gaming Beast',
          buildPurpose: 'Gaming',
          coverImage: 'obsidian.jpg',
          specs: {
            cpu: 'cpu-4',
            gpu: 'gpu-41',
            motherboard: 'motherboard-9',
            ram: 'ram-11',
            storage: 'storage-42',
            cooler: 'cpucooler-43',
            psu: 'psu-21',
            case: 'case-24'
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.communityBuild).toBeDefined();
      expect(Product.find).toHaveBeenCalled();
      expect(CommunityBuild.create).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should fail if specifications are missing', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/community-builds')
        .set('Authorization', 'Bearer valid-token')
        .send({
          buildName: 'Project Obsidian',
          buildDescription: 'Gaming Beast'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('specifications');
    });
  });

  describe('GET /api/community-builds', () => {
    it('should fetch community builds and return 200', async () => {
      const mockFindChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockBuild])
      };
      CommunityBuild.find.mockReturnValue(mockFindChain);
      CommunityBuild.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/community-builds')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.communityBuilds).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });
  });

  describe('POST /api/community-builds/:id/like', () => {
    it('should toggle like on community build successfully (first time like)', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      mockBuild.likes = [];
      CommunityBuild.findById.mockResolvedValue(mockBuild);
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      CommunityBuild.findOneAndUpdate
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockBuild, likes: ['user123'], likesCount: 1 });

      const res = await request(app)
        .post('/api/community-builds/build123/like')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(true);
      expect(res.body.likesCount).toBe(1);
      expect(CommunityBuild.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should toggle like on community build successfully (unlike)', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      mockBuild.likes = [{ toString: () => 'user123' }];
      CommunityBuild.findById.mockResolvedValue(mockBuild);
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      CommunityBuild.findOneAndUpdate.mockResolvedValue({ ...mockBuild, likes: [], likesCount: 0 });

      const res = await request(app)
        .post('/api/community-builds/build123/like')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(false);
      expect(res.body.likesCount).toBe(0);
      expect(CommunityBuild.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('POST /api/community-builds/:id/bookmark', () => {
    it('should toggle bookmark on community build successfully (add bookmark)', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      CommunityBuild.findById.mockResolvedValue(mockBuild);
      Bookmark.findOne.mockResolvedValue(null);
      Bookmark.create.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/community-builds/build123/bookmark')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.bookmarked).toBe(true);
      expect(Bookmark.create).toHaveBeenCalled();
    });
  });

  describe('POST /api/community-builds/:id/clone', () => {
    it('should track clones, increment cloneCount, and return specs snapshot', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      const buildWithSnapshot = {
        ...mockBuild,
        snapshotSpecs: mockBuild.specs,
        save: jest.fn().mockResolvedValue(true)
      };
      CommunityBuild.findById.mockResolvedValue(buildWithSnapshot);
      CloneTracking.create.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/community-builds/build123/clone')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cloneCount).toBe(6);
      expect(CloneTracking.create).toHaveBeenCalled();
      expect(res.body.specs).toBeDefined();
    });
  });

  describe('POST /api/community-builds/:id/comments', () => {
    it('should successfully add a comment', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      
      mockBuild.comments = [];
      CommunityBuild.findById.mockResolvedValue(mockBuild);

      const mockComment = {
        _id: 'comment123',
        author: mockUser,
        content: 'Awesome build!',
        parentCommentId: null
      };
      const mockCommentsArray = [mockComment];
      mockCommentsArray.find = jest.fn().mockReturnValue(mockComment);

      const mockPopulateChain = {
        populate: jest.fn().mockResolvedValue({
          ...mockBuild,
          comments: mockCommentsArray
        })
      };
      CommunityBuild.findByIdAndUpdate.mockReturnValue(mockPopulateChain);

      const res = await request(app)
        .post('/api/community-builds/build123/comments')
        .set('Authorization', 'Bearer valid-token')
        .send({ content: 'Awesome build!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.comment).toBeDefined();
      expect(CommunityBuild.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
