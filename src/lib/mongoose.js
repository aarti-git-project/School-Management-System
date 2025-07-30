import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-2024";

// Configure mongoose
mongoose.set("strictQuery", true);
mongoose.set("debug", process.env.NODE_ENV === "development");

// Connection options
const options = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Create the connection function with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      console.log("\n🔄 Attempting to connect to MongoDB...");
      console.log("URI:", MONGODB_URI);

      const conn = await mongoose.connect(MONGODB_URI, options);

      console.log("\n📦 MongoDB Connection Details:");
      console.log("✅ Status: Connected successfully");
      console.log(`🗄️ Database: ${conn.connection.name}`);
      console.log("🌐 Host:", conn.connection.host);

      return conn;
    } catch (error) {
      currentRetry++;
      console.error(
        `\n❌ MongoDB Connection Error (Attempt ${currentRetry}/${maxRetries}):`
      );
      console.error("Message:", error.message);
      console.error("Code:", error.code);

      if (currentRetry === maxRetries) {
        console.error("❌ Max retries reached. Exiting...");
        throw error;
      }

      console.log(`\n⏳ Waiting 5 seconds before retry...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Full name must be at least 2 characters long"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: {
      values: ["parent", "teacher", "admin"],
      message: "{VALUE} is not a valid role",
    },
    required: [true, "Role is required"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Parent Schema
const parentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subjects: [
    {
      type: String,
      required: true,
    },
  ],
  grade: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Child Schema
const childSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: [4, "Age must be at least 4"],
    max: [12, "Age must not exceed 12"],
  },
  grade: {
    type: String,
    required: true,
  },
  subjects: [
    {
      type: String,
      required: true,
    },
  ],
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: true,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  subjectTeachers: [
    {
      subject: String,
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["individual", "class", "announcement"],
    required: true,
  },
  grade: String,
  readBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Grade Schema
const gradeSchema = new mongoose.Schema({
  testTitle: {
    type: String,
    required: [true, "Test title is required"],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
  },
  grade: {
    type: String,
    required: [true, "Grade is required"],
  },
  score: {
    type: Number,
    required: [true, "Score is required"],
    min: [0, "Score cannot be less than 0"],
    max: [100, "Score cannot exceed 100"],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  comments: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error("Error hashing password:", error);
      throw error;
    }
  }
  next();
});

// Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Verify password
userSchema.methods.verifyPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};

// Create models
const User = mongoose.model("User", userSchema);
const Parent = mongoose.model("Parent", parentSchema);
const Teacher = mongoose.model("Teacher", teacherSchema);
const Child = mongoose.model("Child", childSchema);
const Message = mongoose.model("Message", messageSchema);
const Grade = mongoose.model("Grade", gradeSchema);
export const Assignment = mongoose.model("Assignment", assignmentSchema);

// Set up connection event handlers
mongoose.connection.on("connected", () => {
  console.log("🔄 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from MongoDB");
});

// Handle application termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

export { User, Parent, Teacher, Child, Message, Grade };
export default connectDB;
