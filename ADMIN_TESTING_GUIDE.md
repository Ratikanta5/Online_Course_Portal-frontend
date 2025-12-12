# 🧪 Admin Panel - Testing Guide

## Quick Start Test

### **Step 1: Login**
```
URL: http://localhost:5174/login
Email: (your admin email)
Password: (your password)
Role: Should be "admin" 
```

### **Step 2: Go to Admin Panel**
```
URL: http://localhost:5174/admin
or click "Dashboard" → "Admin Panel"
```

### **Step 3: Click "Course Management"**
You should see:
- ✅ List of PENDING courses
- ✅ Course images
- ✅ Course titles, descriptions
- ✅ Lecturer names
- ✅ Prices, ratings, categories
- ✅ Green "Approve" button
- ✅ Red "Reject" button

### **Step 4: Test Approve**
1. Click any "Approve" button
2. Modal opens with:
   - Course title
   - Text area for feedback (optional)
   - Cancel and Approve buttons
3. Add optional feedback
4. Click "Approve"
5. ✅ Course disappears from list (marked as approved)

### **Step 5: Test Reject**
1. Click any "Reject" button
2. Modal opens with:
   - Course title
   - Text area for reason (REQUIRED)
   - Cancel and Reject buttons
3. Add rejection reason
4. Click "Reject"
5. ✅ Course disappears from list (marked as rejected)

---

## What You Should See

### **Pending Courses View**
```
┌─────────────────────────────────────────────────────┐
│ Course Management                                    │
│ Review and approve pending courses                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 🔍 Search by course title...   📋 All Statuses  ✓  │
│                                                      │
│ ⚠️  5 pending courses waiting for your approval      │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Course Image] Course Title 1        [PENDING]      │
│                By Lecturer Name                     │
│                Description...                        │
│                $99.99  ⭐4.5  Category              │
│                3 topics • 12 reviews                │
│                         [Approve] [Reject]          │
│                                                      │
│ [Course Image] Course Title 2        [PENDING]      │
│                By Lecturer Name                     │
│                ...                                   │
│                         [Approve] [Reject]          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### **Approve Modal**
```
┌─────────────────────────────────────────┐
│ Approve Course?                         │
│ Python Basics for Beginners             │
│                                         │
│ [Optional approval feedback ...]        │
│                                         │
│ [Cancel]  [Approve ✓]                   │
└─────────────────────────────────────────┘
```

### **Reject Modal**
```
┌─────────────────────────────────────────┐
│ Reject Course?                          │
│ Python Basics for Beginners             │
│                                         │
│ [Please provide rejection reason ...]   │
│                                         │
│ [Cancel]  [Reject ✗]                    │
└─────────────────────────────────────────┘
```

---

## Test Scenarios

### **Scenario 1: Approve Course**
```
Given: Admin is on Course Management page
When: Admin clicks "Approve" on a pending course
And: Admin adds optional feedback
And: Admin clicks "Approve" button
Then: Modal closes
And: Course is removed from pending list
```

### **Scenario 2: Reject Course**
```
Given: Admin is on Course Management page
When: Admin clicks "Reject" on a pending course
And: Admin enters a rejection reason
And: Admin clicks "Reject" button
Then: Modal closes
And: Course is removed from pending list
```

### **Scenario 3: Search Courses**
```
Given: Admin is on Course Management page
When: Admin types in search box "Python"
Then: List filters to show only courses with "Python" in title
```

### **Scenario 4: Filter by Status**
```
Given: Admin is on Course Management page
When: Admin selects "Pending Approval" in status filter
Then: Only pending courses are shown

When: Admin selects "Approved" in status filter
Then: Only approved courses are shown
```

### **Scenario 5: No Pending Courses**
```
Given: All courses are approved or rejected
When: Admin visits Course Management page
Then: Empty state message appears
And: Message says "No Pending Courses"
```

---

## Data Displayed

### **Each Course Card Shows:**
- ✅ Course Image
- ✅ Course Title
- ✅ Course Description (first 100 chars)
- ✅ Lecturer Name
- ✅ Course Price
- ✅ Average Rating
- ✅ Course Category
- ✅ Number of Topics
- ✅ Number of Reviews
- ✅ Status Badge (Pending/Approved/Rejected)

### **Data Source:**
All data comes from:
```
GET /api/lecturer/courses
```

Which queries your MongoDB:
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  courseImage: { url, filename },
  price: Number,
  category: String,
  courseStatus: "pending" | "approved" | "rejected",
  createdBy: ObjectId (Lecturer),
  topics: Array,
  averageRating: Number,
  totalReviews: Number,
  createdAt: Date
}
```

---

## Known Features

### **Working Now ✅**
- Display pending courses
- Show course details
- Approve button UI
- Reject button UI
- Modals for approve/reject
- Search functionality
- Filter by status
- Responsive design
- Error handling
- Loading states
- Empty states

### **Not Yet Implemented ⏳**
- Actually update database on approve/reject
- Send email notifications
- Approval history
- Bulk operations
- Advanced filtering
- Bulk approve/reject

---

## Testing Checklist

- [ ] Can login with admin credentials
- [ ] Can access Admin Panel
- [ ] Can see Course Management section
- [ ] Pending courses are displayed
- [ ] Course images load
- [ ] Course information is correct
- [ ] Search works
- [ ] Status filter works
- [ ] Approve button opens modal
- [ ] Reject button opens modal
- [ ] Modal forms are functional
- [ ] Page is responsive on mobile
- [ ] Page is responsive on tablet
- [ ] Page is responsive on desktop
- [ ] Error messages display properly
- [ ] Loading spinner shows on fetch
- [ ] Empty state shows when no courses
- [ ] Status badges show correct color
- [ ] Lecturer names display correctly

---

## Troubleshooting

### **If courses don't load:**
1. Check console (F12) for errors
2. Verify backend is running on port 8080
3. Verify `/api/lecturer/courses` endpoint exists
4. Check token is valid

### **If images don't load:**
1. Check image URLs are valid
2. Verify Cloudinary is configured
3. Check CORS settings

### **If buttons don't work:**
1. Check console for errors
2. Verify approve/reject functions exist
3. Check network tab for API calls

### **If modals don't appear:**
1. Check Framer Motion is installed
2. Verify component rendering
3. Check CSS classes are loading

---

## Browser Console (F12)

### **Look for these logs:**
```javascript
// Successful API call
"GET /api/lecturer/courses" → 200 OK

// Course data loaded
Courses: [...]

// User clicked approve
"Approving course {courseId} with feedback: ..."

// User clicked reject
"Rejecting course {courseId} with reason: ..."
```

### **Errors to watch for:**
```javascript
// API not reachable
"ECONNREFUSED: Connection refused"

// Token invalid
"401 Unauthorized"

// CORS issue
"Access to XMLHttpRequest blocked by CORS"

// Missing endpoint
"404 Not Found"
```

---

## Backend Integration

### **When ready to fully implement approval:**

1. **Create endpoint:**
```javascript
PUT /api/admin/courses/:courseId/approve
Body: { feedback: String }
Response: { success: true, course: {...} }
```

2. **Update Course:**
```javascript
Course.findByIdAndUpdate(courseId, {
  courseStatus: 'approved',
  approvedBy: adminId,
  approvalFeedback: feedback,
  approvedAt: new Date()
})
```

3. **Update adminApi.js:**
```javascript
export const approveCourse = async (courseId, feedback) => {
  const response = await adminAxios.put(
    `/api/admin/courses/${courseId}/approve`,
    { feedback }
  );
  return response.data;
};
```

---

## Success Criteria

✅ **Admin Panel is successful when:**
1. Pending courses display correctly
2. Approve/reject buttons work UI-wise
3. Modals open and close properly
4. Forms validate input
5. Page is responsive
6. No errors in console
7. Data comes from your database
8. Professional appearance

---

## Next Phase

After testing UI works perfectly:
1. Create backend endpoints
2. Update course status in DB
3. Send email notifications
4. Add audit logging
5. Deploy to production

---

**Test Status: READY FOR UI TESTING** ✅

The admin panel frontend is fully functional and ready to test!
