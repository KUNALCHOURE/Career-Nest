import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userschema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Added: email should also be unique
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  refreshtoken: {
    type: String,
  },
  
  // resume parsing 
  rawResumeText: {
    type: String,
  },
  extractedSkills: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  extractedExperience: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  extractedEducation: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  estimatedYearsExperience: {
    type: Number,
  },
  semanticKeywords: {
    type: [String],
    default: [],
  },
  userEmbedding: {
    type: [Number],
  },
  resumeUploadedAt: {
    type: Date,
  },
  aiParsingStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'NONE'],
    default: 'NONE',
  },
  aiParsingError: {
    type: String,
  },
}, { timestamps: true });

userschema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userschema.methods.ispasswordcorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userschema.methods.generateAcessToken = async function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    },
  );
};

userschema.methods.generateRefreshToken = async function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    },
  );
};

const User = mongoose.model('User', userschema);

export default User;