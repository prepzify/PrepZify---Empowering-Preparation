import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import { db, storage, handleFirestoreError, OperationType } from "../../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Github, 
  Linkedin, 
  Award, 
  CheckCircle2, 
  Target, 
  Star,
  Edit2,
  Save,
  X,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: any;
}

export default function Profile() {
  const { user, profile: authProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(authProfile || {
    name: "User",
    email: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    bio: "",
    skills: [],
    achievements: []
  });

  useEffect(() => {
    if (authProfile && !isEditing) {
      setLocalProfile(authProfile);
      setSkills(authProfile.skills || []);
      setAchievements(authProfile.achievements || []);
    }
  }, [authProfile, isEditing]);

  const stats = [
    { label: "Total Points", value: (localProfile.stats?.points || 0).toLocaleString(), icon: <Star size={18} className="text-amber-500 fill-amber-500" /> },
    { label: "Problems Solved", value: localProfile.stats?.problemsSolved || "0", icon: <CheckCircle2 size={18} className="text-green-500" /> },
    { label: "Avg. Score", value: `${localProfile.stats?.avgScore || 0}%`, icon: <Target size={18} className="text-indigo-500" /> },
    { label: "Badges Earned", value: localProfile.stats?.badgesEarned || "0", icon: <Award size={18} className="text-purple-500" /> },
  ];

  const formatGithubLink = (text: string) => {
    if (!text) return "#";
    if (text.startsWith("http")) return text;
    return `https://github.com/${text.replace("@", "")}`;
  };

  const formatLinkedinLink = (text: string) => {
    if (!text) return "#";
    if (text.startsWith("http")) return text;
    return `https://linkedin.com/in/${text}`;
  };

  const badges = localProfile.badges || [
    { name: "DSA Master", icon: "🔥", color: "bg-orange-100 text-orange-700" },
    { name: "Java Expert", icon: "☕", color: "bg-red-100 text-red-700" },
    { name: "Interview Ready", icon: "🤝", color: "bg-green-100 text-green-700" },
  ];
  
  const [skills, setSkills] = useState(localProfile.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Achievement State
  const [achievements, setAchievements] = useState<Achievement[]>(localProfile.achievements || []);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileName: ""
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedData = {
        name: localProfile.name || '',
        bio: localProfile.bio || '',
        location: localProfile.location || '',
        website: localProfile.website || '',
        github: localProfile.github || '',
        linkedin: localProfile.linkedin || '',
        skills: skills || [],
        achievements: achievements || [],
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, updatedData);
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAchievement = () => {
    if (!achievementForm.title.trim()) return;

    const newAchievement: Achievement = {
      id: editingAchievementId || Date.now().toString(),
      title: achievementForm.title,
      description: achievementForm.description,
      fileUrl: achievementForm.fileUrl,
      fileName: achievementForm.fileName,
      createdAt: editingAchievementId 
        ? (achievements.find(a => a.id === editingAchievementId)?.createdAt || new Date().toISOString())
        : new Date().toISOString()
    };

    if (editingAchievementId) {
      setAchievements(prev => prev.map(a => a.id === editingAchievementId ? newAchievement : a));
    } else {
      setAchievements(prev => [newAchievement, ...prev]);
    }

    setAchievementForm({ title: "", description: "", fileUrl: "", fileName: "" });
    setIsAddingAchievement(false);
    setEditingAchievementId(null);
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      fileUrl: achievement.fileUrl || "",
      fileName: achievement.fileName || ""
    });
    setEditingAchievementId(achievement.id);
    setIsAddingAchievement(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const fileRef = ref(storage, `users/${user.uid}/achievements/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        setAchievementForm(prev => ({
          ...prev,
          fileName: file.name,
          fileUrl: downloadUrl
        }));
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

const profile = localProfile;
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
        <CardContent className="relative pt-16 pb-8 px-8">
          <div className="absolute -top-16 left-8">
            <div className="h-32 w-32 rounded-2xl bg-white p-1 shadow-lg">
              <div className="h-full w-full rounded-xl bg-indigo-100 flex items-center justify-center text-4xl font-black text-indigo-600">
                {(localProfile.name || 'U').charAt(0)}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{localProfile.name}</h2>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  Rank #{localProfile.stats?.globalRank || '?'}
                </Badge>
              </div>
              <p className="text-gray-500 max-w-2xl">{localProfile.bio}</p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={14} />
                  {localProfile.location || 'Add Location'}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} />
                  {localProfile.email}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <LinkIcon size={14} />
                  {localProfile.website || 'Add Website'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant={isEditing ? "outline" : "default"} 
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "" : "bg-indigo-600 hover:bg-indigo-700"}
              >
                {isEditing ? <X size={18} className="mr-2" /> : <Edit2 size={18} className="mr-2" />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              <Button variant="ghost" onClick={logout} className="text-red-500 hover:bg-red-50 hover:text-red-600 gap-2">
                 <LogOut size={18} />
                 Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Edit Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <Input value={localProfile.name} onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                <Input value={localProfile.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                <Input value={localProfile.location} onChange={(e) => setLocalProfile({...localProfile, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Website</label>
                <Input value={localProfile.website} onChange={(e) => setLocalProfile({...localProfile, website: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">GitHub Profile</label>
                <Input 
                  value={localProfile.github} 
                  placeholder="Username or full URL"
                  onChange={(e) => setLocalProfile({...localProfile, github: e.target.value})} 
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">LinkedIn Profile</label>
                <Input 
                  value={localProfile.linkedin} 
                  placeholder="Username or full URL"
                  onChange={(e) => setLocalProfile({...localProfile, linkedin: e.target.value})} 
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
              <Input value={localProfile.bio} onChange={(e) => setLocalProfile({...localProfile, bio: e.target.value})} />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats & Skills */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                  <div className="p-2 rounded-full bg-gray-50">{stat.icon}</div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Technical Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100 flex items-center gap-1 group"
                  >
                    {skill}
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
                
                {isAddingSkill ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <Input 
                      className="h-8 w-32 text-xs" 
                      placeholder="Skill name..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSkill();
                        if (e.key === 'Escape') setIsAddingSkill(false);
                      }}
                      autoFocus
                    />
                    <Button onClick={handleAddSkill} size="sm" className="h-8 bg-indigo-600">Add</Button>
                    <Button onClick={() => setIsAddingSkill(false)} variant="ghost" size="sm" className="h-8">
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsAddingSkill(true)}
                    className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    + Add Skill
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Social Profiles</CardTitle>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-8 text-xs text-indigo-600 hover:bg-indigo-50"
                >
                  Edit Links
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <a 
                href={formatGithubLink(localProfile.github)} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 group ${
                  localProfile.github 
                    ? "bg-white border-gray-200 hover:border-gray-900 hover:shadow-md text-gray-900" 
                    : "bg-gray-50 border-gray-100 text-gray-400 pointer-events-none"
                }`}
              >
                <Github size={22} className={localProfile.github ? "group-hover:scale-110 transition-transform" : ""} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">GitHub</span>
                  <span className="text-sm font-semibold">{localProfile.github ? (localProfile.github.includes('/') ? localProfile.github.split('/').filter(Boolean).pop() : localProfile.github) : "Not Configured"}</span>
                </div>
                {localProfile.github && <ExternalLink size={14} className="ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />}
              </a>
              <a 
                href={formatLinkedinLink(localProfile.linkedin)} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 group ${
                  localProfile.linkedin 
                    ? "bg-white border-blue-100 hover:border-blue-600 hover:shadow-md text-blue-600" 
                    : "bg-gray-50 border-gray-100 text-gray-400 pointer-events-none"
                }`}
              >
                <Linkedin size={22} className={localProfile.linkedin ? "group-hover:scale-110 transition-transform" : ""} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">LinkedIn</span>
                  <span className="text-sm font-semibold">{localProfile.linkedin ? (localProfile.linkedin.includes('/') ? localProfile.linkedin.split('/').filter(Boolean).pop() : localProfile.linkedin) : "Not Configured"}</span>
                </div>
                {localProfile.linkedin && <ExternalLink size={14} className="ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />}
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award size={20} className="text-indigo-600" />
                Achievements
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAddingAchievement(true)}
                className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Plus size={18} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {isAddingAchievement && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, height: 0 }}
                    animate={{ opacity: 1, scale: 1, height: "auto" }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl space-y-3 mb-4 overflow-hidden"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase">Title</label>
                      <Input 
                        placeholder="Achievement Title" 
                        value={achievementForm.title}
                        onChange={(e) => setAchievementForm({...achievementForm, title: e.target.value})}
                        className="h-8 text-sm border-indigo-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase">Description</label>
                      <Input 
                        placeholder="What did you achieve?" 
                        value={achievementForm.description}
                        onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                        className="h-8 text-sm border-indigo-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase">Evidence (Optional)</label>
                      <div className="flex gap-2">
                        <Input 
                          type="file" 
                          id="achievement-file"
                          className="hidden" 
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor="achievement-file"
                          className={`flex-1 h-8 px-3 border border-dashed border-indigo-200 rounded-md bg-white flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-xs text-gray-500 truncate">
                            {isUploading ? "Uploading..." : (achievementForm.fileName || "Upload image or PDF...")}
                          </span>
                          {isUploading ? <Loader2 size={14} className="animate-spin text-indigo-400" /> : <Upload size={14} className="text-indigo-400" />}
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setIsAddingAchievement(false);
                          setEditingAchievementId(null);
                        }}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleAddAchievement}
                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                      >
                        {editingAchievementId ? "Update" : "Add"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {achievements.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-xl">
                  <Award size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No achievements added yet.</p>
                  <Button 
                    variant="link" 
                    className="text-xs text-indigo-600"
                    onClick={() => setIsAddingAchievement(true)}
                  >
                    Add your first one
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="group p-3 border border-gray-100 bg-white rounded-xl hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{achievement.title}</h4>
                          <p className="text-sm text-gray-500 leading-tight">{achievement.description}</p>
                          {achievement.fileName && (
                            <a 
                              href={achievement.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 mt-2 p-1.5 px-2 bg-gray-50 rounded-md w-fit hover:bg-indigo-50 transition-colors"
                            >
                              <FileText size={12} className="text-indigo-500" />
                              <span className="text-[10px] font-medium text-gray-600 truncate max-w-[150px]">
                                {achievement.fileName}
                              </span>
                              <ExternalLink size={10} className="text-gray-400" />
                            </a>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                            onClick={() => handleEditAchievement(achievement)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Star size={20} className="text-amber-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, i) => (
                  <div key={i} className={`p-3 rounded-xl ${badge.color} flex flex-col items-center text-center gap-2 transition-transform hover:scale-105 cursor-default`}>
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{badge.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
