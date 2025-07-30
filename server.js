import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB, {
  User,
  Parent,
  Teacher,
  Child,
  Message,
  Grade,
  Assignment,
} from "./src/lib/mongoose.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SIGNUP_CODE = "HIGHSPEED8";

// Initialize MongoDB connection
console.log("🔄 Initializing MongoDB connection...");
try {
  await connectDB();
  console.log("✅ MongoDB connection initialized successfully");
} catch (err) {
  console.error("❌ Failed to initialize MongoDB connection:", err);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Role authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// Helper function to handle errors
const handleError = (error) => {
  console.error("\n❌ Error details:");
  console.error("Message:", error.message);
  console.error("Name:", error.name);
  console.error("Stack:", error.stack);

  if (error.code) {
    console.error("Error Code:", error.code);
  }

  if (error.errors) {
    console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
  }

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return {
      status: 400,
      message: errors.join(". "),
    };
  }

  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      status: 400,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    };
  }

  return {
    status: 500,
    message: error.message || "Internal server error",
  };
};

// Authentication Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Create user
    const user = new User({
      fullName,
      email,
      phone,
      password,
      role: "parent",
    });

    await user.save();

    // Create parent record
    const parent = new Parent({
      userId: user._id,
      status: "approved", // Auto-approve parents
    });

    await parent.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Parent account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.post("/api/auth/teacher/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password, subjects, grade } = req.body;

    // Validate required fields
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one subject is required" });
    }

    if (!grade) {
      return res.status(400).json({ message: "Grade is required" });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      phone,
      password,
      role: "teacher",
    });

    await user.save();

    // Create teacher record
    const teacher = new Teacher({
      userId: user._id,
      subjects,
      grade,
      status: "pending", // Teachers need approval
    });

    await teacher.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Teacher account created successfully. Awaiting admin approval.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.post("/api/auth/admin/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password, adminCode } = req.body;

    // Validate admin code
    if (!adminCode || adminCode !== ADMIN_SIGNUP_CODE) {
      return res.status(403).json({ message: "Invalid administrator code" });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      phone,
      password,
      role: "admin",
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Administrator account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify role matches
    if (user.role !== role) {
      return res
        .status(403)
        .json({ message: "Incorrect role for this account" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // For teachers, check approval status
    if (role === "teacher") {
      const teacher = await Teacher.findOne({ userId: user._id });
      if (!teacher || teacher.status !== "approved") {
        return res.status(403).json({
          message: "Your account is pending approval from the administrator",
        });
      }
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

// Parent Routes
app.get(
  "/api/parent/children",
  authenticateToken,
  authorizeRole(["parent"]),
  async (req, res) => {
    try {
      // Find parent record
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(404).json({ message: "Parent record not found" });
      }

      // Find children associated with this parent
      const children = await Child.find({ parentId: parent._id })
        .populate("classTeacher", "userId")
        .populate("subjectTeachers.teacherId", "userId")
        .populate({
          path: "classTeacher",
          populate: {
            path: "userId",
            select: "fullName email",
          },
        })
        .populate({
          path: "subjectTeachers.teacherId",
          populate: {
            path: "userId",
            select: "fullName email",
          },
        })
        .lean();

      // Format the response
      const formattedChildren = children.map((child) => ({
        id: child._id,
        fullName: child.fullName,
        age: child.age,
        grade: child.grade,
        subjects: child.subjects,
        classTeacher: child.classTeacher
          ? {
              id: child.classTeacher._id,
              fullName: child.classTeacher.userId.fullName,
              email: child.classTeacher.userId.email,
            }
          : null,
        subjectTeachers: child.subjectTeachers.map((st) => ({
          subject: st.subject,
          teacher: st.teacherId
            ? {
                id: st.teacherId._id,
                fullName: st.teacherId.userId.fullName,
                email: st.teacherId.userId.email,
              }
            : null,
        })),
      }));

      res.json({ children: formattedChildren });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

app.post(
  "/api/parent/children",
  authenticateToken,
  authorizeRole(["parent"]),
  async (req, res) => {
    try {
      const { fullName, age, grade, subjects } = req.body;

      // Find parent record
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(404).json({ message: "Parent record not found" });
      }

      // Create new child
      const child = new Child({
        fullName,
        age,
        grade,
        subjects,
        parentId: parent._id,
      });

      await child.save();

      res.status(201).json({
        message: "Child added successfully",
        child: {
          id: child._id,
          fullName: child.fullName,
          age: child.age,
          grade: child.grade,
          subjects: child.subjects,
        },
      });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

// Teacher Routes
app.get(
  "/api/teacher/students",
  authenticateToken,
  authorizeRole(["teacher"]),
  async (req, res) => {
    try {
      // Find teacher record
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher record not found" });
      }

      // Find students where this teacher is either the class teacher or subject teacher
      const students = await Child.find({
        $or: [
          { classTeacher: teacher._id },
          { "subjectTeachers.teacherId": teacher._id },
        ],
      })
        .populate("classTeacher")
        .populate("subjectTeachers.teacherId")
        .lean();

      // Format the response to include only subjects taught by this teacher
      const formattedStudents = students.map((student) => {
        const isClassTeacher =
          student.classTeacher?._id.toString() === teacher._id.toString();
        const taughtSubjects = student.subjectTeachers
          .filter(
            (st) => st.teacherId._id.toString() === teacher._id.toString()
          )
          .map((st) => st.subject);

        return {
          _id: student._id,
          fullName: student.fullName,
          grade: student.grade,
          // If class teacher, show all subjects, otherwise show only taught subjects
          subjects: isClassTeacher ? student.subjects : taughtSubjects,
          isClassTeacher,
        };
      });

      res.json({ students: formattedStudents });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

app.get(
  "/api/teacher/parents",
  authenticateToken,
  authorizeRole(["teacher"]),
  async (req, res) => {
    try {
      // Find teacher record
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher record not found" });
      }

      // Find students taught by this teacher
      const students = await Child.find({
        $or: [
          { classTeacher: teacher._id },
          { "subjectTeachers.teacherId": teacher._id },
        ],
      })
        .populate("parentId")
        .populate({
          path: "parentId",
          populate: {
            path: "userId",
            select: "fullName email phone",
          },
        })
        .lean();

      // Get unique parents with their children's info
      const parentsMap = new Map();

      students.forEach((student) => {
        const parentId = student.parentId._id.toString();
        const parent = student.parentId.userId;

        if (!parentsMap.has(parentId)) {
          parentsMap.set(parentId, {
            fullName: parent.fullName,
            email: parent.email,
            phone: parent.phone,
            children: [],
          });
        }

        parentsMap.get(parentId).children.push({
          name: student.fullName,
          grade: student.grade,
        });
      });

      const formattedParents = Array.from(parentsMap.values());

      res.json({ parents: formattedParents });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

// Admin Routes
app.get(
  "/api/admin/users",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const teachers = await Teacher.find().populate(
        "userId",
        "fullName email phone"
      );
      const parents = await Parent.find().populate(
        "userId",
        "fullName email phone"
      );
      const children = await Child.find()
        .populate({
          path: "parentId",
          populate: { path: "userId", select: "fullName email" },
        })
        .populate({
          path: "classTeacher",
          populate: { path: "userId", select: "fullName email" },
        })
        .populate({
          path: "subjectTeachers.teacherId",
          populate: { path: "userId", select: "fullName email" },
        });

      const formattedTeachers = teachers
        .filter((t) => t.userId && t.userId.fullName)
        .map((t) => ({
          _id: t._id,
          fullName: t.userId.fullName,
          email: t.userId.email,
          phone: t.userId.phone,
          subjects: t.subjects,
          grade: t.grade,
          status: t.status,
        }));

      const formattedParents = parents
        .filter((p) => p.userId && p.userId.fullName)
        .map((p) => ({
          _id: p._id,
          fullName: p.userId.fullName,
          email: p.userId.email,
          phone: p.userId.phone,
          childCount: 0,
          status: p.status,
        }));

      const formattedStudents = children.map((child) => ({
        id: child._id,
        fullName: child.fullName,
        age: child.age,
        grade: child.grade,
        subjects: child.subjects,
        parentName: child.parentId?.userId?.fullName || "N/A",
        parentEmail: child.parentId?.userId?.email || "N/A",
        classTeacher: child.classTeacher
          ? {
              id: child.classTeacher._id,
              fullName: child.classTeacher.userId.fullName,
              email: child.classTeacher.userId.email,
            }
          : null,
        subjectTeachers: child.subjectTeachers.map((st) => ({
          subject: st.subject,
          teacher: st.teacherId
            ? {
                id: st.teacherId._id,
                fullName: st.teacherId.userId.fullName,
                email: st.teacherId.userId.email,
              }
            : null,
        })),
      }));

      res.json({
        teachers: formattedTeachers,
        parents: formattedParents,
        students: formattedStudents,
      });
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);

app.post(
  "/api/admin/teachers/:id/status",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const teacher = await Teacher.findById(id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      teacher.status = status;
      teacher.approvedAt = status === "approved" ? new Date() : null;
      teacher.approvedBy = status === "approved" ? req.user.id : null;

      await teacher.save();

      res.json({ message: `Teacher ${status} successfully` });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

app.post(
  "/api/admin/assign-teachers",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const { studentId, classTeacherId, subjectTeachers } = req.body;

      console.log("Assignment request:", {
        studentId,
        classTeacherId,
        subjectTeachers: subjectTeachers.map((st) => ({
          subject: st.subject,
          teacherId: st.teacherId,
        })),
      });

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      if (!mongoose.Types.ObjectId.isValid(classTeacherId)) {
        return res.status(400).json({ message: "Invalid class teacher ID" });
      }
      for (const st of subjectTeachers) {
        if (!mongoose.Types.ObjectId.isValid(st.teacherId)) {
          return res
            .status(400)
            .json({ message: `Invalid teacher ID: ${st.teacherId}` });
        }
      }

      // Find the child and populate existing relationships
      const child = await Child.findById(studentId)
        .populate({
          path: "classTeacher",
          populate: {
            path: "userId",
            select: "fullName email",
          },
        })
        .populate({
          path: "subjectTeachers.teacherId",
          populate: {
            path: "userId",
            select: "fullName email",
          },
        });

      if (!child) {
        return res.status(404).json({ message: "Student not found" });
      }

      // First verify class teacher exists and is approved
      const classTeacher = await Teacher.findOne({
        _id: classTeacherId,
        status: "approved",
      }).populate("userId", "fullName email");

      if (!classTeacher) {
        return res
          .status(404)
          .json({ message: "Class teacher not found or not approved" });
      }

      // Then verify all subject teachers exist and are approved
      const teacherIds = [
        ...new Set(subjectTeachers.map((st) => st.teacherId)),
      ];
      const teachers = await Teacher.find({
        _id: { $in: teacherIds },
        status: "approved",
      }).populate("userId", "fullName email");

      console.log(
        "Found teachers:",
        teachers.map((t) => ({
          id: t._id.toString(),
          subjects: t.subjects,
        }))
      );

      // Check if all teachers were found
      const foundTeacherIds = teachers.map((t) => t._id.toString());
      const missingTeachers = teacherIds.filter(
        (id) => !foundTeacherIds.includes(id)
      );

      if (missingTeachers.length > 0) {
        return res.status(404).json({
          message: "One or more subject teachers not found or not approved",
          missingTeachers,
        });
      }

      // Validate that teachers teach the assigned subjects
      for (const st of subjectTeachers) {
        const teacher = teachers.find((t) => t._id.toString() === st.teacherId);
        if (!teacher) {
          return res
            .status(404)
            .json({ message: `Teacher not found: ${st.teacherId}` });
        }
        if (!teacher.subjects.includes(st.subject)) {
          return res.status(400).json({
            message: `Teacher ${teacher._id} does not teach ${st.subject}`,
          });
        }
      }

      // Update the child record
      child.classTeacher = classTeacherId;
      child.subjectTeachers = subjectTeachers;
      await child.save();

      // Prepare the response with updated teacher information
      const updatedChild = {
        id: child._id,
        fullName: child.fullName,
        grade: child.grade,
        subjects: child.subjects,
        classTeacher: {
          id: classTeacher._id,
          fullName: classTeacher.userId.fullName,
          email: classTeacher.userId.email,
        },
        subjectTeachers: subjectTeachers.map((st) => {
          const teacher = teachers.find(
            (t) => t._id.toString() === st.teacherId
          );
          return {
            subject: st.subject,
            teacher: {
              id: teacher._id,
              fullName: teacher.userId.fullName,
              email: teacher.userId.email,
            },
          };
        }),
      };

      res.json({
        message: "Teachers assigned successfully",
        child: updatedChild,
      });
    } catch (error) {
      console.error("Error assigning teachers:", error);
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

// Message Routes
app.post("/api/messages", authenticateToken, async (req, res) => {
  try {
    const { subject, content, type, recipients, grade } = req.body;
    const sender = req.user.id;

    // Validate required fields
    if (!subject || !content || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate message type
    if (!["individual", "class", "announcement"].includes(type)) {
      return res.status(400).json({ message: "Invalid message type" });
    }

    // For class messages, validate grade
    if (type === "class" && !grade) {
      return res
        .status(400)
        .json({ message: "Grade is required for class messages" });
    }

    // For individual messages, validate recipients
    if (type === "individual" && (!recipients || recipients.length === 0)) {
      return res
        .status(400)
        .json({ message: "Recipients are required for individual messages" });
    }

    // Handle different message types
    let finalRecipients = [];

    if (type === "individual") {
      // Verify all recipients exist
      const users = await User.find({ _id: { $in: recipients } });
      if (users.length !== recipients.length) {
        return res
          .status(400)
          .json({ message: "One or more recipients not found" });
      }
      finalRecipients = recipients;
    } else if (type === "class") {
      // Get all students in the grade
      const students = await Child.find({ grade })
        .populate("parentId")
        .populate("classTeacher")
        .populate("subjectTeachers.teacherId");

      // Collect all related users
      const userIds = new Set();

      students.forEach((student) => {
        // Add parent
        if (student.parentId?.userId) {
          userIds.add(student.parentId.userId.toString());
        }

        // Add class teacher
        if (student.classTeacher?.userId) {
          userIds.add(student.classTeacher.userId.toString());
        }

        // Add subject teachers
        student.subjectTeachers.forEach((st) => {
          if (st.teacherId?.userId) {
            userIds.add(st.teacherId.userId.toString());
          }
        });
      });

      finalRecipients = Array.from(userIds);
    } else if (type === "announcement") {
      // For announcements, include all users except the sender
      const users = await User.find({ _id: { $ne: sender } });
      finalRecipients = users.map((user) => user._id);
    }

    // Create the message
    const message = new Message({
      sender,
      recipients: finalRecipients,
      subject,
      content,
      type,
      grade: type === "class" ? grade : undefined,
    });

    await message.save();

    // Populate sender details for response
    await message.populate("sender", "fullName email role");

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.get("/api/messages", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let query = {
      $or: [{ sender: userId }, { recipients: userId }],
    };

    if (type) {
      query.type = type;
    }

    const messages = await Message.find(query)
      .populate("sender", "fullName email role")
      .populate("recipients", "fullName email role")
      .populate("readBy.user", "fullName email role")
      .sort({ createdAt: -1 });

    res.json({
      messages: messages.map((msg) => ({
        id: msg._id,
        subject: msg.subject,
        content: msg.content,
        type: msg.type,
        grade: msg.grade,
        sender: {
          id: msg.sender._id,
          fullName: msg.sender.fullName,
          email: msg.sender.email,
          role: msg.sender.role,
        },
        recipients: msg.recipients.map((r) => ({
          id: r._id,
          fullName: r.fullName,
          email: r.email,
          role: r.role,
        })),
        readBy: msg.readBy.map((r) => ({
          user: {
            id: r.user._id,
            fullName: r.user.fullName,
            email: r.user.email,
            role: r.user.role,
          },
          readAt: r.readAt,
        })),
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.post("/api/messages/:id/read", authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is a recipient
    if (!message.recipients.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to read this message" });
    }

    // Mark as read if not already
    if (!message.readBy.some((r) => r.user.toString() === userId)) {
      message.readBy.push({
        user: userId,
        readAt: new Date(),
      });
      await message.save();
    }

    res.json({ message: "Message marked as read" });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.get(
  "/api/assignments",
  authenticateToken,
  authorizeRole(["teacher"]),
  async (req, res) => {
    try {
      const assignments = await Assignment.find().sort({ dueDate: 1 });
      res.json(assignments);
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

app.post(
  "/api/assignments",
  authenticateToken,
  authorizeRole(["teacher"]),
  async (req, res) => {
    try {
      const { title, description, dueDate } = req.body;

      const assignment = new Assignment({
        title,
        description,
        dueDate,
        createdBy: req.user.id,
      });

      await assignment.save();

      res
        .status(201)
        .json({ message: "Assignment created successfully", assignment });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

// Grade Routes
app.post(
  "/api/grades",
  authenticateToken,
  authorizeRole(["teacher"]),
  async (req, res) => {
    try {
      const { testTitle, subject, grade, score, studentId, comments } =
        req.body;

      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher record not found" });
      }

      const student = await Child.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const newGrade = new Grade({
        testTitle,
        subject,
        grade,
        score,
        teacherId: teacher._id,
        studentId,
        comments,
      });

      await newGrade.save();

      res.status(201).json({
        message: "Grade added successfully",
        grade: newGrade,
      });
    } catch (error) {
      const { status, message } = handleError(error);
      res.status(status).json({ message });
    }
  }
);

app.get("/api/grades", authenticateToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher record not found" });
      }
      query.teacherId = teacher._id;
    } else if (req.user.role === "parent") {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(404).json({ message: "Parent record not found" });
      }

      const children = await Child.find({ parentId: parent._id });

      const childIds = children.map((c) => c._id);

      if (childIds.length === 0) {
        return res.json({ grades: [] }); // No children -> no grades
      }

      query.studentId = { $in: childIds };
    }

    const grades = await Grade.find(query)
      .populate({
        path: "studentId",
        select: "fullName grade",
      })
      .populate({
        path: "teacherId",
        populate: {
          path: "userId",
          select: "fullName",
        },
      })
      .sort({ date: -1 });

    res.json({ grades });
  } catch (error) {
    const { status, message } = handleError(error);
    res.status(status).json({ message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
