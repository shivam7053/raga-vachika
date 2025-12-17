'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Course,
  CourseContent,
  YoutubeContent,
  ZoomContent,
  Test,
  MCQ,
  MCQOption,
} from "@/types/masterclass";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Modal,
  Paper,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControl,
  TextField,
  useTheme,
  Typography,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloseIcon from '@mui/icons-material/Close';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [notifyUsers, setNotifyUsers] = useState(false); // ✅ NEW: State for notification checkbox
  const theme = useTheme();
 
  // State for the main Course form
  const [formData, setFormData] = useState<any>({
    title: "",
    speaker_name: "",
    speaker_designation: "",
    description: "",
    price: 0,
    type: "free" as "free" | "paid",
    thumbnail_url: "",
    demo_video_url: "", // ✅ NEW: State for the demo video URL
  });
 
  // State for the CourseContent modal (for YouTube/Zoom)
  const [contentFormData, setContentFormData] = useState<
    Partial<YoutubeContent> | Partial<ZoomContent>
  >({
    source: "youtube",
    title: "",
  });

  // State for Test and MCQ Modals
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [mcqFormData, setMcqFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOptionIndex: "0",
  });

  const [currentContent, setCurrentContent] = useState<CourseContent[]>([]);
  const [editingContentIndex, setEditingContentIndex] = useState<
    number | null
  >(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "Courses"));
      const courseList: Course[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const purchasedByUsers: string[] = Array.isArray(data.purchased_by_users)
          ? data.purchased_by_users.filter(id => typeof id === 'string')
          : [];
 
        courseList.push({
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          speaker_name: data.speaker_name || "",
          speaker_designation: data.speaker_designation || "",
          thumbnail_url: data.thumbnail_url || "",
          price: data.price || 0,
          type: data.type || "free",
          created_at:
            data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
          content: data.content || [],
          purchased_by_users: purchasedByUsers,
          demo_video_url: data.demo_video_url || "", // ✅ NEW: Fetch the demo video URL
        } as Course);
      }

      setCourses(courseList);
    } catch (err) {
      console.error("Error fetching courses:", err);
      alert("❌ Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddContent = () => {
    // Validation for content form
    if (!contentFormData.title || !contentFormData.title.trim()) { 
      return alert("Content title is required");
    }
 
    if (contentFormData.source === 'youtube') {
      if (!contentFormData.youtube_url || !contentFormData.youtube_url.trim()) {
        return alert("YouTube URL is required for YouTube content.");
      }
    } else if (contentFormData.source === 'zoom') {
      if (!contentFormData.zoom_meeting_id || !contentFormData.zoom_meeting_id.trim()) {
        return alert("Zoom Meeting ID is required for Zoom content.");
      }
    }

    const newContent: CourseContent = {
      id: `video_${Date.now()}`,
      ...contentFormData,
      notes_url: contentFormData.notes_url || "",
      tests: currentTest ? [currentTest] : [],
      order: currentContent.length,
    } as CourseContent; // Casting is okay here as we've validated

    if (editingContentIndex !== null) {
      const updated = [...currentContent];
      updated[editingContentIndex] = newContent;
      setCurrentContent(updated);
      setEditingContentIndex(null);
    } else {
      setCurrentContent([...currentContent, newContent]);
    }

    // Reset modal form
    setContentFormData({
      source: "youtube",
      title: "",
    });
    setCurrentTest(null);
    setShowContentModal(false);
  };

  const handleEditContent = (index: number) => {
    const contentItem = currentContent[index];
    setContentFormData({
      ...contentItem,
    });
    setCurrentTest(contentItem.tests?.[0] || null);
    setEditingContentIndex(index);
    setShowContentModal(true);
  };

  const handleDeleteContent = (index: number) => {
    if (confirm("Are you sure you want to delete this content item?")) {
      const updatedContent = currentContent.filter((_, i) => i !== index);
      // Re-order the remaining items
      setCurrentContent(updatedContent.map((item, idx) => ({ ...item, order: idx })));
    }
  };

  const handleOpenTestModal = () => {
    if (!currentTest) {
      setCurrentTest({ id: `test_${Date.now()}`, title: "", mcqs: [] });
    }
    setShowTestModal(true);
  };

  const handleAddMCQ = () => {
    if (!mcqFormData.question || mcqFormData.options.some(opt => !opt)) {
      return alert("Please fill in the question and all four options.");
    }
    if (!currentTest) return;

    const newMCQ: MCQ = {
      id: `mcq_${Date.now()}`,
      question: mcqFormData.question,
      options: mcqFormData.options.map((opt, i) => ({ id: `opt_${i}`, text: opt })),
      correctOptionId: `opt_${mcqFormData.correctOptionIndex}`,
    };

    setCurrentTest({
      ...currentTest,
      mcqs: [...currentTest.mcqs, newMCQ],
    });

    // Reset MCQ form
    setMcqFormData({ question: "", options: ["", "", "", ""], correctOptionIndex: "0" });
  };

  const handleSaveTest = () => {
    if (!currentTest || !currentTest.title) {
      return alert("Please provide a title for the test.");
    }
    // The currentTest state is already updated, we just need to close the modal.
    // The test will be saved with the content item.
    setShowTestModal(false);
    // Update the content form data to include the test
    const updatedContentFormData = { ...contentFormData, tests: [currentTest] };
    setContentFormData(updatedContentFormData);
  };

  const validateForm = () => {
    if (!formData.title || !formData.title.trim()) {
      alert("Title is required");
      return false;
    }
    if (!formData.speaker_name || !formData.speaker_name.trim()) {
      alert("Speaker name is required");
      return false;
    }

    if (currentContent.length === 0) {
      alert(
        "A course must have at least one piece of content (a video or a zoom session)."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const dataToSave: any = {
        title: formData.title,
        speaker_name: formData.speaker_name,
        speaker_designation: formData.speaker_designation,
        description: formData.description,
        price: Number(formData.price) || 0,
        type: formData.type,
        thumbnail_url: formData.thumbnail_url,
        demo_video_url: formData.demo_video_url, // ✅ NEW: Save the demo video URL
        content: currentContent,
      };

      if (editingId) {
        await updateDoc(doc(db, "Courses", editingId), dataToSave);
        alert("✅ Course updated successfully!");

        // ✅ NEW: Trigger notification if the checkbox is checked
        if (notifyUsers) {
          try {
            const response = await fetch('/api/notify-course-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseId: editingId }),
            });

            if (!response.ok) {
              throw new Error('Failed to send notifications.');
            }

            alert('✉️ Notifications are being sent to enrolled users.');
          } catch (notificationError) {
            console.error('Notification Error:', notificationError);
            alert('❌ Could not send notifications. Please check the server logs.');
          }
        }
      } else {
        await addDoc(collection(db, "Courses"), {
          ...dataToSave,
          purchased_by_users: [],
          created_at: serverTimestamp(),
        });
        alert("✅ Course added successfully!");
      }

      // reset
      setFormData({
        title: "",
        speaker_name: "",
        speaker_designation: "",
        description: "",
        price: 0,
        type: "free",
        thumbnail_url: "",
        demo_video_url: "",
      });
      setCurrentContent([]);
      setEditingId(null);
      setNotifyUsers(false); // ✅ NEW: Reset notification state
      fetchCourses();
    } catch (err) {
      console.error('Error saving course:', err);
      alert("❌ Failed to save course.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await deleteDoc(doc(db, "Courses", id));
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('❌ Failed to delete course.');
    }
  };

  const handleEdit = (cls: Course) => {
    setEditingId(cls.id);
    setFormData({
      title: cls.title,
      speaker_name: cls.speaker_name,
      speaker_designation: cls.speaker_designation,
      description: cls.description || "",
      price: cls.price || 0,
      type: cls.type || "free",
      thumbnail_url: cls.thumbnail_url || "",
      demo_video_url: cls.demo_video_url || "", // ✅ NEW: Populate form on edit
    });

    setCurrentContent(cls.content || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      speaker_name: "",
      speaker_designation: "",
      description: "",
      price: 0,
      type: "free",
      thumbnail_url: "",
      demo_video_url: "",
    });
    setNotifyUsers(false); // ✅ NEW: Reset notification state
    setCurrentContent([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, color: 'primary.main' }}>
          🎓 Manage Courses
        </Typography>

      {/* Add/Edit Form */}
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 5, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
            {editingId ? "✏️ Edit Course" : "➕ Add New Course"}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Title *" name="title" value={formData.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Speaker Name *" name="speaker_name" value={formData.speaker_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Speaker Designation" name="speaker_designation" value={formData.speaker_designation} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select fullWidth name="type" value={formData.type} onChange={handleChange}>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </Grid>
            {formData.type === 'paid' && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Price (₹) *" name="price" value={formData.price || ''} onChange={handleChange} />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Thumbnail URL" name="thumbnail_url" value={formData.thumbnail_url} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Demo Video URL (Optional, YouTube)" name="demo_video_url" value={formData.demo_video_url} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Description" name="description" value={formData.description} onChange={handleChange} />
            </Grid>
          </Grid>

        {/* Content Section (Videos and Zoom sessions) */}
          <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Content ({currentContent.length})</Typography>
              <Button
              type="button"
              onClick={() => setShowContentModal(true)}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              Add Content
              </Button>
            </Box>

            <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'grey.100', borderRadius: 2 }}>
            {currentContent.map((item, index) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 'medium' }}>{index + 1}. {item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                    {item.source === "youtube"
                      ? (item as YoutubeContent).youtube_url
                      : `Zoom ID: ${(item as ZoomContent).zoom_meeting_id}`}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleEditContent(index)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteContent(index)} color="error"><DeleteIcon /></IconButton>
                    </Box>
                  </Paper>
            ))}
            </Box>
          </Box>

        {/* ✅ NEW: Notification Checkbox - only shows when editing */}
        {editingId && (
            <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                  checked={notifyUsers}
                  onChange={(e) => setNotifyUsers(e.target.checked)}
                    sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 'medium' }}>Notify enrolled users</Typography>
                    <Typography variant="body2" color="text.secondary">Check this box to send an email notification about this update.</Typography>
                  </Box>
                }
              />
            </Box>
        )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button type="submit" variant="contained" color="primary" sx={{ flex: 1 }}>
              {editingId ? "Update Course" : "Add Course"}
            </Button>
          {editingId && (
              <Button
              type="button"
              onClick={cancelEdit}
                variant="outlined"
                sx={{ flex: 1 }}
            >
              Cancel
              </Button>
          )}
          </Box>
        </Paper>

      {/* Content Modal */}
        <Modal open={showContentModal} onClose={() => setShowContentModal(false)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 600, p: 3, maxHeight: '90vh', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{editingContentIndex !== null ? 'Edit Content' : 'Add New Content'}</Typography>
              <IconButton onClick={() => {
                  setShowContentModal(false);
                  setEditingContentIndex(null);
                  setContentFormData({ source: "youtube", title: "" });
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                value={contentFormData.source}
                onChange={(e) =>
                  {
                    const newSource = e.target.value as "youtube" | "zoom";
                    const baseState = {
                      title: contentFormData.title,
                      description: contentFormData.description,
                    };
                    setContentFormData({ source: newSource, ...baseState });
                  }
                }
                  fullWidth
              >
                  <MenuItem value="youtube">YouTube Video</MenuItem>
                  <MenuItem value="zoom">Zoom Session</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Content Title *" value={contentFormData.title || ""} onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })} />
              </Grid>

              {contentFormData.source === "youtube" && (
                <>
                  <Grid item xs={12}>
                    <TextField fullWidth label="YouTube URL *" value={(contentFormData as Partial<YoutubeContent>).youtube_url || ""} onChange={(e) => setContentFormData({ ...contentFormData, youtube_url: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="date" label="Scheduled Date (Optional)" value={(contentFormData as Partial<YoutubeContent>).scheduled_date || ""} onChange={(e) => setContentFormData({ ...contentFormData, scheduled_date: e.target.value })} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="time" label="Scheduled Time (Optional)" value={(contentFormData as Partial<YoutubeContent>).scheduled_time || ""} onChange={(e) => setContentFormData({ ...contentFormData, scheduled_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </>
              )}

              {contentFormData.source === "zoom" && (
                <>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Zoom Join Link" value={(contentFormData as Partial<ZoomContent>).zoom_link || ""} onChange={(e) => setContentFormData({ ...contentFormData, zoom_link: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Zoom Meeting ID *" value={(contentFormData as Partial<ZoomContent>).zoom_meeting_id || ""} onChange={(e) => setContentFormData({ ...contentFormData, zoom_meeting_id: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Zoom Passcode" value={(contentFormData as Partial<ZoomContent>).zoom_passcode || ""} onChange={(e) => setContentFormData({ ...contentFormData, zoom_passcode: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth type="datetime-local" label="Scheduled Date & Time" value={(contentFormData as Partial<ZoomContent>).scheduled_date || ""} onChange={(e) => setContentFormData({ ...contentFormData, scheduled_date: e.target.value })} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField fullWidth label="Duration (e.g., 45 min)" value={contentFormData.duration || ""} onChange={(e) => setContentFormData({ ...contentFormData, duration: e.target.value })} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Notes Google Drive Link" value={contentFormData.notes_url || ""} onChange={(e) => setContentFormData({ ...contentFormData, notes_url: e.target.value })} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Content Description" value={contentFormData.description} onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })} />
              </Grid>

              <Grid item xs={12}>
                <Button onClick={handleAddContent} variant="contained" color="secondary" fullWidth>
                  {editingContentIndex !== null ? "Update Content" : "Add Content"}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button onClick={handleOpenTestModal} variant="outlined" fullWidth startIcon={<LibraryBooksIcon />}>
                  Manage Tests ({currentTest?.mcqs?.length || 0} MCQs)
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Modal>

      {/* Test Management Modal */}
        <Modal open={showTestModal} onClose={() => setShowTestModal(false)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 700, p: 3, maxHeight: '90vh', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Manage Test</Typography>
              <IconButton onClick={() => setShowTestModal(false)}><CloseIcon /></IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Test Title"
                  value={currentTest?.title || ""}
                  onChange={(e) => setCurrentTest(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </Grid>

              {/* Display existing MCQs */}
              <Grid item xs={12}>
                <Typography variant="h6">Questions ({currentTest?.mcqs?.length || 0})</Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                  {currentTest?.mcqs.map((mcq, index) => (
                    <Typography key={mcq.id} variant="body2">{index + 1}. {mcq.question}</Typography>
                  ))}
                </Box>
              </Grid>

              {/* Add new MCQ form */}
              <Grid item xs={12} sx={{ borderTop: 1, borderColor: 'divider', pt: '16px !important' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Add New Question</Typography>
                <TextField
                  fullWidth
                  label="Question"
                  value={mcqFormData.question}
                  onChange={(e) => setMcqFormData(prev => ({ ...prev, question: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <FormControl component="fieldset">
                  <RadioGroup
                    aria-label="correct-answer"
                    name="correct-answer-group"
                    value={mcqFormData.correctOptionIndex}
                    onChange={(e) => setMcqFormData(prev => ({ ...prev, correctOptionIndex: e.target.value }))}
                  >
                    {mcqFormData.options.map((opt, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormControlLabel value={String(index)} control={<Radio />} label={`Option ${index + 1}`} />
                        <TextField
                          size="small"
                          fullWidth
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...mcqFormData.options];
                            newOptions[index] = e.target.value;
                            setMcqFormData(prev => ({ ...prev, options: newOptions }));
                          }}
                        />
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button onClick={handleAddMCQ} variant="outlined" fullWidth>
                  Add Question
                </Button>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  onClick={handleSaveTest}
                  variant="contained"
                  fullWidth
                  color="primary"
                >
                  Save Test and Close
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Modal>

      {/* Display Courses */}
      {loading ? (
        <Typography sx={{ textAlign: 'center', my: 5 }}>Loading...</Typography>
      ) : courses.length === 0 ? (
        <Typography sx={{ textAlign: 'center', my: 5 }}>No courses found.</Typography>
      ) : (
          <Grid container spacing={3}>
            {courses.map((cls) => (
              <Grid item xs={12} sm={6} md={4} key={cls.id}>
                <Paper sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{cls.title}</Typography>
                    <Chip
                      label={cls.type === 'paid' ? `₹${cls.price}` : 'FREE'}
                      color={cls.type === 'paid' ? 'secondary' : 'success'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {cls.speaker_name} • {cls.speaker_designation || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <OndemandVideoIcon fontSize="small" /> {cls.content?.length || 0} content items
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>Created: {new Date(cls.created_at).toLocaleDateString()}</Typography>

                  <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'grey.100', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 'medium', mb: 0.5 }}>
                      👥 Enrolled Users ({cls.purchased_by_users?.length || 0})
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => router.push(`/admin/enrolled/${cls.id}`)}
                      color="secondary"
                    >
                      View Enrolled Users →
                    </Button>
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => handleEdit(cls)} startIcon={<EditIcon />}>Edit</Button>
                    <Button onClick={() => handleDelete(cls.id!)} color="error" startIcon={<DeleteIcon />}>Delete</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
      )}
      </Container>
    </Box>
  );
}
