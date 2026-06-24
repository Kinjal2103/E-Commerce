const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema(
  {
    productId: {
      type: String, // String type to support the string Product IDs used in E-Commerce
      required: [true, 'Component product ID is required.']
    },
    name: {
      type: String,
      required: [true, 'Component name is required.']
    },
    brand: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    currentPrice: {
      type: Number,
      required: [true, 'Component current price is required.']
    },
    snapshotPrice: {
      type: Number,
      required: [true, 'Component snapshot price is required.']
    }
  },
  { _id: false }
);

const commentSubSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author.']
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty.'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters.']
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    likes: {
      type: Number,
      default: 0
    },
    edited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const communityBuildSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A community build must belong to an author.']
    },
    usernameSnapshot: {
      type: String,
      required: [true, 'A community build must snapshot the creator username.']
    },
    profileImageSnapshot: {
      type: String,
      default: ''
    },
    buildName: {
      type: String,
      required: [true, 'A community build must have a name.'],
      trim: true,
      minlength: [3, 'Build name must be at least 3 characters long.'],
      maxlength: [100, 'Build name cannot exceed 100 characters.']
    },
    buildDescription: {
      type: String,
      required: [true, 'A community build must have a description.'],
      trim: true,
      maxlength: [1000, 'Build description cannot exceed 1000 characters.']
    },
    buildPurpose: {
      type: String,
      required: [true, 'Please specify the main purpose of this build.'],
      enum: {
        values: [
          'Gaming',
          'Streaming',
          'Competitive Esports',
          'Content Creation',
          'Video Editing',
          'AI / ML',
          'Programming',
          'Budget Build',
          'Workstation',
          'Home Server'
        ],
        message: 'Purpose must be one of the pre-defined categories.'
      }
    },
    coverImage: {
      type: String,
      required: [true, 'A cover image is required for the build showcase.']
    },
    galleryImages: [
      {
        type: String
      }
    ],
    videoShowcase: {
      type: String,
      default: ''
    },
    // Build snapshot containing full immutable data of selected parts
    specs: {
      cpu: { type: componentSchema, required: true },
      gpu: { type: componentSchema, required: true },
      motherboard: { type: componentSchema, required: true },
      ram: { type: componentSchema, required: true },
      storage: { type: componentSchema, required: true },
      cooler: { type: componentSchema, required: true },
      psu: { type: componentSchema, required: true },
      case: { type: componentSchema, required: true }
    },
    // Metrics
    totalCost: {
      type: Number,
      required: [true, 'Total cost is required.'],
      min: [0, 'Total cost must be a positive number.']
    },
    estimatedFPS1080p: { type: Number, default: 0 },
    estimatedFPS1440p: { type: Number, default: 0 },
    estimatedFPS4K: { type: Number, default: 0 },
    powerConsumption: { type: Number, default: 0 }, // in Watts
    compatibilityScore: { type: Number, default: 100, min: 0, max: 100 },
    
    // Tags
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    
    // Status and visibility settings
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'followers'],
      default: 'public'
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSubSchema],

    // Counter caches for speed optimizations
    likesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    cloneCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Future feature expansion fields
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      default: null
    },
    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuildBattle',
      default: null
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredAt: {
      type: Date,
      default: null
    },
    weeklyRank: {
      type: Number,
      default: null
    },
    aiReview: {
      score: { type: Number, default: null },
      pros: [{ type: String }],
      cons: [{ type: String }],
      bottleneckAnalysis: { type: String, default: '' },
      reviewedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexing strategy
communityBuildSchema.index({ author: 1 });
communityBuildSchema.index({ status: 1, visibility: 1, createdAt: -1 });
communityBuildSchema.index({ tags: 1 });
communityBuildSchema.index({ totalCost: 1 });
communityBuildSchema.index({ buildPurpose: 1 });
communityBuildSchema.index({ likesCount: -1 });

// Custom toJSON transform to preserve full backward compatibility with the existing React community showcase page.
communityBuildSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id ? ret._id.toString() : '';
    
    // Set legacy fields at the root level
    ret.name = ret.buildName;
    ret.creator = ret.usernameSnapshot;
    ret.imageUrl = ret.coverImage;
    ret.budget = ret.totalCost;
    ret.likedBy = ret.likes ? ret.likes.map(id => id.toString()) : [];
    ret.likes = ret.likesCount;
    ret.comments = ret.commentsCount;
    
    // Store original detailed snapshot specs under `snapshotSpecs`
    ret.snapshotSpecs = { ...ret.specs };
    
    // Replace `specs` with legacy flat specs dictionary (just names of components) for compatibility
    if (ret.specs) {
      ret.specs = {
        cpu: ret.specs.cpu?.name || '',
        gpu: ret.specs.gpu?.name || '',
        motherboard: ret.specs.motherboard?.name || '',
        ram: ret.specs.ram?.name || '',
        storage: ret.specs.storage?.name || '',
        cooler: ret.specs.cooler?.name || '',
        psu: ret.specs.psu?.name || '',
        case: ret.specs.case?.name || ''
      };
    }
    
    return ret;
  }
});

const CommunityBuild = mongoose.model('CommunityBuild', communityBuildSchema);

module.exports = CommunityBuild;
