# ✅ Backend Implementation Checklist for Course Progress Persistence

## Status: Frontend is READY ✅
The frontend (`CourseLearning.jsx`) is fully implemented with:
- ✅ Auto-save every 30 seconds to `/api/progress/save`
- ✅ Load progress on mount from `/api/progress/{courseId}`
- ✅ Save immediately when marking lecture complete
- ✅ Save before page unload using Navigator.sendBeacon
- ✅ Restore video position, completed lectures, current topic/lecture

---

## What Frontend is Calling

### 1. **POST `/api/progress/save`**
**When Called:**
- Every 30 seconds (auto-save)
- Immediately when user marks lecture complete
- Before page unload

**Request Body:**
```json
{
  "courseId": "693acfd0ee4bdc7e86aaf44a",
  "completedLectures": ["0-0", "0-1", "1-0"],
  "videoProgress": {
    "0-0": { "current": 450.5, "duration": 1500 },
    "0-1": { "current": 0, "duration": 1200 },
    "1-0": { "current": 600, "duration": 1800 }
  },
  "currentTopic": 1,
  "currentLecture": 0,
  "lastAccessedAt": "2025-12-11T10:30:00.000Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Progress saved",
  "progress": {
    "completedLectures": ["0-0", "0-1", "1-0"],
    "currentTopic": 1,
    "currentLecture": 0,
    "progressPercentage": 15
  }
}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

### 2. **GET `/api/progress/{courseId}`**
**When Called:**
- When user opens the course (once per session)

**Request:**
```
GET /api/progress/693acfd0ee4bdc7e86aaf44a
Authorization: Bearer {JWT_TOKEN}
```

**Expected Response:**
```json
{
  "success": true,
  "progress": {
    "completedLectures": ["0-0", "0-1"],
    "videoProgress": {
      "0-0": { "current": 450.5, "duration": 1500 },
      "0-1": { "current": 0, "duration": 1200 }
    },
    "currentTopic": 1,
    "currentLecture": 0,
    "progressPercentage": 15,
    "lastAccessedAt": "2025-12-11T10:30:00.000Z"
  }
}
```

**If No Progress Found (First Time):**
```json
{
  "success": false,
  "message": "No progress found"
}
```

---

## Backend Implementation Steps

### Step 1: Update Enrollment Model
**File:** `models/Enrollment.js`

Add these fields to your existing enrollment schema:

```javascript
const enrollmentSchema = new Schema({
  // ... existing fields ...
  
  // NEW PROGRESS FIELDS
  completedLectures: [{
    topicIndex: Number,
    lectureIndex: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  
  videoProgress: {
    type: Map,
    of: {
      currentTime: Number,
      duration: Number,
      lastAccessedAt: Date
    },
    default: new Map()
  },
  
  currentTopicIndex: {
    type: Number,
    default: 0
  },
  
  currentLectureIndex: {
    type: Number,
    default: 0
  },
  
  progressPercentage: {
    type: Number,
    default: 0
  },
  
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  
  // ... existing fields ...
  updatedAt: { type: Date, default: Date.now }
});
```

---

### Step 2: Create Progress Controller
**File:** `Controllers/progressController.js` (NEW FILE)

```javascript
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

exports.saveProgress = async (req, res) => {
  try {
    const { courseId, completedLectures, videoProgress, currentTopic, currentLecture, lastAccessedAt } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID required" });
    }

    // Find enrollment - user must be enrolled to save progress
    let enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: "You must be enrolled in this course to save progress" 
      });
    }

    // Parse completedLectures format: "0-0" becomes {topicIndex: 0, lectureIndex: 0}
    enrollment.completedLectures = (completedLectures || []).map(lectureId => {
      const [topicIdx, lectureIdx] = lectureId.split('-');
      return {
        topicIndex: parseInt(topicIdx),
        lectureIndex: parseInt(lectureIdx),
        completedAt: new Date()
      };
    });

    // Store video progress as Map
    const videoMap = new Map();
    if (videoProgress) {
      Object.entries(videoProgress).forEach(([lectureId, progress]) => {
        videoMap.set(lectureId, {
          currentTime: progress.current,
          duration: progress.duration,
          lastAccessedAt: new Date()
        });
      });
    }
    enrollment.videoProgress = videoMap;

    // Update current position
    enrollment.currentTopicIndex = currentTopic ?? 0;
    enrollment.currentLectureIndex = currentLecture ?? 0;
    enrollment.lastAccessedAt = new Date(lastAccessedAt) || new Date();
    enrollment.updatedAt = new Date();

    // Calculate progress percentage
    const totalCompletedLectures = (completedLectures || []).length;
    
    // Fetch course to get total lecture count
    const course = await Course.findById(courseId).populate('Topics');
    let totalLectures = 0;
    if (course && course.Topics) {
      totalLectures = course.Topics.reduce((sum, topic) => {
        return sum + (topic.lectures?.length || 0);
      }, 0);
    }

    enrollment.progressPercentage = totalLectures > 0 
      ? Math.round((totalCompletedLectures / totalLectures) * 100)
      : 0;

    await enrollment.save();

    res.json({
      success: true,
      message: "Progress saved",
      progress: {
        completedLectures: completedLectures || [],
        currentTopic: enrollment.currentTopicIndex,
        currentLecture: enrollment.currentLectureIndex,
        progressPercentage: enrollment.progressPercentage
      }
    });

  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error saving progress",
      error: error.message 
    });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: "No progress found" 
      });
    }

    // Convert Map back to object for JSON response
    const videoProgress = {};
    if (enrollment.videoProgress) {
      enrollment.videoProgress.forEach((value, key) => {
        videoProgress[key] = {
          current: value.currentTime,
          duration: value.duration,
          lastAccessedAt: value.lastAccessedAt
        };
      });
    }

    // Convert completed lectures back to frontend format
    const completedLecturesArray = (enrollment.completedLectures || [])
      .map(cl => `${cl.topicIndex}-${cl.lectureIndex}`);

    res.json({
      success: true,
      progress: {
        completedLectures: completedLecturesArray,
        videoProgress: videoProgress,
        currentTopic: enrollment.currentTopicIndex,
        currentLecture: enrollment.currentLectureIndex,
        progressPercentage: enrollment.progressPercentage,
        lastAccessedAt: enrollment.lastAccessedAt
      }
    });

  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching progress",
      error: error.message 
    });
  }
};

module.exports = exports;
```

---

### Step 3: Create Progress Routes
**File:** `routes/progressRoutes.js` (NEW FILE)

```javascript
const express = require("express");
const { saveProgress, getProgress } = require("../Controllers/progressController");
const { verifyToken } = require("../Middleware/auth");

const router = express.Router();

// Middleware to require authentication
router.use(verifyToken);

// Save student progress
router.post("/save", saveProgress);

// Get student progress for a course
router.get("/:courseId", getProgress);

module.exports = router;
```

---

### Step 4: Register Routes in Main Server File
**File:** `server.js` or `index.js`

Add this line with your other route registrations:

```javascript
// ... other imports ...
const progressRoutes = require("./routes/progressRoutes");

// ... after other app.use() routes ...

// Progress tracking routes
app.use("/api/progress", progressRoutes);
```

---

## Summary of Changes

| Item | File | Type | Status |
|------|------|------|--------|
| Frontend Progress Logic | `CourseLearning.jsx` | Modified | ✅ DONE |
| Enrollment Model | `models/Enrollment.js` | Modified | ⏳ TODO |
| Progress Controller | `Controllers/progressController.js` | New File | ⏳ TODO |
| Progress Routes | `routes/progressRoutes.js` | New File | ⏳ TODO |
| Main Server | `server.js` or `index.js` | Modified | ⏳ TODO |

---

## Testing Endpoints

### Save Progress
```bash
curl -X POST http://localhost:5000/api/progress/save \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "693acfd0ee4bdc7e86aaf44a",
    "completedLectures": ["0-0", "0-1"],
    "videoProgress": {
      "0-0": { "current": 450.5, "duration": 1500 },
      "0-1": { "current": 0, "duration": 1200 }
    },
    "currentTopic": 0,
    "currentLecture": 1,
    "lastAccessedAt": "2025-12-11T10:30:00Z"
  }'
```

### Load Progress
```bash
curl -X GET http://localhost:5000/api/progress/693acfd0ee4bdc7e86aaf44a \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## How It Works - Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER OPENS COURSE                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ CourseLearning Load  │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │ GET /api/progress/{courseId}     │
                    │ Load saved progress from DB      │
                    └──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │ Restore:                         │
                    │ - Completed lectures             │
                    │ - Video positions                │
                    │ - Current topic/lecture          │
                    └──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
         ┌─────────────────┐   ┌──────────────────────┐
         │ User Watches    │   │ User Marks Complete  │
         │ Video           │   └──────────────────────┘
         │ (auto-update)   │             │
         └─────────────────┘             │
                    │                     │
                    ├─────────┬───────────┤
                    │         │           │
        Every 30s   │    Immediate  Auto-save
        Auto-save   │    on complete  on unload
                    │         │           │
                    └─────────┼───────────┘
                              │
                              ▼
                    ┌──────────────────────────────────┐
                    │ POST /api/progress/save          │
                    │ Update Enrollment document with: │
                    │ - completedLectures              │
                    │ - videoProgress                  │
                    │ - currentTopicIndex              │
                    │ - progressPercentage             │
                    └──────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────────────┐
                    │ MongoDB Enrollment Doc Updated   │
                    │ ✅ Progress Persisted            │
                    └──────────────────────────────────┘
```

---

## Timeline

1. **User Session Start**: Load progress from DB
2. **During Learning**: Auto-save every 30 seconds
3. **Mark Complete**: Save immediately
4. **Before Leave**: Save before unload
5. **Next Session**: All progress restored from DB

---

## Error Handling

**If Save Fails (No Internet):**
- ✅ Error logged to console
- ✅ App continues working with local state
- ✅ Auto-save retries every 30 seconds
- ✅ Data not lost during session

**If Load Fails (First Time / No Previous Progress):**
- ✅ User starts from beginning
- ✅ No error shown (normal)
- ✅ First save creates initial progress

**If Not Enrolled:**
- ❌ POST `/api/progress/save` returns 403 Forbidden
- ❌ GET `/api/progress/{courseId}` returns 404 Not Found

---

## Next Steps for You

1. ✅ Frontend is ready (CourseLearning.jsx)
2. ⏳ Update Enrollment model (add progress fields)
3. ⏳ Create progressController.js
4. ⏳ Create progressRoutes.js
5. ⏳ Register routes in server.js
6. ⏳ Test with the curl commands above
7. ⏳ Verify progress persists on page reload

---

## Questions?

The frontend code is fully implemented and waiting for the backend endpoints. Once you create the 4 backend items above, everything will work seamlessly!

